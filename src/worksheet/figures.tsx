// =====================================================================
// Small figures for worksheet questions ("ดังรูป" in the worksheet).
// A question asks for one with `figure: { id: 'q21', props: {...} }`;
// <Figure> below looks the id up in `figures` and passes the numbers.
// To add one: write a component taking `p` (the props numbers) and add
// it to `figures` under the same id the question uses.
// =====================================================================
import type { ReactNode } from 'react';
import { Arrow, ChargeDot, OutIn } from '../components/ui';

type Props = Record<string, number>;

/** Q21: hollow conductor (inner r1, outer r2) with a point charge off-centre. */
function Q21({ p }: { p: Props }) {
  const C = { x: 110, y: 100 };
  const s = 80 / p.R2; // pixels per metre, so the outer radius is 80 px
  const r1 = p.R1 * s;
  const r2 = p.R2 * s;
  return (
    <svg viewBox="0 0 220 200" className="stage pan-y" style={{ maxWidth: 260 }}>
      <circle cx={C.x} cy={C.y} r={r2} className="f-metal" stroke="var(--muted)" />
      <circle cx={C.x} cy={C.y} r={r1} className="f-card" stroke="var(--muted)" />
      <circle cx={C.x} cy={C.y} r={2.5} className="f-ink" />
      <text x={C.x - 4} y={C.y + 14} className="small">o</text>
      <ChargeDot x={C.x + p.d * s * 0.7} y={C.y - p.d * s * 0.7} q={1} rad={7} />
      <text x={C.x + p.d * s * 0.7 + 9} y={C.y - p.d * s * 0.7 - 6} className="small">q</text>
      <Arrow x1={C.x} y1={C.y} x2={C.x + r1 * 0.94} y2={C.y + r1 * 0.34} cls="muted" w={1.3} head={5} />
      <text x={C.x + r1 * 0.45} y={C.y + r1 * 0.38} className="small">r₁</text>
      <Arrow x1={C.x} y1={C.y} x2={C.x - r2 * 0.6} y2={C.y + r2 * 0.8} cls="muted" w={1.3} head={5} />
      <text x={C.x - r2 * 0.42} y={C.y + r2 * 0.4} className="small">r₂</text>
      <text x={6} y={16} className="small mut">ตัวนำกลวง ประจุสุทธิ Q</text>
    </svg>
  );
}

/** Q22: two large sheets seen edge-on, +nσ on the left, −mσ on the right. */
function Q22({ p }: { p: Props }) {
  const coef = (n: number) => (n === 1 ? '' : String(n));
  return (
    <svg viewBox="0 0 220 150" className="stage pan-y" style={{ maxWidth: 260 }}>
      <rect x={60} y={15} width={6} height={115} className="f-pos" />
      <rect x={154} y={15} width={6} height={115} className="f-neg" />
      <text x={63} y={146} textAnchor="middle" style={{ fontWeight: 700 }}>
        +{coef(p.n)}σ
      </text>
      <text x={157} y={146} textAnchor="middle" style={{ fontWeight: 700 }}>
        −{coef(p.m)}σ
      </text>
      <text x={110} y={76} textAnchor="middle" className="small mut">
        E = ?
      </text>
    </svg>
  );
}

/** Q27: top view of the xy-plane (z out of the page). A at (0, a) carries current out (⊙), B at (b, 0) into (⊗). */
function Q27({ p }: { p: Props }) {
  const O = { x: 50, y: 132 };
  const s = 100 / Math.max(p.a, p.b, 1); // px per metre
  const A = { x: O.x, y: O.y - p.a * s };
  const B = { x: O.x + p.b * s, y: O.y };
  return (
    <svg viewBox="0 0 220 180" className="stage pan-y" style={{ maxWidth: 260 }}>
      <Arrow x1={O.x - 20} y1={O.y} x2={205} y2={O.y} cls="muted" w={1.2} head={6} />
      <Arrow x1={O.x} y1={O.y + 20} x2={O.x} y2={10} cls="muted" w={1.2} head={6} />
      <text x={207} y={O.y + 14} className="small">x</text>
      <text x={O.x + 6} y={14} className="small">y</text>
      <circle cx={O.x} cy={O.y} r={3.5} className="f-ink" />
      <text x={O.x - 4} y={O.y + 20} className="small" style={{ fontWeight: 700 }}>
        หา B ที่ (0,0,0)
      </text>
      <OutIn x={A.x} y={A.y} out size={9} cls="cur" />
      <text x={A.x + 14} y={A.y + 4} className="small">A (y = a) ⊙ +k̂</text>
      <OutIn x={B.x} y={B.y} out={false} size={9} cls="cur" />
      <text x={B.x - 30} y={B.y - 14} className="small">B (x = b) ⊗ −k̂</text>
      <text x={6} y={176} className="small mut">มองจากแกน +z ลงมา (z ชี้ออกจากจอ)</text>
    </svg>
  );
}

