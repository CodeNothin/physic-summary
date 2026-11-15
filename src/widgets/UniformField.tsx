import { useCallback, useState } from 'react';
import { Arrow, Readout, Slider, WidgetFrame } from '../components/ui';
import { clamp, fmt, snap } from '../lib/format';
import { useDrag } from '../lib/useDrag';
import { deltaVUniform, externalWork } from '../physics';
import type { Vec2 } from '../physics';

const W = 320;
const H = 306;
const S = 44; // px per metre
const N = 6; // grid is 6 m × 6 m
const OX = 34;
const OY = H - 26;
const X = (x: number) => OX + x * S;
const Y = (y: number) => OY - y * S;

// worksheet Q23
const init = { A: { x: 2, y: 2 }, B: { x: 3, y: 5 }, Ex: 3, Ey: -4, q: 3 };

/** the part of the line E·p = c that lies inside the grid */
function clipLine(E: Vec2, c: number): [Vec2, Vec2] | null {
  const pts: Vec2[] = [];
  const add = (p: Vec2) => {
    if (p.x < -1e-9 || p.x > N + 1e-9 || p.y < -1e-9 || p.y > N + 1e-9) return;
    if (!pts.some((o) => Math.hypot(o.x - p.x, o.y - p.y) < 1e-6)) pts.push(p);
  };
  if (E.y !== 0) {
    add({ x: 0, y: c / E.y });
    add({ x: N, y: (c - E.x * N) / E.y });
  }
  if (E.x !== 0) {
    add({ x: c / E.x, y: 0 });
    add({ x: (c - E.y * N) / E.x, y: N });
  }
  return pts.length >= 2 ? [pts[0], pts[1]] : null;
}

