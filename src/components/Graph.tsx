// =====================================================================
// A small line graph drawn in SVG, used by widgets for E(r), V(r), B(r)...
// Give it a function `fn(x)`, the x range, and optionally a marker
// position (the widget's current value) and dashed guide lines.
// The y range is chosen automatically and always includes y = 0.
// =====================================================================
import { fmt } from '../lib/format';

export interface GraphProps {
  /** y(x); return null where the curve is undefined. */
  fn: (x: number) => number | null;
  xMin?: number;
  xMax: number;
  /** x of the moving marker. */
  marker?: number;
  /** dashed vertical guides, e.g. the sphere surface. */
  guides?: { x: number; label: string }[];
  yLabel: string;
  xLabel: string;
  unit: string;
  cls?: string;
  height?: number;
  /** text shown over an undefined stretch of the curve */
  gapNote?: { x: number; text: string };
}

const W = 320;
const PAD = { l: 8, r: 8, t: 20, b: 20 };

/** Small SVG line plot with a marker. Auto-scales y, always includes y = 0. */
export function Graph({
  fn,
  xMin = 0,
  xMax,
  marker,
  guides = [],
  yLabel,
  xLabel,
  unit,
  cls = 'accent',
  height = 130,
  gapNote,
}: GraphProps) {
  const N = 160;
  const pts: { x: number; y: number | null }[] = [];
  for (let i = 0; i <= N; i++) {
    const x = xMin + ((xMax - xMin) * i) / N;
    pts.push({ x, y: fn(x) });
  }
  // sample right next to each guide so jumps (conductor surface) are drawn sharply
  for (const g of guides) {
    for (const x of [g.x - 1e-9, g.x]) pts.push({ x, y: fn(x) });
  }
  pts.sort((a, b) => a.x - b.x);

  const ys = pts.map((p) => p.y).filter((y): y is number => y !== null && Number.isFinite(y));
  let lo = Math.min(0, ...ys);
  let hi = Math.max(0, ...ys);
  if (hi === lo) hi = lo + 1;
  const span = hi - lo;
  lo -= lo < 0 ? span * 0.08 : 0;
  hi += hi > 0 ? span * 0.08 : 0;

  const X = (x: number) => PAD.l + ((x - xMin) / (xMax - xMin)) * (W - PAD.l - PAD.r);
  const Y = (y: number) => PAD.t + (1 - (y - lo) / (hi - lo)) * (height - PAD.t - PAD.b);

  let d = '';
  let pen = false;
  for (const p of pts) {
    if (p.y === null || !Number.isFinite(p.y)) {
      pen = false;
      continue;
    }
    d += `${pen ? 'L' : 'M'}${X(p.x).toFixed(1)} ${Y(p.y).toFixed(1)} `;
    pen = true;
  }

  const my = marker === undefined ? null : fn(marker);

  return (
    <svg viewBox={`0 0 ${W} ${height}`} className="stage pan-y" role="img" aria-label={`กราฟ ${yLabel}`}>
      <line x1={PAD.l} y1={Y(0)} x2={W - PAD.r} y2={Y(0)} className="s-muted" strokeWidth={1} />
      {guides.map((g) => (
        <g key={g.label}>
          <line x1={X(g.x)} y1={PAD.t} x2={X(g.x)} y2={height - PAD.b} className="s-muted" strokeDasharray="3 3" />
          <text x={X(g.x)} y={height - 6} textAnchor="middle" className="small mut">
            {g.label}
          </text>
        </g>
      ))}
      <path d={d} className={`f-none s-${cls}`} strokeWidth={2.4} strokeLinejoin="round" />
      {gapNote && (
        <text x={X(gapNote.x)} y={Y((hi + lo) / 2)} textAnchor="middle" className="small mut">
          {gapNote.text}
        </text>
      )}
      <text x={PAD.l + 2} y={13} style={{ fontWeight: 700 }}>
        {yLabel}
      </text>
      <text x={W - PAD.r} y={height - 6} textAnchor="end" className="small mut">
        {xLabel}
      </text>
      {marker !== undefined && (
        <g>
          <line x1={X(marker)} y1={PAD.t} x2={X(marker)} y2={height - PAD.b} className="s-gauss" strokeWidth={1.5} />
          {my !== null && Number.isFinite(my) && (
            <>
              <circle cx={X(marker)} cy={Y(my)} r={5} className="f-gauss" />
              <text
                x={X(marker) > W * 0.62 ? X(marker) - 8 : X(marker) + 8}
                y={Math.max(PAD.t + 10, Y(my) - 8)}
                textAnchor={X(marker) > W * 0.62 ? 'end' : 'start'}
                style={{ fontWeight: 700 }}
              >
                {fmt(my)} {unit}
              </text>
            </>
          )}
        </g>
      )}
    </svg>
  );
}
