// =====================================================================
// Widget: diffraction grating (slides 29–34).
//
// d = 1/(lines per metre); bright lines where d sinθ = mλ.
// The picture is a top view: light comes from the left, the grating is
// the vertical bar, and each order m leaves at angle θ_m towards a
// curved screen. "แสงขาว" draws 7 colours at once, so each order
// spreads into a small spectrum with red bent most (slide 30–31).
// =====================================================================
import { useState } from 'react';
import { Readout, Slider, Toggle, WidgetFrame } from '../components/ui';
import { fmt } from '../lib/format';
import { gratingAngleDeg, gratingMaxOrder } from '../physics';
import { lambdaColor } from './lightColor';

const G = { x: 70, y: 120 }; // the grating on screen
const R = 210; // distance to the curved screen, px
const WHITE = [410, 450, 490, 530, 570, 610, 660]; // nm, for "แสงขาว"

// starting values are the slide-34 example: 1.26×10⁴ lines per 25.4 mm ≈ 496 lines/mm, 589 nm
const init = { perMm: 496, lamNm: 589, white: false };

export function Grating() {
  const [perMm, setPer] = useState(init.perMm);
  const [lamNm, setLam] = useState(init.lamNm);
  const [white, setWhite] = useState(init.white);

  const d = 1e-3 / perMm; // m
  const lams = white ? WHITE : [lamNm];
  const maxM = gratingMaxOrder(lamNm * 1e-9, d);
  const th1 = gratingAngleDeg(1, lamNm * 1e-9, d);
  const th2 = gratingAngleDeg(2, lamNm * 1e-9, d);

  // every ray that exists: m = −3 … 3 for each colour
  const rays: { m: number; nm: number; th: number }[] = [];
  for (const nm of lams)
    for (let m = -3; m <= 3; m++) {
      const th = gratingAngleDeg(m, nm * 1e-9, d);
      if (th !== null) rays.push({ m, nm, th });
    }
  const end = (th: number) => ({ x: G.x + R * Math.cos((th * Math.PI) / 180), y: G.y - R * Math.sin((th * Math.PI) / 180) });

  return (
    <WidgetFrame
      title="เกรตติงเลี้ยวเบน"
      notice="$d\sin\theta=m\lambda$: เส้นต่อมิลลิเมตรมากขึ้น $d$ เล็กลง มุมกางออก และเห็นได้น้อยลำดับลง ลองเปิด **แสงขาว**: ลำดับ $m=0$ เป็นสีขาว ลำดับอื่นแยกเป็นสเปกตรัม สีแดงเบนมากกว่าสีม่วง"
      onReset={() => {
        setPer(init.perMm);
        setLam(init.lamNm);
        setWhite(init.white);
      }}
    >
      <svg viewBox="0 0 320 240" className="stage pan-y">
        <path d={`M${G.x + R * Math.cos(1.45)} ${G.y - R * Math.sin(1.45)} A${R} ${R} 0 0 1 ${G.x + R * Math.cos(-1.45)} ${G.y - R * Math.sin(-1.45)}`} className="f-none s-line" strokeWidth={2} />
        <line x1={4} y1={G.y} x2={G.x} y2={G.y} className="s-ink" strokeWidth={3} />
        <line x1={G.x} y1={G.y - 34} x2={G.x} y2={G.y + 34} className="s-ink" strokeWidth={4} strokeDasharray="2 2" />
        {rays.map((ry) => {
          const e = end(ry.th);
          const c = white && ry.m === 0 ? 'var(--ink)' : lambdaColor(ry.nm);
          return <line key={`${ry.nm}${ry.m}`} x1={G.x} y1={G.y} x2={e.x} y2={e.y} style={{ stroke: c }} strokeWidth={ry.m === 0 ? 2.4 : 1.8} opacity={0.9} />;
        })}
        {[-3, -2, -1, 0, 1, 2, 3].map((m) => {
          const th = gratingAngleDeg(m, lamNm * 1e-9, d);
          if (th === null) return null;
          const e = end(th);
          return (
            <text key={m} x={e.x + 4} y={e.y + 4} className="small">
              {m}
            </text>
          );
        })}
        <text x={6} y={G.y - 8} className="small mut">แสง</text>
      </svg>
      <div className="controls">
        <Slider label="จำนวนเส้นต่อ mm" value={perMm} min={100} max={1200} step={4} onChange={setPer} show={`${perMm} เส้น/mm`} />
        {!white && <Slider label="ความยาวคลื่น $\lambda$" value={lamNm} min={400} max={700} step={1} onChange={setLam} show={`${lamNm} nm`} />}
        <div className="seg">
          <Toggle on={white} label="แสงขาว" onChange={setWhite} />
        </div>
      </div>
      <div className="readouts">
        <Readout k="$d$ = 1/(เส้นต่อความยาว)" v={`${fmt(d * 1e6)} μm`} />
        <Readout k="ลำดับที่ 1: $\theta_1$" v={th1 === null ? 'ไม่มี' : `${fmt(th1)}°`} hl />
        <Readout k="ลำดับที่ 2: $\theta_2$" v={th2 === null ? 'ไม่มี' : `${fmt(th2)}°`} />
        <Readout k="ลำดับสูงสุด ($m\lambda<d$)" v={white ? `${gratingMaxOrder(660e-9, d)} (แดง)` : String(maxM)} />
      </div>
    </WidgetFrame>
  );
}
