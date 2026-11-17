// =====================================================================
// Widget: point-charge sandbox.
// Up to 6 draggable ±2 nC charges and a probe P. Layers:
//   colour (canvas)   V on a grid of points: red = high, blue = low
//   contour lines     equipotentials, found with "marching squares"
//   arrows            the field direction on a coarse grid
// Read-outs: V and |E| at P, and the total potential energy (one term per pair).
// =====================================================================
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Arrow, ChargeDot, Readout, Toggle, WidgetFrame } from '../components/ui';
import { clamp, fmt } from '../lib/format';
import { useDrag } from '../lib/useDrag';
import { fieldAt, pairCount, potentialAt, systemEnergy } from '../physics';
import type { PointCharge, Vec2 } from '../physics';

const W = 320;
const H = 280;
const PX_PER_M = 100;
const CELL = 5; // px, grid step for heatmap and contours
const NX = W / CELL;
const NY = H / CELL;
const LEVELS = [-80, -40, -20, -10, -5, 0, 5, 10, 20, 40, 80]; // volts
const Q = 2e-9;

const toM = (p: Vec2): Vec2 => ({ x: p.x / PX_PER_M, y: p.y / PX_PER_M });
const start: PointCharge[] = [
  { q: Q, x: 110, y: 140 },
  { q: -Q, x: 210, y: 140 },
];
const startProbe = { x: 160, y: 70 };

/** marching squares: line segments where the grid crosses `level` */
function contour(grid: Float64Array, level: number): string {
  let d = '';
  const at = (i: number, j: number) => grid[j * (NX + 1) + i] - level;
  for (let j = 0; j < NY; j++) {
    for (let i = 0; i < NX; i++) {
      const a = at(i, j);
      const b = at(i + 1, j);
      const c = at(i + 1, j + 1);
      const e = at(i, j + 1);
      const pts: [number, number][] = [];
      if (a > 0 !== b > 0) pts.push([i + a / (a - b), j]);
      if (b > 0 !== c > 0) pts.push([i + 1, j + b / (b - c)]);
      if (e > 0 !== c > 0) pts.push([i + e / (e - c), j + 1]);
      if (a > 0 !== e > 0) pts.push([i, j + a / (a - e)]);
      for (let k = 0; k + 1 < pts.length; k += 2) {
        d += `M${(pts[k][0] * CELL).toFixed(1)} ${(pts[k][1] * CELL).toFixed(1)}L${(pts[k + 1][0] * CELL).toFixed(1)} ${(pts[k + 1][1] * CELL).toFixed(1)}`;
      }
    }
  }
  return d;
}