/**
 * Q28: series RL circuit as drawn in the worksheet: L and R along the
 * top, battery E and switch S along the bottom. No numbers needed.
 */
function Q28() {
  const y1 = 40; // top wire
  const y2 = 120; // bottom wire
  // inductor coil: a row of small half-circles
  const coil = Array.from({ length: 5 }, () => `a7 7 0 0 1 14 0`).join(' ');
  return (
    <svg viewBox="0 0 220 150" className="stage pan-y" style={{ maxWidth: 260 }}>
      {/* left and right sides */}
      <line x1={30} y1={y1} x2={30} y2={y2} className="s-ink" strokeWidth={2} />
      <line x1={190} y1={y1} x2={190} y2={y2} className="s-ink" strokeWidth={2} />
      {/* top: wire, inductor, wire, resistor, wire */}
      <path d={`M30 ${y1} L40 ${y1} ${coil} L110 ${y1}`} className="f-none s-ink" strokeWidth={2} />
      <path
        d={`M110 ${y1} L118 ${y1} ${[...Array(6)].map((_, i) => `L${122 + i * 8} ${y1 + (i % 2 ? 7 : -7)}`).join(' ')} L170 ${y1} L190 ${y1}`}
        className="f-none s-ink"
        strokeWidth={2}
      />
      <text x={75} y={y1 - 14} textAnchor="middle" className="small" style={{ fontWeight: 700 }}>L</text>
      <text x={142} y={y1 - 14} textAnchor="middle" className="small" style={{ fontWeight: 700 }}>R</text>
      {/* bottom: battery (long + short plate) then the open switch */}
      <line x1={30} y1={y2} x2={70} y2={y2} className="s-ink" strokeWidth={2} />
      <line x1={70} y1={y2 - 14} x2={70} y2={y2 + 14} className="s-ink" strokeWidth={2} />
      <line x1={78} y1={y2 - 7} x2={78} y2={y2 + 7} className="s-ink" strokeWidth={4} />
      <line x1={78} y1={y2} x2={130} y2={y2} className="s-ink" strokeWidth={2} />
      <text x={74} y={y2 + 30} textAnchor="middle" className="small" style={{ fontWeight: 700 }}>E</text>
      <circle cx={130} cy={y2} r={3} className="f-ink" />
      <line x1={130} y1={y2} x2={158} y2={y2 - 16} className="s-ink" strokeWidth={2} />
      <circle cx={162} cy={y2} r={3} className="f-ink" />
      <line x1={162} y1={y2} x2={190} y2={y2} className="s-ink" strokeWidth={2} />
      <text x={148} y={y2 + 22} textAnchor="middle" className="small" style={{ fontWeight: 700 }}>S</text>
    </svg>
  );
}

/**
 * Q31: (A) double slit with d, L and x to the first dark fringe;
 * (B) the screen moved back by ΔL, so x grows to x + Δx.
 * Fringes on each screen are drawn as short dark/light bars.
 */
