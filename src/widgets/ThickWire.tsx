// =====================================================================
// Widget: thick wire with current spread evenly (slides 17–19).
//
// Cross-section view: the current comes out of the page (⊙ dots, all
// equally spaced = uniform current density). The dashed circle is the
// Amperian loop of radius r. The shaded disc is the part of the current
// that passes through the loop:
//   r < R : I_in = I r²/R²  (area fraction)  ⇒  B grows like r
//   r ≥ R : I_in = I                          ⇒  B falls like 1/r
// =====================================================================
import { useState } from 'react';
import { Graph } from '../components/Graph';
import { Arrow, OutIn, Readout, Slider, WidgetFrame } from '../components/ui';
import { fmt } from '../lib/format';
import { thickWireEnclosedCurrent, thickWireField } from '../physics';

const W = 320;
const H = 200;
const C = { x: W / 2, y: H / 2 };
const PX_PER_CM = 15;
const R_CM = 2; // wire radius
const init = { r: 3, I: 10 };

// fixed dots spread evenly over the wire's cross-section (golden-angle spiral)
const dots = Array.from({ length: 30 }, (_, i) => {
  const rad = Math.sqrt((i + 0.5) / 30) * 0.88;
  const ang = i * 2.399963;
  return { u: rad * Math.cos(ang), v: rad * Math.sin(ang), rad };
});

export function ThickWire() {
  const [rCm, setR] = useState(init.r);
  const [I, setI] = useState(init.I);

  const R = R_CM / 100;
  const r = rCm / 100;
  const Iin = thickWireEnclosedCurrent(I, R, r);
  const B = thickWireField(I, R, r);
  const Bmax = thickWireField(I, R, R);
  const rpx = rCm * PX_PER_CM;
  const Rpx = R_CM * PX_PER_CM;

  return (
    <WidgetFrame
      title="ลวดหนา กระแสสม่ำเสมอ"
      notice="ในลวด เลื่อน $r$ เป็น 2 เท่า กระแสที่ทะลุวงเพิ่ม 4 เท่า (ตามพื้นที่) แต่เส้นรอบวงเพิ่ม 2 เท่า $B$ จึงเพิ่ม 2 เท่า นอกลวดกระแสไม่เพิ่มแล้ว $B$ จึงลดลงแบบ $1/r$"
      onReset={() => {
        setR(init.r);
        setI(init.I);
      }}
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="stage pan-y">
        <circle cx={C.x} cy={C.y} r={Rpx} className="f-metal" />
        {/* shaded: current that passes through the Amperian loop */}
        <circle cx={C.x} cy={C.y} r={Math.min(rpx, Rpx)} style={{ fill: 'var(--cur)', fillOpacity: 0.3 }} />
        {dots.map((d, i) => (
          <circle
            key={i}
            cx={C.x + d.u * Rpx}
            cy={C.y + d.v * Rpx}
            r={1.8}
            className="f-cur"
            opacity={d.rad * R_CM <= rCm ? 1 : 0.3}
          />
        ))}
        <circle cx={C.x} cy={C.y} r={rpx} className="f-none s-gauss" strokeWidth={2.2} strokeDasharray="6 4" />
        {/* B is tangent to the loop, counter-clockwise for current out of the page */}
        {rpx > 4 &&
          Array.from({ length: 8 }, (_, k) => {
            const a = (k * Math.PI) / 4;
            const px = C.x + rpx * Math.cos(a);
            const py = C.y - rpx * Math.sin(a);
            const len = 6 + 22 * (B / Bmax);
            return (
              <Arrow key={k} x1={px} y1={py} x2={px - len * Math.sin(a)} y2={py - len * Math.cos(a)} cls="bfield" w={2} head={6} />
            );
          })}
        <OutIn x={W - 24} y={20} out cls="cur" size={8} />
        <text x={W - 36} y={24} textAnchor="end" className="small mut">
          กระแสพุ่งออก
        </text>
        <text x={8} y={H - 8} className="small mut">
          ลวดรัศมี R = 2 cm · เส้นประ = วงแอมแปร์รัศมี r
        </text>
      </svg>
      <div className="controls">
        <Slider label="รัศมีวงแอมแปร์ $r$" value={rCm} min={0.2} max={6} step={0.1} onChange={setR} show={`${fmt(rCm)} cm · ${rCm < R_CM ? 'ในลวด' : 'นอกลวด'}`} />
        <Slider label="กระแสทั้งหมด $I$" value={I} min={1} max={20} step={1} onChange={setI} show={`${I} A`} />
      </div>
      <div className="readouts">
        <Readout k="กระแสที่ทะลุวง $I_{in}$" v={`${fmt(Iin)} A`} />
        <Readout k="$B=\mu_0 I_{in}/2\pi r$" v={`${fmt(B)} T`} hl />
      </div>
      <div style={{ marginTop: 8 }}>
        <Graph
          fn={(x) => thickWireField(I, R, x / 100)}
          xMax={6}
          marker={rCm}
          guides={[{ x: R_CM, label: 'R' }]}
          yLabel="B(r)"
          xLabel="r (cm)"
          unit="T"
          cls="bfield"
        />
      </div>
    </WidgetFrame>
  );
}