export function ChargeSandbox() {
  const [charges, setCharges] = useState(start);
  const [probe, setProbe] = useState(startProbe);
  const [heat, setHeat] = useState(true);
  const [equi, setEqui] = useState(true);
  const [arrows, setArrows] = useState(false);
  const canvas = useRef<HTMLCanvasElement>(null);

  const onMove = useCallback((k: number | 'probe', p: Vec2) => {
    const pt = { x: clamp(p.x, 12, W - 12), y: clamp(p.y, 12, H - 12) };
    if (k === 'probe') setProbe(pt);
    else setCharges((cs) => cs.map((c, i) => (i === k ? { ...c, ...pt } : c)));
  }, []);
  const bind = useDrag(onMove);

  const metres = useMemo(() => charges.map((c) => ({ ...c, ...toM(c) })), [charges]);

  // potential sampled on the grid corners, shared by heatmap and contours
  const grid = useMemo(() => {
    const g = new Float64Array((NX + 1) * (NY + 1));
    for (let j = 0; j <= NY; j++) {
      for (let i = 0; i <= NX; i++) {
        g[j * (NX + 1) + i] = potentialAt(metres, toM({ x: i * CELL + 0.01, y: j * CELL + 0.01 }));
      }
    }
    return g;
  }, [metres]);

  useEffect(() => {
    const cv = canvas.current;
    const ctx = cv?.getContext('2d');
    if (!cv || !ctx) return;
    const img = ctx.createImageData(NX + 1, NY + 1);
    for (let k = 0; k < grid.length; k++) {
      const t = heat ? Math.tanh(grid[k] / 45) : 0; // red = high V, blue = low V
      const o = k * 4;
      img.data[o] = t > 0 ? 220 : 37;
      img.data[o + 1] = t > 0 ? 38 : 99;
      img.data[o + 2] = t > 0 ? 38 : 235;
      img.data[o + 3] = Math.abs(t) * 200;
    }
    ctx.putImageData(img, 0, 0);
  }, [grid, heat]);

  const paths = useMemo(
    () => (equi ? LEVELS.map((L) => ({ L, d: contour(grid, L) })) : []),
    [grid, equi],
  );

  const fieldArrows = useMemo(() => {
    if (!arrows) return [];
    const out: { p: Vec2; u: Vec2; s: number }[] = [];
    for (let y = 20; y < H; y += 40) {
      for (let x = 20; x < W; x += 40) {
        if (charges.some((c) => Math.hypot(c.x - x, c.y - y) < 16)) continue;
        const e = fieldAt(metres, toM({ x, y }));
        const m = Math.hypot(e.x, e.y);
        if (m === 0) continue;
        out.push({ p: { x, y }, u: { x: e.x / m, y: e.y / m }, s: clamp(Math.log10(m + 1) / 3, 0.25, 1) });
      }
    }
    return out;
  }, [arrows, metres, charges]);

  const Vp = potentialAt(metres, toM(probe));
  const Ep = fieldAt(metres, toM(probe));
  const U = systemEnergy(metres);
  const add = (sign: 1 | -1) =>
    setCharges((cs) =>
      cs.length >= 6 ? cs : [...cs, { q: sign * Q, x: 60 + ((cs.length * 53) % 200), y: 50 + ((cs.length * 71) % 180) }],
    );

  return (
    <WidgetFrame
      title="ลองวางจุดประจุ (ประจุละ ±2 nC)"
      notice="สีแดงคือ $V$ สูง (เนิน) สีน้ำเงินคือ $V$ ต่ำ (หลุม) เปิดลูกศรสนามแล้วดูว่ามัน **ตั้งฉากกับเส้นสมศักย์** และชี้จากแดงไปน้ำเงินเสมอ ลองหาจุดที่ $V=0$ แต่ $E\neq0$"
      onReset={() => {
        setCharges(start);
        setProbe(startProbe);
        setHeat(true);
        setEqui(true);
        setArrows(false);
      }}
    >
      <div style={{ position: 'relative' }}>
        <canvas
          ref={canvas}
          width={NX + 1}
          height={NY + 1}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', borderRadius: 10 }}
        />
        <svg viewBox={`0 0 ${W} ${H}`} className="stage" style={{ position: 'relative', background: 'transparent' }}>
          {paths.map((p) => (
            <path
              key={p.L}
              d={p.d}
              className="f-none s-ink"
              strokeWidth={p.L === 0 ? 1.6 : 0.9}
              strokeDasharray={p.L === 0 ? '4 3' : undefined}
              opacity={0.7}
            />
          ))}
          {fieldArrows.map((a, i) => (
            <Arrow
              key={i}
              x1={a.p.x - a.u.x * 11}
              y1={a.p.y - a.u.y * 11}
              x2={a.p.x + a.u.x * 11}
              y2={a.p.y + a.u.y * 11}
              w={1.8}
              head={6}
              opacity={a.s}
            />
          ))}
          {charges.map((c, i) => (
            <g key={i} {...bind(i)} className="drag">
              <circle cx={c.x} cy={c.y} r={22} fill="transparent" />
              <ChargeDot x={c.x} y={c.y} q={c.q} />
            </g>
          ))}
          <g {...bind('probe')} className="drag">
            <circle cx={probe.x} cy={probe.y} r={22} fill="transparent" />
            <circle cx={probe.x} cy={probe.y} r={7} className="f-card s-ink" strokeWidth={2.5} />
            <text x={probe.x + 11} y={probe.y - 8} style={{ fontWeight: 700 }}>
              P
            </text>
          </g>
        </svg>
      </div>
      <div className="controls">
        <div className="seg">
          <Toggle on={heat} label="สีของศักย์" onChange={setHeat} />
          <Toggle on={equi} label="เส้นสมศักย์" onChange={setEqui} />
          <Toggle on={arrows} label="ลูกศรสนาม" onChange={setArrows} />
        </div>
        <div className="seg">
          <button onClick={() => add(1)} disabled={charges.length >= 6}>
            เพิ่มประจุ +
          </button>
          <button onClick={() => add(-1)} disabled={charges.length >= 6}>
            เพิ่มประจุ −
          </button>
          <button onClick={() => setCharges((cs) => cs.slice(0, -1))} disabled={charges.length === 0}>
            ลบตัวล่าสุด
          </button>
        </div>
      </div>
      <div className="readouts">
        <Readout k="$V$ ที่จุด P $=k\sum q_i/r_i$" v={`${fmt(Vp)} V`} hl />
        <Readout k="$|\vec E|$ ที่จุด P" v={`${fmt(Math.hypot(Ep.x, Ep.y))} N/C`} />
        <Readout
          k={`พลังงานรวม $U$ (${charges.length} ประจุ = ${pairCount(charges.length)} คู่)`}
          v={`${fmt(U)} J`}
          hl
        />
      </div>
      <p className="small" style={{ margin: '6px 0 0' }}>
        มาตราส่วน: กว้าง 3.2 m · เส้นสมศักย์ที่ 0, ±5, ±10, ±20, ±40, ±80 V (เส้นประ = 0 V)
      </p>
    </WidgetFrame>
  );
}