function Q31() {
  const panel = (ox: number, label: string, moved: boolean) => {
    const bx = ox + 18; // barrier with the two slits
    const sx = ox + (moved ? 128 : 100); // screen
    const cy = 78; // centre line
    const half = moved ? 15 : 11; // pixels from centre to the first dark fringe
    return (
      <g>
        {/* barrier with two small gaps at cy ± 16 */}
        <line x1={bx} y1={20} x2={bx} y2={cy - 19} className="s-ink" strokeWidth={3} />
        <line x1={bx} y1={cy - 13} x2={bx} y2={cy + 13} className="s-ink" strokeWidth={3} />
        <line x1={bx} y1={cy + 19} x2={bx} y2={136} className="s-ink" strokeWidth={3} />
        <text x={bx - 14} y={cy + 4} className="small">d</text>
        <line x1={bx - 5} y1={cy - 16} x2={bx - 5} y2={cy + 16} className="s-muted" strokeWidth={1} />
        {/* old screen position in (B) */}
        {moved && <line x1={ox + 100} y1={24} x2={ox + 100} y2={132} className="s-muted" strokeWidth={1.2} strokeDasharray="4 3" />}
        {/* screen with fringes: bright at the centre, dark at ±half, … */}
        <rect x={sx} y={24} width={7} height={108} className="f-card s-ink" strokeWidth={1} />
        {[-3, -2, -1, 0, 1, 2]
          .map((j) => cy + half * (2 * j + 1) - half / 2) // top of each dark mark
          .filter((y) => y >= 24 && y + half <= 132) // keep only marks that fit on the screen
          .map((y) => (
            <rect key={y} x={sx} y={y} width={7} height={half} className="f-ink" opacity={0.75} />
          ))}
        <line x1={bx} y1={cy} x2={sx} y2={cy} className="s-muted" strokeWidth={1} strokeDasharray="3 3" />
        {/* x (or x + Δx) beside the screen */}
        <line x1={sx + 12} y1={cy} x2={sx + 12} y2={cy - half} className="s-accent" strokeWidth={1.6} />
        <text x={sx + 15} y={cy - half / 2 + 4} className="small">{moved ? 'x+Δx' : 'x'}</text>
        {/* L (and ΔL) under the picture */}
        <line x1={bx} y1={146} x2={ox + 100} y2={146} className="s-muted" strokeWidth={1} />
        <text x={(bx + ox + 100) / 2 - 3} y={158} className="small">L</text>
        {moved && (
          <>
            <line x1={ox + 100} y1={146} x2={sx} y2={146} className="s-accent" strokeWidth={1.4} />
            <text x={ox + 104} y={158} className="small">ΔL</text>
          </>
        )}
        <text x={ox + 60} y={14} textAnchor="middle" className="small" style={{ fontWeight: 700 }}>
          {label}
        </text>
      </g>
    );
  };
  return (
    <svg viewBox="0 0 330 165" className="stage pan-y" style={{ maxWidth: 380 }}>
      {panel(0, '(A)', false)}
      {panel(160, '(B)', true)}
    </svg>
  );
}

/**
 * Q33: a beam enters a plate of thickness d from the upper right at the
 * angle `inc` to the normal, bends inside, and leaves a sideways
 * distance x further on (x is measured between the two dashed normals).
 */
function Q33({ p }: { p: Props }) {
  const top = 50;
  const bot = 110;
  const ex = 140; // entry point
  const xx = 46; // sideways shift on screen
  const t = ((p.inc ?? 60) * Math.PI) / 180;
  return (
    <svg viewBox="0 0 240 170" className="stage pan-y" style={{ maxWidth: 280 }}>
      <rect x={30} y={top} width={180} height={bot - top} className="f-metal" opacity={0.6} />
      <line x1={ex} y1={12} x2={ex} y2={150} className="s-muted" strokeWidth={1} strokeDasharray="4 3" />
      <line x1={ex - xx} y1={12} x2={ex - xx} y2={150} className="s-muted" strokeWidth={1} strokeDasharray="4 3" />
      {/* incoming ray, the path inside, and the outgoing ray (parallel to the incoming one) */}
      <line x1={ex + 48 * Math.tan(t)} y1={top - 48} x2={ex} y2={top} className="s-ink" strokeWidth={2} />
      <line x1={ex} y1={top} x2={ex - xx} y2={bot} className="s-ink" strokeWidth={2} />
      <line x1={ex - xx} y1={bot} x2={ex - xx - 34 * Math.tan(t)} y2={bot + 34} className="s-ink" strokeWidth={2} />
      <text x={ex + 6} y={top - 30} className="small">{`${p.inc ?? 60}°`}</text>
      {/* d on the left, x at the bottom */}
      <line x1={40} y1={top} x2={40} y2={bot} className="s-accent" strokeWidth={1.4} />
      <text x={45} y={(top + bot) / 2 + 4} className="small">d</text>
      <line x1={ex - xx} y1={158} x2={ex} y2={158} className="s-accent" strokeWidth={1.4} />
      <text x={ex - xx / 2 - 3} y={168} className="small">x</text>
    </svg>
  );
}

const figures: Record<string, (x: { p: Props }) => ReactNode> = { q21: Q21, q22: Q22, q27: Q27, q28: Q28, q31: Q31, q33: Q33 };

export function Figure({ id, props }: { id: string; props: Props }) {
  const F = figures[id];
  return F ? <F p={props} /> : null;
}
