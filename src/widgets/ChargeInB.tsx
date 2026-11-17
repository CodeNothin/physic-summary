// =====================================================================
// Widget: a charge moving perpendicular to a uniform B (worksheet Q26).
//
// The page is the plane of motion; B points into (⊗) or out of (⊙) it.
// The user drags the tip of the velocity arrow to aim the particle and
// sets the kinetic energy and B with sliders. The force arrow always
// points at the centre of the circle, and a dot runs around the orbit.
//
// Physics coordinates are "math style" (x right, y up, z out of page);
// the helpers sx/sy convert to SVG pixels, where y grows downward.
// =====================================================================
import { useCallback, useEffect, useState } from 'react';
import { Arrow, OutIn, Readout, Seg, Slider, WidgetFrame } from '../components/ui';
import { fmt } from '../lib/format';
import { useDrag } from '../lib/useDrag';
import {
  E_CHARGE,
  MEV,
  PROTON_MASS,
  cross,
  forceOnChargeMagnitude,
  orbitRadius,
  speedFromKineticEnergy,
  vec3,
} from '../physics';

const W = 320;
const H = 280;
const C = { x: 160, y: 150 }; // where the particle starts, in pixels
const PX_PER_M = 90; // drawing scale: 90 px = 1 m
const init = { KeV: 5, B: 0.33, out: false, sign: '+' as '+' | '-', angle: 0 }; // Q26 numbers

// pixel ↔ metre conversion (y flipped because SVG y points down)
const sx = (xm: number) => C.x + xm * PX_PER_M;
const sy = (ym: number) => C.y - ym * PX_PER_M;

