// =====================================================================
// Widget: two large parallel charged sheets (worksheet Q22).
// Each sheet's field has size |σ|/2ε0 everywhere and points away from a
// positive sheet. Rows 1–2 show each sheet alone in the three regions;
// row 3 is their sum. Values are in units of σ/2ε0.
// =====================================================================
import { useState } from 'react';
import { Arrow, Readout, Slider, WidgetFrame } from '../components/ui';
import { fmt } from '../lib/format';
import { sheetField, twoSheets } from '../physics';
import type { RegionField } from '../physics';

const W = 320;
const H = 214;
const X1 = 110;
const X2 = 210;
const SIGMA = 1e-9; // one "σ" = 1 nC/m²
const UNIT = sheetField(SIGMA); // σ/2ε0 in N/C
const init = { n1: 1, n2: -2 }; // worksheet Q22

const regions: { key: 'left' | 'middle' | 'right'; x: number; name: string }[] = [
  { key: 'left', x: 55, name: 'ซ้าย' },
  { key: 'middle', x: 160, name: 'ระหว่างแผ่น' },
  { key: 'right', x: 265, name: 'ขวา' },
];

/** "3σ/2ε₀ →" for a field given in units of σ/2ε0 */
function label(k: number): string {
  const a = Math.round(Math.abs(k));
  if (a === 0) return '0';
  const mag = a === 1 ? 'σ/2ε₀' : a === 2 ? 'σ/ε₀' : a % 2 === 0 ? `${a / 2}σ/ε₀` : `${a}σ/2ε₀`;
  return `${mag} ${k > 0 ? '→' : '←'}`;
}

const sigmaText = (n: number) => (n === 0 ? '0' : `${n > 0 ? '+' : '−'}${Math.abs(n) === 1 ? '' : Math.abs(n)}σ`);

function Sheet({ x, n, name }: { x: number; n: number; name: string }) {
  const cls = n > 0 ? 'pos' : n < 0 ? 'neg' : 'muted';
  return (
    <g>
      <line x1={x} y1={22} x2={x} y2={H - 6} className={`s-${cls}`} strokeWidth={5} />
      <text x={x} y={14} textAnchor="middle" style={{ fontWeight: 700, fill: `var(--${cls})` }}>
        {name}: {sigmaText(n)}
      </text>
    </g>
  );
}

export function ChargedSheets() {
  const [n1, setN1] = useState(init.n1);
  const [n2, setN2] = useState(init.n2);
  const res = twoSheets(n1 * SIGMA, n2 * SIGMA);

  const rows: { y: number; title: string; pick: (r: RegionField) => number; cls: string; w: number }[] = [
    { y: 58, title: 'จากแผ่น 1', pick: (r) => r.e1, cls: n1 >= 0 ? 'pos' : 'neg', w: 2 },
    { y: 108, title: 'จากแผ่น 2', pick: (r) => r.e2, cls: n2 >= 0 ? 'pos' : 'neg', w: 2 },
    { y: 172, title: 'รวม', pick: (r) => r.net, cls: 'field', w: 3.5 },
  ];

  return (
    <WidgetFrame
      title="แผ่นประจุขนานสองแผ่น"
      notice="สนามของแต่ละแผ่นมีขนาดเท่ากันทุกบริเวณ เปลี่ยนแค่ทิศเมื่อข้ามแผ่นนั้น แถวล่างคือผลรวมแบบเวกเตอร์ ลองตั้ง $+\sigma$ กับ $-\sigma$ แล้วดูสนามด้านนอก"
      onReset={() => {
        setN1(init.n1);
        setN2(init.n2);
      }}
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="stage pan-y">
        <line x1={0} y1={140} x2={W} y2={140} className="s-line" />
        <Sheet x={X1} n={n1} name="แผ่น 1" />
        <Sheet x={X2} n={n2} name="แผ่น 2" />
        {rows.map((row) => (
          <g key={row.title}>
            <text x={4} y={row.y - 16} className="small mut">
              {row.title}
            </text>
            {regions.map((rg) => {
              const k = row.pick(res[rg.key]) / UNIT;
              const half = Math.min(44, 8 * Math.abs(k));
              return (
                <g key={rg.key}>
                  {Math.abs(k) < 1e-9 ? (
                    <circle cx={rg.x} cy={row.y} r={3} className="f-muted" />
                  ) : (
                    <Arrow
                      x1={rg.x - Math.sign(k) * half}
                      y1={row.y}
                      x2={rg.x + Math.sign(k) * half}
                      y2={row.y}
                      cls={row.cls}
                      w={row.w}
                      head={row.w * 3}
                    />
                  )}
                  <text x={rg.x} y={row.y + 18} textAnchor="middle" className="small">
                    {label(k)}
                  </text>
                </g>
              );
            })}
          </g>
        ))}
      </svg>
      <div className="controls">
        <Slider label="แผ่น 1 (ซ้าย) $\sigma_1$" value={n1} min={-3} max={3} step={1} onChange={setN1} show={sigmaText(n1)} />
        <Slider label="แผ่น 2 (ขวา) $\sigma_2$" value={n2} min={-3} max={3} step={1} onChange={setN2} show={sigmaText(n2)} />
      </div>
      <div className="readouts">
        {regions.map((rg) => (
          <Readout
            key={rg.key}
            k={`สนามรวม · ${rg.name}`}
            v={
              <>
                {label(res[rg.key].net / UNIT)}
                <div className="small">{fmt(Math.abs(res[rg.key].net))} N/C เมื่อ σ = 1 nC/m²</div>
              </>
            }
            hl={rg.key === 'middle'}
          />
        ))}
      </div>
    </WidgetFrame>
  );
}
