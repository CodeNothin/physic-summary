// =====================================================================
// Widget: Biot–Savart field of a finite straight wire (slides 13–15).
//
// The wire lies along a horizontal line with current to the right.
// The user drags the two ends and the point P. The widget draws the
// perpendicular from P to the wire (length a) and the two angles θ1, θ2
// measured from that perpendicular, exactly like the slide-15 picture.
//
//   B = μ0 I / (4πa) · (sin θ1 + sin θ2)          (finiteWireField)
//
// An angle counts as negative when its end is on the "wrong" side of
// the foot of the perpendicular (both ends on the same side of P).
// Drawing scale: 1 px = 1 mm.
// =====================================================================
import { useCallback, useRef, useState } from 'react';
import { Arrow, OutIn, Readout, Slider, WidgetFrame } from '../components/ui';
import { clamp, fmt } from '../lib/format';
import { useDrag } from '../lib/useDrag';
import { finiteWireFieldFromEnds, longWireField } from '../physics';

const W = 320;
const H = 230;
const WIRE_Y = 170; // screen y of the wire
const PX_PER_M = 1000;
const init = { x1: 40, x2: 280, P: { x: 160, y: 80 }, I: 10 };

type Handle = 'x1' | 'x2' | 'P';

export function FiniteWire() {
  const [x1, setX1] = useState(init.x1); // left end, px
  const [x2, setX2] = useState(init.x2); // right end, px
  const [P, setP] = useState(init.P);
  const [I, setI] = useState(init.I);

  // refs so the drag callback (created once) can read the latest end positions
  const x1Ref = useRefValue(x1);
  const x2Ref = useRefValue(x2);
  const onMove = useCallback((k: Handle, p: { x: number; y: number }) => {
    if (k === 'P') setP({ x: clamp(p.x, 10, W - 10), y: clamp(p.y, 20, WIRE_Y - 25) });
    // keep the ends in order and at least 20 px apart
    else if (k === 'x1') setX1(clamp(p.x, 4, x2Ref.current - 20));
    else setX2(clamp(p.x, x1Ref.current + 20, W - 4));
  }, [x1Ref, x2Ref]);
  const bind = useDrag(onMove);

  const a = (WIRE_Y - P.y) / PX_PER_M; // perpendicular distance, metres
  // end positions measured from the foot of the perpendicular (metres)
  const e1 = (x1 - P.x) / PX_PER_M;
  const e2 = (x2 - P.x) / PX_PER_M;
  const B = finiteWireFieldFromEnds(I, a, e1, e2);
  const Binf = longWireField(I, a);
  // the slide's angles: θ1 towards the left end, θ2 towards the right end
  const th1 = (Math.atan2(-e1, a) * 180) / Math.PI;
  const th2 = (Math.atan2(e2, a) * 180) / Math.PI;

  return (
    <WidgetFrame
      title="ลวดตรงยาวจำกัด (บิโอต์–ซาวาร์ต)"
      notice="ลากปลายลวดออกไปไกล ๆ มุม $\theta_1,\theta_2$ เข้าใกล้ $90^\circ$ และ $B$ เข้าใกล้ค่าของลวดยาวมาก $\mu_0I/2\pi a$ ลองลาก P ให้ห่างลวดเป็น 2 เท่าด้วย"
      onReset={() => {
        setX1(init.x1);
        setX2(init.x2);
        setP(init.P);
        setI(init.I);
      }}
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="stage">
        {/* the wire, with the current arrow */}
        <line x1={x1} y1={WIRE_Y} x2={x2} y2={WIRE_Y} className="s-cur" strokeWidth={6} strokeLinecap="round" />
        <Arrow x1={(x1 + x2) / 2 - 20} y1={WIRE_Y + 18} x2={(x1 + x2) / 2 + 20} y2={WIRE_Y + 18} cls="cur" w={2} head={7} />
        <text x={(x1 + x2) / 2} y={WIRE_Y + 36} textAnchor="middle" className="small" style={{ fill: 'var(--cur)' }}>
          I
        </text>
        {/* perpendicular from P (length a) and lines to the two ends */}
        <line x1={P.x} y1={P.y} x2={P.x} y2={WIRE_Y} className="s-ink" strokeWidth={1.2} />
        <text x={P.x + 5} y={(P.y + WIRE_Y) / 2} className="small">
          a = {fmt(a * 100, 2)} cm
        </text>
        <line x1={P.x} y1={P.y} x2={x1} y2={WIRE_Y} className="s-muted" strokeDasharray="5 4" />
        <line x1={P.x} y1={P.y} x2={x2} y2={WIRE_Y} className="s-muted" strokeDasharray="5 4" />
        <text x={P.x - 30} y={P.y + 32} className="small" style={{ fill: 'var(--gauss)', fontWeight: 700 }}>
          θ₁
        </text>
        <text x={P.x + 18} y={P.y + 32} className="small" style={{ fill: 'var(--gauss)', fontWeight: 700 }}>
          θ₂
        </text>
        {/* draggable handles */}
        {(['x1', 'x2'] as const).map((k) => {
          const x = k === 'x1' ? x1 : x2;
          return (
            <g key={k} {...bind(k)} className="drag">
              <circle cx={x} cy={WIRE_Y} r={20} fill="transparent" />
              <circle cx={x} cy={WIRE_Y} r={8} className="f-accent" />
            </g>
          );
        })}
        <g {...bind('P')} className="drag">
          <circle cx={P.x} cy={P.y} r={22} fill="transparent" />
          {/* B at P is out of the page (current right, P above) */}
          <OutIn x={P.x} y={P.y} out cls="bfield" size={9} />
          <text x={P.x + 13} y={P.y - 8} style={{ fontWeight: 700 }}>
            P
          </text>
        </g>
        <text x={8} y={16} className="small mut">
          B ที่ P พุ่งออกจากกระดาษ ⊙ · 1 px = 1 mm
        </text>
      </svg>
      <div className="controls">
        <Slider label="กระแส $I$" value={I} min={1} max={20} step={1} onChange={setI} show={`${I} A`} />
      </div>
      <div className="readouts">
        <Readout k="$\theta_1$, $\theta_2$" v={`${fmt(th1, 3)}°, ${fmt(th2, 3)}°`} />
        <Readout k="$\sin\theta_1+\sin\theta_2$" v={fmt(Math.sin((th1 * Math.PI) / 180) + Math.sin((th2 * Math.PI) / 180))} />
        <Readout k="$B=\dfrac{\mu_0I}{4\pi a}(\sin\theta_1+\sin\theta_2)$" v={`${fmt(B)} T`} hl />
        <Readout k="ถ้ายาวมาก $\mu_0I/2\pi a$" v={`${fmt(Binf)} T (${fmt((100 * B) / Binf, 3)}%)`} />
      </div>
    </WidgetFrame>
  );
}

/** A ref that always holds the latest value (lets a once-created callback read fresh state). */
function useRefValue<T>(value: T) {
  const ref = useRef(value);
  ref.current = value;
  return ref;
}