export function ChargeInB() {
  const [K, setK] = useState(init.KeV); // kinetic energy in MeV
  const [B, setB] = useState(init.B); // tesla
  const [out, setOut] = useState(init.out); // true: B out of page (⊙)
  const [sign, setSign] = useState(init.sign);
  const [angle, setAngle] = useState(init.angle); // direction of v, radians, 0 = right
  const [phase, setPhase] = useState(0); // how far round the orbit the moving dot is

  // drag anywhere on the picture to aim the velocity
  const onMove = useCallback((_k: 'v', p: { x: number; y: number }) => {
    setAngle(Math.atan2(C.y - p.y, p.x - C.x));
  }, []);
  const bind = useDrag(onMove);

  const q = (sign === '+' ? 1 : -1) * E_CHARGE;
  const v = speedFromKineticEnergy(PROTON_MASS, K * MEV);
  const r = orbitRadius(PROTON_MASS, v, q, B);
  const Bz = out ? B : -B;

  // direction of F = q v × B, and the centre of the circle one radius along it
  const vHat = vec3(Math.cos(angle), Math.sin(angle), 0);
  const fDir = cross(vHat, vec3(0, 0, Math.sign(Bz)));
  const fHat = { x: fDir.x * Math.sign(q), y: fDir.y * Math.sign(q) };
  const centre = { x: r * fHat.x, y: r * fHat.y };

  // the particle turns clockwise when q·Bz > 0, counter-clockwise otherwise
  const turn = q * Bz > 0 ? -1 : 1;
  const start = Math.atan2(-centre.y, -centre.x); // angle of the start point seen from the centre
  const dot = {
    x: centre.x + r * Math.cos(start + turn * phase),
    y: centre.y + r * Math.sin(start + turn * phase),
  };

  // animate the dot (skipped if the user prefers reduced motion)
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      // same on-screen speed for every orbit size, so small circles don't blur
      setPhase((ph) => (ph + ((now - last) / 1000) * (1.6 / Math.max(r * PX_PER_M, 30)) * 60) % (2 * Math.PI));
      last = now;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [r]);

  // background ⊙/⊗ grid showing the field direction
  const grid: { x: number; y: number }[] = [];
  for (let y = 22; y < H; y += 38) for (let x = 20; x < W; x += 38) grid.push({ x, y });

  return (
    <WidgetFrame
      title="ประจุวิ่งในสนามแม่เหล็ก (ข้อ 26)"
      notice="ลากบนรูปเพื่อหมุนทิศ $\vec v$ ลูกศรแรง (ฟ้า) ชี้เข้าหาจุดศูนย์กลางเสมอ ลองเพิ่ม $B$ เป็น 2 เท่า รัศมีเหลือครึ่งเดียว และกลับเครื่องหมายประจุแล้ววงกลมย้ายไปอีกฝั่ง"
      onReset={() => {
        setK(init.KeV);
        setB(init.B);
        setOut(init.out);
        setSign(init.sign);
        setAngle(init.angle);
      }}
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="stage" {...bind('v')}>
        {grid.map((g, i) => (
          <OutIn key={i} x={g.x} y={g.y} out={out} size={5} opacity={0.35} />
        ))}
        <circle cx={sx(centre.x)} cy={sy(centre.y)} r={r * PX_PER_M} className="f-none s-muted" strokeDasharray="6 4" strokeWidth={1.5} />
        <circle cx={sx(centre.x)} cy={sy(centre.y)} r={3} className="f-muted" />
        <line x1={sx(0)} y1={sy(0)} x2={sx(centre.x)} y2={sy(centre.y)} className="s-muted" strokeWidth={1} />
        <text x={sx(centre.x / 2) + 6} y={sy(centre.y / 2) - 4} className="small">
          r
        </text>
        <circle cx={sx(dot.x)} cy={sy(dot.y)} r={5} className={q > 0 ? 'f-pos' : 'f-neg'} opacity={0.6} />
        <Arrow x1={C.x} y1={C.y} x2={C.x + 55 * vHat.x} y2={C.y - 55 * vHat.y} cls="vel" w={3} head={10} />
        <Arrow x1={C.x} y1={C.y} x2={C.x + 40 * fHat.x} y2={C.y - 40 * fHat.y} cls="force" w={3} head={10} />
        <circle cx={C.x} cy={C.y} r={9} className={q > 0 ? 'f-pos' : 'f-neg'} />
        <text x={C.x} y={C.y + 4} textAnchor="middle" style={{ fill: '#fff', fontWeight: 700, fontSize: 13 }}>
          {q > 0 ? '+' : '−'}
        </text>
        <text x={C.x + 60 * vHat.x} y={C.y - 60 * vHat.y} style={{ fill: 'var(--vel)', fontWeight: 700 }}>
          v
        </text>
        <text x={C.x + 46 * fHat.x} y={C.y - 46 * fHat.y + 10} style={{ fill: 'var(--force)', fontWeight: 700 }}>
          F
        </text>
        <text x={8} y={H - 8} className="small mut">
          มาตราส่วน: 90 px = 1 m
        </text>
      </svg>
      <div className="controls">
        <div className="grid2" style={{ gap: 6 }}>
          <Seg
            value={out ? 'out' : 'in'}
            onChange={(x) => setOut(x === 'out')}
            options={[
              { value: 'in', label: 'B เข้า ⊗' },
              { value: 'out', label: 'B ออก ⊙' },
            ]}
          />
          <Seg
            value={sign}
            onChange={setSign}
            options={[
              { value: '+', label: 'ประจุ +e' },
              { value: '-', label: 'ประจุ −e' },
            ]}
          />
        </div>
        <Slider label="พลังงานจลน์ $E_K$" value={K} min={1} max={10} step={0.5} onChange={setK} show={`${fmt(K)} MeV`} />
        <Slider label="สนามแม่เหล็ก $B$" value={B} min={0.2} max={1} step={0.01} onChange={setB} show={`${fmt(B)} T`} />
      </div>
      <div className="readouts">
        <Readout k="อัตราเร็ว $v=\sqrt{2E_K/m}$" v={`${fmt(v)} m/s`} />
        <Readout k="แรง $F=|q|vB$" v={`${fmt(forceOnChargeMagnitude(q, v, B, 90))} N`} />
        <Readout k="รัศมี $r=mv/|q|B$" v={`${fmt(r)} m`} hl />
      </div>
      <p className="small" style={{ margin: '6px 0 0' }}>
        มวล 1.66×10⁻²⁷ kg ตามโจทย์ข้อ 26 · ประจุ 1.60×10⁻¹⁹ C
      </p>
    </WidgetFrame>
  );
}
