// =====================================================================
// Widget: two conducting spheres joined by a wire.
// Same potential ⇒ q1/q2 = r1/r2 (the big sphere holds more charge),
// but the surface field E = V/r is stronger on the small sphere.
// =====================================================================
import { useState } from 'react';
import { Arrow, Readout, Slider, WidgetFrame } from '../components/ui';
import { fmt } from '../lib/format';
import { twoSpheres } from '../physics';

const W = 320;
const H = 190;
const CY = 100;
const PX = 5.5; // px per cm
const init = { r1: 6, r2: 2, Q: 8 };

function Ball({ cx, rCm, qn, E, Emax, name }: { cx: number; rCm: number; qn: number; E: number; Emax: number; name: string }) {
  const rad = rCm * PX;
  const n = Math.max(1, Math.round(qn * 2)); // one "+" per 0.5 nC
  const len = 8 + 34 * (E / Emax);
  return (
    <g>
      <circle cx={cx} cy={CY} r={rad} className="f-metal" stroke="var(--muted)" />
      {Array.from({ length: n }, (_, i) => {
        const a = (i * 2 * Math.PI) / n - Math.PI / 2;
        return <circle key={i} cx={cx + (rad - 3.5) * Math.cos(a)} cy={CY + (rad - 3.5) * Math.sin(a)} r={2.2} className="f-pos" />;
      })}
      {[-Math.PI / 2, Math.PI / 2].map((a) => (
        <Arrow
          key={a}
          x1={cx + (rad + 3) * Math.cos(a)}
          y1={CY + (rad + 3) * Math.sin(a)}
          x2={cx + (rad + 3 + len) * Math.cos(a)}
          y2={CY + (rad + 3 + len) * Math.sin(a)}
          w={2.4}
          head={7}
        />
      ))}
      <text x={cx} y={CY + 4} textAnchor="middle" style={{ fontWeight: 700 }}>
        {name}
      </text>
    </g>
  );
}

export function TwoSpheres() {
  const [r1, setR1] = useState(init.r1);
  const [r2, setR2] = useState(init.r2);
  const [Q, setQ] = useState(init.Q);

  const res = twoSpheres(Q * 1e-9, r1 / 100, r2 / 100);
  const Emax = Math.max(res.E1, res.E2);
  const cx1 = 90;
  const cx2 = 240;
  const share = (100 * res.q1) / (res.q1 + res.q2);

  return (
    <WidgetFrame
      title="ทรงกลมตัวนำสองลูกต่อกันด้วยลวด"
      notice="ศักย์ของสองลูกเท่ากันเสมอ ลูกใหญ่ได้ประจุมากกว่า (จุดแดงเยอะกว่า) แต่ลูกเล็กมีสนามที่ผิวแรงกว่า (ลูกศรยาวกว่า) ลองทำให้รัศมีเท่ากันดู"
      onReset={() => {
        setR1(init.r1);
        setR2(init.r2);
        setQ(init.Q);
      }}
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="stage pan-y">
        <line x1={cx1} y1={CY} x2={cx2} y2={CY} className="s-muted" strokeWidth={2} />
        <Ball cx={cx1} rCm={r1} qn={res.q1 * 1e9} E={res.E1} Emax={Emax} name="1" />
        <Ball cx={cx2} rCm={r2} qn={res.q2 * 1e9} E={res.E2} Emax={Emax} name="2" />
        <text x={W / 2} y={14} textAnchor="middle" className="small mut">
          ลวดตัวนำ (จริง ๆ อยู่ห่างกันมาก)
        </text>
        <text x={W / 2} y={H - 8} textAnchor="middle" className="small">
          ศักย์เท่ากันทั้งสองลูก: V = {fmt(res.V)} V
        </text>
      </svg>
      <div className="controls">
        <Slider label="รัศมี $r_1$" value={r1} min={1} max={10} step={0.5} onChange={setR1} show={`${fmt(r1)} cm`} />
        <Slider label="รัศมี $r_2$" value={r2} min={1} max={10} step={0.5} onChange={setR2} show={`${fmt(r2)} cm`} />
        <Slider label="ประจุรวม $q_1+q_2$" value={Q} min={2} max={12} step={1} onChange={setQ} show={`${Q} nC`} />
      </div>
      <div className="skill-row" style={{ marginTop: 8 }}>
        <span>ประจุแบ่งกัน ลูก 1 : ลูก 2</span>
        <b>
          {fmt(share, 2)}% : {fmt(100 - share, 2)}%
        </b>
        <div className="bar">
          <i style={{ width: `${share}%` }} />
        </div>
      </div>
      <div className="readouts">
        <Readout k="$q_1$" v={`${fmt(res.q1 * 1e9)} nC`} />
        <Readout k="$q_2$" v={`${fmt(res.q2 * 1e9)} nC`} />
        <Readout k="$q_1/q_2=r_1/r_2$" v={fmt(res.q1 / res.q2)} hl />
        <Readout k="$E_1=kq_1/r_1^2$" v={`${fmt(res.E1)} N/C`} />
        <Readout k="$E_2=kq_2/r_2^2$" v={`${fmt(res.E2)} N/C`} />
        <Readout k="$E_1/E_2=r_2/r_1$" v={fmt(res.E1 / res.E2)} hl />
      </div>
    </WidgetFrame>
  );
}