export function UniformField() {
  const [A, setA] = useState(init.A);
  const [B, setB] = useState(init.B);
  const [Ex, setEx] = useState(init.Ex);
  const [Ey, setEy] = useState(init.Ey);
  const [q, setQ] = useState(init.q);

  const onMove = useCallback((k: 'A' | 'B', p: Vec2) => {
    const pt = {
      x: clamp(snap((p.x - OX) / S, 0.5), 0, N),
      y: clamp(snap((OY - p.y) / S, 0.5), 0, N),
    };
    (k === 'A' ? setA : setB)(pt);
  }, []);
  const bind = useDrag(onMove);

  const E = { x: Ex, y: Ey };
  const Emag = Math.hypot(Ex, Ey);
  const Sx = B.x - A.x;
  const Sy = B.y - A.y;
  const dV = deltaVUniform(E, A, B); // V_B − V_A
  const Wext = externalWork(q * 1e-6, dV);

  // equipotential lines every 5 V, taking V = 0 at the origin: V(p) = −E·p
  const lines: { a: Vec2; b: Vec2; V: number }[] = [];
  if (Emag > 0) {
    const corners = [0, Ex * N, Ey * N, (Ex + Ey) * N];
    const lo = Math.ceil(Math.min(...corners) / 5) * 5;
    const hi = Math.floor(Math.max(...corners) / 5) * 5;
    for (let c = lo; c <= hi; c += 5) {
      const seg = clipLine(E, c);
      if (seg) lines.push({ a: seg[0], b: seg[1], V: -c });
    }
  }

  const arrows: Vec2[] = [];
  for (let i = 1; i < N; i += 2) for (let j = 1; j < N; j += 2) arrows.push({ x: i, y: j });
  const u = Emag > 0 ? { x: Ex / Emag, y: Ey / Emag } : { x: 0, y: 0 };
  const al = 10 + 2.2 * Emag;

  return (
    <WidgetFrame
      title="สนามสม่ำเสมอ: จุด A และ B"
      notice="ลาก B ไปตามเส้นสมศักย์ (เส้นประ) $\Delta V$ จะไม่เปลี่ยน ลากไปตามทิศสนาม $V$ จะลดลง ค่าเริ่มต้นคือแบบฝึกหัดข้อ 23"
      onReset={() => {
        setA(init.A);
        setB(init.B);
        setEx(init.Ex);
        setEy(init.Ey);
        setQ(init.q);
      }}
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="stage">
        {Array.from({ length: N + 1 }, (_, i) => (
          <g key={i}>
            <line x1={X(i)} y1={Y(0)} x2={X(i)} y2={Y(N)} className="s-line" />
            <line x1={X(0)} y1={Y(i)} x2={X(N)} y2={Y(i)} className="s-line" />
            <text x={X(i)} y={OY + 15} textAnchor="middle" className="small mut">
              {i}
            </text>
            <text x={OX - 8} y={Y(i) + 4} textAnchor="end" className="small mut">
              {i}
            </text>
          </g>
        ))}
        <text x={X(N) + 4} y={OY + 15} className="small mut">
          m
        </text>
        {arrows.map((p, i) => (
          <Arrow
            key={i}
            x1={X(p.x) - (u.x * al) / 2}
            y1={Y(p.y) + (u.y * al) / 2}
            x2={X(p.x) + (u.x * al) / 2}
            y2={Y(p.y) - (u.y * al) / 2}
            w={1.6}
            head={6}
            opacity={0.55}
          />
        ))}
        {lines.map((l) => (
          <g key={l.V}>
            <line
              x1={X(l.a.x)}
              y1={Y(l.a.y)}
              x2={X(l.b.x)}
              y2={Y(l.b.y)}
              className="s-gauss"
              strokeWidth={1.3}
              strokeDasharray="5 4"
            />
            <text
              x={clamp(X((l.a.x + l.b.x) / 2), OX + 12, X(N) - 12)}
              y={Y((l.a.y + l.b.y) / 2) - 3}
              textAnchor="middle"
              className="small"
              style={{ fill: 'var(--gauss)' }}
            >
              {l.V} V
            </text>
          </g>
        ))}
        <Arrow x1={X(A.x)} y1={Y(A.y)} x2={X(B.x)} y2={Y(B.y)} cls="accent" w={2.5} head={9} />
        {(['A', 'B'] as const).map((k) => {
          const p = k === 'A' ? A : B;
          return (
            <g key={k} {...bind(k)} className="drag">
              <circle cx={X(p.x)} cy={Y(p.y)} r={22} fill="transparent" />
              <circle cx={X(p.x)} cy={Y(p.y)} r={9} className="f-accent" />
              <text x={X(p.x)} y={Y(p.y) + 4} textAnchor="middle" style={{ fill: 'var(--accent-ink)', fontWeight: 700, fontSize: 11 }}>
                {k}
              </text>
            </g>
          );
        })}
      </svg>
      <p className="small" style={{ margin: '6px 0 0' }}>
        เส้นประ = เส้นสมศักย์ทุก 5 V (ให้ V = 0 ที่จุดกำเนิด) · ลูกศรสีส้ม = ทิศสนาม
      </p>
      <div className="controls">
        <Slider label="$E_x$" value={Ex} min={-5} max={5} step={1} onChange={setEx} show={`${Ex} N/C`} />
        <Slider label="$E_y$" value={Ey} min={-5} max={5} step={1} onChange={setEy} show={`${Ey} N/C`} />
        <Slider label="ประจุที่พาไป $q$" value={q} min={-5} max={5} step={1} onChange={setQ} show={`${q > 0 ? '+' : ''}${q} μC`} />
      </div>
      <div className="readouts">
        <Readout k="A → B" v={`(${A.x}, ${A.y}) → (${B.x}, ${B.y}) m`} />
        <Readout k="$\vec S=\vec r_B-\vec r_A$" v={`${fmt(Sx)} î ${Sy < 0 ? '−' : '+'} ${fmt(Math.abs(Sy))} ĵ m`} />
        <Readout k="$\vec E\cdot\vec S$" v={`${fmt(-dV)} V`} />
        <Readout k="$\Delta V=V_B-V_A=-\vec E\cdot\vec S$" v={`${fmt(dV)} V`} hl />
        <Readout k="$V_A-V_B$" v={`${fmt(-dV)} V`} />
        <Readout k="$W_{ext}=q\,\Delta V$" v={`${fmt(Wext)} J`} hl />
      </div>
    </WidgetFrame>
  );
}
