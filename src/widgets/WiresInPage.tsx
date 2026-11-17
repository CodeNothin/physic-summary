// =====================================================================
// Widget: two long parallel wires lying in the page (slides 20–22).
//
// Both wires are vertical, a distance L apart; each current is up or
// down. Along the horizontal line through P, every field is
// perpendicular to the page (⊙ out or ⊗ in), so the two fields simply
// add or subtract as signed numbers.
//
// All values are shown in units of μ0 I / (π L), the unit in the slide's
// answer 2μ0I/(3πL). The default is exactly the slide-20 example.
// =====================================================================
import { useCallback, useState } from 'react';
import { Graph } from '../components/Graph';
import { Arrow, OutIn, Readout, Seg, WidgetFrame } from '../components/ui';
import { clamp, fmt } from '../lib/format';
import { useDrag } from '../lib/useDrag';
import { MU0, inPageWireBz } from '../physics';

const W = 320;
const H = 170;
const LPX = 110; // L in pixels
const X_LEFT = 70; // screen x of the left wire
const Y_LINE = 100; // screen y of the line through P
const UNIT = MU0 / Math.PI; // μ0 I / (π L) with I = 1 A and L = 1 m

type Dir = 'up' | 'down';
const init = { left: 'down' as Dir, right: 'up' as Dir, xP: 1.5 }; // xP in units of L

/** Field at x (units of L) in units of μ0I/(πL), with wires at x = 0 and x = 1. */
function fieldAt(left: Dir, right: Dir, x: number) {
  const Iy = (d: Dir) => (d === 'up' ? 1 : -1);
  const bL = inPageWireBz(Iy(left), 0, x) / UNIT;
  const bR = inPageWireBz(Iy(right), 1, x) / UNIT;
  return { bL, bR, net: bL + bR };
}

/** "0.667 ⊗" style text: magnitude and direction symbol. */
const show = (b: number) => (Math.abs(b) < 1e-9 ? '0' : `${fmt(Math.abs(b))} ${b > 0 ? '⊙ ออก' : '⊗ เข้า'}`);

export function WiresInPage() {
  const [left, setLeft] = useState<Dir>(init.left);
  const [right, setRight] = useState<Dir>(init.right);
  const [xP, setXP] = useState(init.xP);

  const onMove = useCallback((_k: 'P', p: { x: number; y: number }) => {
    let x = (p.x - X_LEFT) / LPX;
    // keep P a little away from the wires, where the field blows up
    if (Math.abs(x) < 0.12) x = x < 0 ? -0.12 : 0.12;
    if (Math.abs(x - 1) < 0.12) x = x < 1 ? 0.88 : 1.12;
    setXP(clamp(Math.round(x * 20) / 20, -0.55, 2.2));
  }, []);
  const bind = useDrag(onMove);

  const f = fieldAt(left, right, xP);
  const px = X_LEFT + xP * LPX;
  const size = (b: number) => clamp(4 + 6 * Math.abs(b), 4, 14);

  const wire = (x: number, d: Dir, label: string) => (
    <g>
      <line x1={x} y1={18} x2={x} y2={H - 14} className="s-ink" strokeWidth={3.5} />
      <Arrow x1={x} y1={d === 'up' ? 70 : 40} x2={x} y2={d === 'up' ? 40 : 70} cls="cur" w={3} head={9} />
      <text x={x + 8} y={30} className="small" style={{ fill: 'var(--cur)', fontWeight: 700 }}>
        {label}
      </text>
    </g>
  );

  return (
    <WidgetFrame
      title="ลวดขนานสองเส้นในระนาบกระดาษ"
      notice="ค่าเริ่มต้นคือตัวอย่างในสไลด์ ลาก P ไปไว้ระหว่างลวด แล้วดูว่าสนามทั้งสองชี้ทางเดียวกัน (บวกกัน) ลองตั้งกระแสทิศเดียวกันแล้วหาจุดที่สนามเป็นศูนย์"
      onReset={() => {
        setLeft(init.left);
        setRight(init.right);
        setXP(init.xP);
      }}
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="stage" {...bind('P')}>
        {wire(X_LEFT, left, 'ซ้าย')}
        {wire(X_LEFT + LPX, right, 'ขวา')}
        <line x1={8} y1={Y_LINE} x2={W - 8} y2={Y_LINE} className="s-line" strokeDasharray="3 4" />
        <line x1={X_LEFT} y1={Y_LINE + 40} x2={X_LEFT + LPX} y2={Y_LINE + 40} className="s-muted" />
        <text x={X_LEFT + LPX / 2} y={Y_LINE + 54} textAnchor="middle" className="small">
          L
        </text>
        {/* at P: field from each wire (small) and the total (big) */}
        <OutIn x={px - 22} y={Y_LINE - 28} out={f.bL > 0} size={size(f.bL)} cls="bfield" opacity={0.6} />
        <OutIn x={px + 22} y={Y_LINE - 28} out={f.bR > 0} size={size(f.bR)} cls="bfield" opacity={0.6} />
        <text x={px - 22} y={Y_LINE - 44} textAnchor="middle" className="small mut">
          ซ้าย
        </text>
        <text x={px + 22} y={Y_LINE - 44} textAnchor="middle" className="small mut">
          ขวา
        </text>
        <g className="drag">
          <circle cx={px} cy={Y_LINE} r={22} fill="transparent" />
          {Math.abs(f.net) > 1e-6 ? (
            <OutIn x={px} y={Y_LINE} out={f.net > 0} size={size(f.net)} cls="bfield" />
          ) : (
            <circle cx={px} cy={Y_LINE} r={5} className="f-accent" />
          )}
          <text x={px} y={Y_LINE + 26} textAnchor="middle" style={{ fontWeight: 700 }}>
            P
          </text>
        </g>
      </svg>
      <div className="controls">
        <div className="grid2" style={{ gap: 6 }}>
          <Seg
            value={left}
            onChange={setLeft}
            options={[
              { value: 'up', label: 'ซ้าย: ขึ้น ↑' },
              { value: 'down', label: 'ซ้าย: ลง ↓' },
            ]}
          />
          <Seg
            value={right}
            onChange={setRight}
            options={[
              { value: 'up', label: 'ขวา: ขึ้น ↑' },
              { value: 'down', label: 'ขวา: ลง ↓' },
            ]}
          />
        </div>
      </div>
      <div className="readouts">
        <Readout k="ตำแหน่ง P" v={`${fmt(xP, 3)} L จากลวดซ้าย`} />
        <Readout k="จากลวดซ้าย (หน่วย $\mu_0I/\pi L$)" v={show(f.bL)} />
        <Readout k="จากลวดขวา" v={show(f.bR)} />
        <Readout k="รวม" v={show(f.net)} hl />
      </div>
      <div style={{ marginTop: 8 }}>
        <Graph
          // null right next to a wire, where the field is too large to draw
          fn={(x) => (Math.abs(x) < 0.08 || Math.abs(x - 1) < 0.08 ? null : clamp(fieldAt(left, right, x).net, -6, 6))}
          xMin={-0.55}
          xMax={2.2}
          marker={xP}
          guides={[
            { x: 0, label: 'ลวดซ้าย' },
            { x: 1, label: 'ลวดขวา' },
          ]}
          yLabel="B (+ ออก, − เข้า)"
          xLabel="x (L)"
          unit=""
          cls="bfield"
        />
      </div>
    </WidgetFrame>
  );
}
