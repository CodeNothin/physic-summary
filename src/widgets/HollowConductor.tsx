import { useState } from 'react';
import { ChargeDot, Readout, Slider, WidgetFrame } from '../components/ui';
import { fmt } from '../lib/format';
import { shellField, shellRegion, shellSurfaceCharges } from '../physics';

const W = 320;
const H = 236;
const C = { x: W / 2, y: H / 2 };
const PX = 5; // px per cm
const R1 = 10; // cm, worksheet Q21
const R2 = 14;
const init = { q: 5, Q: -20, r: 12 };
const uC = 1e-6;

const signed = (x: number) => `${x > 0 ? '+' : x < 0 ? '−' : ''}${fmt(Math.abs(x))} μC`;

/** +/− symbols spread around a wall; the count follows the size of the charge */
function WallCharges({ charge, rad }: { charge: number; rad: number }) {
  const n = Math.min(24, Math.round(Math.abs(charge)));
  if (n === 0) return null;
  return (
    <>
      {Array.from({ length: n }, (_, i) => {
        const a = (i * 2 * Math.PI) / n - Math.PI / 2;
        return (
          <text
            key={i}
            x={C.x + rad * Math.cos(a)}
            y={C.y + rad * Math.sin(a) + 4}
            textAnchor="middle"
            style={{ fill: charge > 0 ? 'var(--pos)' : 'var(--neg)', fontWeight: 700, fontSize: 13 }}
          >
            {charge > 0 ? '+' : '−'}
          </text>
        );
      })}
    </>
  );
}

export function HollowConductor() {
  const [q, setQ] = useState(init.q);
  const [Q, setQ2] = useState(init.Q);
  const [r, setR] = useState(init.r);

  const walls = shellSurfaceCharges(q * uC, Q * uC);
  const region = shellRegion(R1 / 100, R2 / 100, r / 100);
  const E = shellField(q * uC, Q * uC, R1 / 100, R2 / 100, r / 100);
  const regionName = { cavity: 'ในโพรง', metal: 'ในเนื้อโลหะ', outside: 'ข้างนอก' }[region];
  const qIn = region === 'cavity' ? q : region === 'metal' ? 0 : q + Q;

  return (
    <WidgetFrame
      title="ตัวนำกลวงที่มีประจุในโพรง"
      notice="ผิวในมีประจุ $-q$ เสมอ ไม่ว่า $Q$ จะเป็นเท่าไร เพราะผิวเกาส์ในเนื้อโลหะต้องล้อมประจุรวมเป็นศูนย์ ส่วนที่เหลือของ $Q$ ไปอยู่ผิวนอกทั้งหมด"
      onReset={() => {
        setQ(init.q);
        setQ2(init.Q);
        setR(init.r);
      }}
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="stage pan-y">
        <circle cx={C.x} cy={C.y} r={R2 * PX} className="f-metal" />
        <circle cx={C.x} cy={C.y} r={R1 * PX} className="f-bg" />
        <WallCharges charge={walls.inner / uC} rad={R1 * PX + 6} />
        <WallCharges charge={walls.outer / uC} rad={R2 * PX - 6} />
        {q !== 0 && <ChargeDot x={C.x} y={C.y} q={q} rad={10} />}
        {q !== 0 && (
          <text x={C.x} y={C.y + 25} textAnchor="middle" className="small">
            q
          </text>
        )}
        {r > 0 && (
          <circle cx={C.x} cy={C.y} r={r * PX} className="f-none s-gauss" strokeWidth={2.2} strokeDasharray="6 4" />
        )}
        <circle cx={C.x + r * PX} cy={C.y} r={4.5} className="f-gauss" />
        <text x={8} y={16} className="small mut">
          สีเทา = เนื้อโลหะ (10–14 cm) · เส้นประ = ผิวเกาส์
        </text>
      </svg>
      <div className="controls">
        <Slider label="ประจุในโพรง $q$" value={q} min={-9} max={9} step={1} onChange={setQ} show={signed(q)} />
        <Slider label="ประจุสุทธิของตัวนำ $Q$" value={Q} min={-20} max={20} step={1} onChange={setQ2} show={signed(Q)} />
        <Slider label="รัศมีผิวเกาส์ $r$" value={r} min={1} max={22} step={0.5} onChange={setR} show={`${fmt(r)} cm · ${regionName}`} />
      </div>
      <div className="readouts">
        <Readout k="ผิวใน $=-q$" v={signed(walls.inner / uC)} hl />
        <Readout k="ผิวนอก $=Q+q$" v={signed(walls.outer / uC)} hl />
        <Readout k={`$q_{in}$ ของผิวเกาส์`} v={signed(qIn)} />
        <Readout
          k={`$E$ ที่ $r$ (${regionName})`}
          v={
            <>
              {fmt(Math.abs(E))} N/C{' '}
              {E > 0 ? 'ชี้ออก' : E < 0 ? 'ชี้เข้า' : ''}
              {region === 'cavity' && <div className="small">คิดกรณี q อยู่ตรงกลางโพรง</div>}
            </>
          }
        />
      </div>
    </WidgetFrame>
  );
}
