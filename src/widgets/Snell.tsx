// =====================================================================
// Widget: reflection, refraction and total internal reflection
// (slides 4–8, 40–42).
//
// Light comes in from the TOP material and hits a flat boundary. The
// user picks both materials (indices from the slide-6 table) and the
// angle of incidence θ₁ (measured from the normal).
//   reflected ray:  θ₁′ = θ₁
//   refracted ray:  n₁ sinθ₁ = n₂ sinθ₂, missing when sinθ₂ > 1 (TIR)
// Readouts also give the critical angle (if n₁ > n₂) and the Brewster
// angle tanθp = n₂/n₁. Ray thickness is only a hint: in TIR all the
// light is reflected, so that ray is drawn thick.
// =====================================================================
import { useState } from 'react';
import { Arrow, Readout, Seg, Slider, WidgetFrame } from '../components/ui';
import { fmt } from '../lib/format';
import { brewsterDeg, criticalAngleDeg, snellDeg, speedFromIndex } from '../physics';

/** Materials from the slide-6 table (λ = 589 nm). */
const materials = {
  air: { label: 'อากาศ', n: 1.0 },
  water: { label: 'น้ำ', n: 1.333 },
  glass: { label: 'แก้ว', n: 1.52 },
  diamond: { label: 'เพชร', n: 2.419 },
} as const;
type Mat = keyof typeof materials;
const matOptions = (Object.keys(materials) as Mat[]).map((m) => ({ value: m, label: materials[m].label }));

const O = { x: 160, y: 110 }; // where the ray hits the boundary
const R = 95; // ray length on screen
const init = { top: 'air' as Mat, bottom: 'glass' as Mat, th: 40 };

export function Snell() {
  const [top, setTop] = useState<Mat>(init.top);
  const [bottom, setBottom] = useState<Mat>(init.bottom);
  const [th, setTh] = useState(init.th);

  const n1 = materials[top].n;
  const n2 = materials[bottom].n;
  const th2 = snellDeg(n1, th, n2);
  const tir = th2 === null;
  const thc = criticalAngleDeg(n1, n2);
  const thp = brewsterDeg(n2, n1);
  const r = (d: number) => (d * Math.PI) / 180;

  // screen points (SVG y grows downward)
  const inc = { x: O.x - R * Math.sin(r(th)), y: O.y - R * Math.cos(r(th)) };
  const refl = { x: O.x + R * Math.sin(r(th)), y: O.y - R * Math.cos(r(th)) };
  const refr = th2 === null ? null : { x: O.x + R * Math.sin(r(th2)), y: O.y + R * Math.cos(r(th2)) };
  // a denser medium is drawn darker
  const shade = (n: number) => 0.06 + 0.12 * (n - 1);

  return (
    <WidgetFrame
      title="การหักเหและการสะท้อนกลับหมด"
      notice="แสงเข้าตัวกลางที่ $n$ มากกว่า เบน **เข้าหา** เส้นปกติ ลองตั้งด้านบนเป็นแก้วหรือเพชร ด้านล่างเป็นอากาศ แล้วเพิ่ม $\theta_1$ จนเกินมุมวิกฤต: รังสีหักเหหายไป เหลือแต่สะท้อนกลับหมด"
      onReset={() => {
        setTop(init.top);
        setBottom(init.bottom);
        setTh(init.th);
      }}
    >
      <svg viewBox="0 0 320 220" className="stage pan-y">
        <rect x={0} y={0} width={320} height={O.y} style={{ fill: 'var(--accent)', opacity: shade(n1) }} />
        <rect x={0} y={O.y} width={320} height={220 - O.y} style={{ fill: 'var(--accent)', opacity: shade(n2) }} />
        <line x1={0} y1={O.y} x2={320} y2={O.y} className="s-ink" strokeWidth={1.5} />
        <line x1={O.x} y1={8} x2={O.x} y2={212} className="s-muted" strokeWidth={1.2} strokeDasharray="5 4" />
        <text x={6} y={18} className="small">{`${materials[top].label} n₁ = ${n1}`}</text>
        <text x={6} y={O.y + 18} className="small">{`${materials[bottom].label} n₂ = ${n2}`}</text>
        {/* incident, reflected, refracted */}
        <Arrow x1={inc.x} y1={inc.y} x2={O.x} y2={O.y} cls="force" w={3} head={9} />
        <Arrow x1={O.x} y1={O.y} x2={refl.x} y2={refl.y} cls="force" w={tir ? 3 : 1.4} head={tir ? 9 : 6} opacity={tir ? 1 : 0.55} />
        {refr && <Arrow x1={O.x} y1={O.y} x2={refr.x} y2={refr.y} cls="force" w={2.6} head={9} />}
        <text x={O.x - 30} y={O.y - 40} className="small">θ₁</text>
        {refr && (
          <text x={O.x + 8} y={O.y + 46} className="small">
            θ₂
          </text>
        )}
        {tir && (
          <text x={O.x + 10} y={O.y + 40} className="small" style={{ fontWeight: 700 }}>
            สะท้อนกลับหมด
          </text>
        )}
      </svg>
      <div className="controls">
        <span className="small">ตัวกลางด้านบน (แสงมาจากทางนี้)</span>
        <Seg value={top} onChange={setTop} options={matOptions} />
        <span className="small">ตัวกลางด้านล่าง</span>
        <Seg value={bottom} onChange={setBottom} options={matOptions} />
        <Slider label="มุมตกกระทบ $\theta_1$" value={th} min={0} max={89} step={1} onChange={setTh} show={`${th}°`} />
      </div>
      <div className="readouts">
        <Readout k="มุมหักเห $\theta_2$" v={tir ? 'ไม่มี (สะท้อนกลับหมด)' : `${fmt(th2!)}°`} hl />
        <Readout k="มุมวิกฤต $\sin\theta_c=n_2/n_1$" v={thc === null ? 'ไม่มี (n₁ ≤ n₂)' : `${fmt(thc)}°`} />
        <Readout k="มุมบริวสเตอร์ $\tan\theta_p=n_2/n_1$" v={`${fmt(thp)}°`} />
        <Readout k="อัตราเร็ว $v_1,\ v_2=c/n$" v={`${fmt(speedFromIndex(n1))}, ${fmt(speedFromIndex(n2))} m/s`} />
      </div>
    </WidgetFrame>
  );
}
