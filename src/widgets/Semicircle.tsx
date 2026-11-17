// =====================================================================
// Widget: force on a semicircular wire in a uniform B (slides 9–11).
//
// Geometry exactly as the slide: centre at the origin, radius R,
// B = B ŷ (green, upward), current +x along the straight part and back
// counter-clockwise along the arc.
//
// The θ slider walks along the arc. At angle θ the widget shows the
// piece ds, the angle θ it makes with B, and its force dF (always into
// the page, ⊗). The graph is the running total of the integral
// F_z(θ) = −IRB(1 − cos θ); at θ = 180° it reaches −2IRB, which cancels
// the straight part's +2IRB.
// =====================================================================
import { useState } from 'react';
import { Graph } from '../components/Graph';
import { Arrow, OutIn, Readout, Slider, WidgetFrame } from '../components/ui';
import { fmt } from '../lib/format';
import { semicircleArcForceUpTo, semicircleForces } from '../physics';

const W = 320;
const H = 200;
const O = { x: 160, y: 165 }; // centre of the semicircle on screen
const RPX = 115; // drawn radius in px

const init = { thetaDeg: 60, I: 2, B: 0.5, Rcm: 10 };

export function Semicircle() {
  const [thetaDeg, setTheta] = useState(init.thetaDeg);
  const [I, setI] = useState(init.I);
  const [B, setB] = useState(init.B);
  const [Rcm, setR] = useState(init.Rcm);

  const R = Rcm / 100;
  const t = (thetaDeg * Math.PI) / 180;
  const forces = semicircleForces(I, R, B);
  const partial = semicircleArcForceUpTo(I, R, B, t);

  // point on the arc and the direction of ds there (counter-clockwise tangent)
  const P = { x: O.x + RPX * Math.cos(t), y: O.y - RPX * Math.sin(t) };
  const tan = { x: -Math.sin(t), y: -Math.cos(t) }; // screen coords (y down)

  // the part of the arc already "added up" (from θ = 0 to the slider value)
  const done = `M${O.x + RPX} ${O.y} A ${RPX} ${RPX} 0 0 0 ${P.x} ${P.y}`;
  const rest = `M${P.x} ${P.y} A ${RPX} ${RPX} 0 0 0 ${O.x - RPX} ${O.y}`;

  return (
    <WidgetFrame
      title="แรงบนลวดครึ่งวงกลม (ตัวอย่างในสไลด์)"
      notice="เลื่อน $\theta$ ไปตามส่วนโค้ง แรงบนชิ้น $ds$ คือ $IRB\sin\theta\,d\theta$ เข้ากระดาษเสมอ จึงสะสมขึ้นเรื่อย ๆ จนได้ $-2IRB$ ที่ $180^\circ$ ซึ่งหักล้างแรงบนส่วนตรงพอดี"
      onReset={() => {
        setTheta(init.thetaDeg);
        setI(init.I);
        setB(init.B);
        setR(init.Rcm);
      }}
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="stage pan-y">
        {/* uniform B pointing up */}
        {[30, 80, 130, 190, 240, 290].map((x) => (
          <Arrow key={x} x1={x} y1={H - 6} x2={x} y2={10} cls="bfield" w={1.3} head={6} opacity={0.45} />
        ))}
        <path d={rest} className="f-none s-muted" strokeWidth={5} opacity={0.5} />
        <path d={done} className="f-none s-cur" strokeWidth={5} />
        <line x1={O.x - RPX} y1={O.y} x2={O.x + RPX} y2={O.y} className="s-cur" strokeWidth={5} />
        <Arrow x1={O.x - 20} y1={O.y + 14} x2={O.x + 20} y2={O.y + 14} cls="cur" w={2} head={7} />
        <text x={O.x} y={O.y + 30} textAnchor="middle" className="small" style={{ fill: 'var(--cur)' }}>
          I
        </text>
        {/* radius to the current piece and the angle θ at the centre */}
        <line x1={O.x} y1={O.y} x2={P.x} y2={P.y} className="s-muted" strokeDasharray="4 3" />
        <path
          d={`M${O.x + 26} ${O.y} A 26 26 0 0 0 ${O.x + 26 * Math.cos(t)} ${O.y - 26 * Math.sin(t)}`}
          className="f-none s-muted"
        />
        <text x={O.x + 32} y={O.y - 8} className="small">
          θ
        </text>
        {/* the piece ds and its force (into the page) */}
        <Arrow x1={P.x - tan.x * 4} y1={P.y - tan.y * 4} x2={P.x + tan.x * 34} y2={P.y + tan.y * 34} cls="ink" w={3} head={8} />
        <text x={P.x + tan.x * 40 - 6} y={P.y + tan.y * 40 - 4} className="small" style={{ fontWeight: 700 }}>
          ds
        </text>
        {Math.sin(t) > 0.02 && <OutIn x={P.x + 18} y={P.y + 16} out={false} cls="force" size={4 + 7 * Math.sin(t)} />}
        <OutIn x={O.x} y={O.y - 20} out cls="force" size={9} />
        <text x={O.x - 14} y={O.y - 16} textAnchor="end" className="small" style={{ fill: 'var(--force)' }}>
          F ส่วนตรง
        </text>
        <text x={8} y={16} className="small mut">
          ⊗ ฟ้า = dF ของชิ้นนี้ (ใหญ่ตาม sinθ)
        </text>
      </svg>
      <div className="controls">
        <Slider label="ตำแหน่งบนส่วนโค้ง $\theta$" value={thetaDeg} min={0} max={180} step={1} onChange={setTheta} show={`${thetaDeg}°`} />
        <Slider label="กระแส $I$" value={I} min={0.5} max={5} step={0.5} onChange={setI} show={`${fmt(I)} A`} />
        <Slider label="สนาม $B$" value={B} min={0.1} max={1} step={0.05} onChange={setB} show={`${fmt(B)} T`} />
        <Slider label="รัศมี $R$" value={Rcm} min={5} max={20} step={1} onChange={setR} show={`${Rcm} cm`} />
      </div>
      <div className="readouts">
        <Readout k="แรงบนชิ้นนี้ต่อ $d\theta$: $IRB\sin\theta$" v={`${fmt(I * R * B * Math.sin(t))} N/rad (เข้า)`} />
        <Readout k="ส่วนโค้ง 0 ถึง $\theta$: $F_z=-IRB(1-\cos\theta)$" v={`${fmt(partial)} N`} hl />
        <Readout k="ส่วนตรง: $+2IRB$" v={`${fmt(forces.straight.z)} N`} />
        <Readout k="ส่วนโค้งทั้งหมด: $-2IRB$" v={`${fmt(forces.curved.z)} N`} />
      </div>
      <div style={{ marginTop: 8 }}>
        <Graph
          fn={(deg) => semicircleArcForceUpTo(I, R, B, (deg * Math.PI) / 180)}
          xMax={180}
          marker={thetaDeg}
          yLabel="F_z สะสมของส่วนโค้ง"
          xLabel="θ (องศา)"
          unit="N"
          cls="force"
          height={120}
        />
      </div>
    </WidgetFrame>
  );
}
