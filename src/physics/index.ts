// Pure physics for the whole site. No UI code here.
// Widgets and practice answers must both call these functions.
// All quantities are SI (C, m, N/C, V, J) unless stated otherwise.

/** Coulomb constant used by the worksheet (N·m²/C²). */
export const K = 9.0e9;
/** Permittivity of free space used by the worksheet (C²/N·m²). */
export const EPS0 = 8.85e-12;

export interface Vec2 {
  x: number;
  y: number;
}

export interface PointCharge {
  q: number;
  x: number;
  y: number;
}

const dot = (a: Vec2, b: Vec2) => a.x * b.x + a.y * b.y;
const sub = (a: Vec2, b: Vec2): Vec2 => ({ x: a.x - b.x, y: a.y - b.y });
export const dist = (a: Vec2, b: Vec2) => Math.hypot(a.x - b.x, a.y - b.y);

// ---------------------------------------------------------------- flux

/** Φ = EA cosθ, θ in degrees between the field and the area vector. */
export function fluxUniform(E: number, A: number, thetaDeg: number): number {
  return E * A * Math.cos((thetaDeg * Math.PI) / 180);
}

/** Sum of the charges for which `contains` is true. */
export function enclosedCharge(
  charges: PointCharge[],
  contains: (p: Vec2) => boolean,
): number {
  return charges.reduce((s, c) => (contains(c) ? s + c.q : s), 0);
}

/** Gauss's law: net flux through a closed surface = q_in / ε0. */
export function netFlux(qIn: number): number {
  return qIn / EPS0;
}

// -------------------------------------------------------- point charges

/** Magnitude of the field of a point charge, k|q|/r². */
export function pointFieldMagnitude(q: number, r: number): number {
  return (K * Math.abs(q)) / (r * r);
}

/** Potential of a point charge, kq/r (keeps the sign of q). */
export function pointPotential(q: number, r: number): number {
  return (K * q) / r;
}

/** Vector field at p from a set of point charges (superposition). */
export function fieldAt(charges: PointCharge[], p: Vec2): Vec2 {
  let x = 0;
  let y = 0;
  for (const c of charges) {
    const dx = p.x - c.x;
    const dy = p.y - c.y;
    const r = Math.hypot(dx, dy);
    if (r === 0) continue;
    const e = (K * c.q) / (r * r * r);
    x += e * dx;
    y += e * dy;
  }
  return { x, y };
}

/** Potential at p from a set of point charges: k Σ q_i / r_i. */
export function potentialAt(charges: PointCharge[], p: Vec2): number {
  let v = 0;
  for (const c of charges) {
    const r = dist(c, p);
    if (r === 0) continue;
    v += (K * c.q) / r;
  }
  return v;
}

/** Potential energy of one pair, k q1 q2 / r. */
export function pairEnergy(q1: number, q2: number, r: number): number {
  return (K * q1 * q2) / r;
}

/** Total potential energy: one term per pair. */
export function systemEnergy(charges: PointCharge[]): number {
  let u = 0;
  for (let i = 0; i < charges.length; i++) {
    for (let j = i + 1; j < charges.length; j++) {
      u += pairEnergy(charges[i].q, charges[j].q, dist(charges[i], charges[j]));
    }
  }
  return u;
}

/** Number of pairs among n charges, n(n-1)/2. */
export function pairCount(n: number): number {
  return (n * (n - 1)) / 2;
}

// --------------------------------------------------------------- spheres

export type SphereKind = 'conductor' | 'insulator';

/** Charge inside a Gaussian sphere of radius r, for a ball of radius R and charge Q. */
export function sphereEnclosedCharge(
  kind: SphereKind,
  Q: number,
  R: number,
  r: number,
): number {
  if (r >= R) return Q;
  return kind === 'conductor' ? 0 : (Q * r ** 3) / R ** 3;
}

/** Radial field (positive = outward) of a charged ball at distance r from its centre. */
export function sphereField(kind: SphereKind, Q: number, R: number, r: number): number {
  if (r <= 0) return 0;
  if (r >= R) return (K * Q) / (r * r);
  return kind === 'conductor' ? 0 : (K * Q * r) / R ** 3;
}

/**
 * Potential of a charged ball (V = 0 at infinity).
 * Conductor: kQ/R everywhere inside. Outside either kind: kQ/r.
 * Inside a uniform insulator the course material gives no formula, so this returns null.
 */
export function spherePotential(
  kind: SphereKind,
  Q: number,
  R: number,
  r: number,
): number | null {
  if (r >= R) return (K * Q) / r;
  return kind === 'conductor' ? (K * Q) / R : null;
}

/** Q24(a): net charge of a conducting sphere whose potential is V0, Q = R·V0/k = 4πε0·R·V0. */
export function chargeFromSpherePotential(V0: number, R: number): number {
  return (R * V0) / K;
}

// ---------------------------------------------------------------- sheets

/** Magnitude of the field of one very large sheet, |σ|/2ε0. */
export function sheetField(sigma: number): number {
  return Math.abs(sigma) / (2 * EPS0);
}

export interface RegionField {
  /** x-component from sheet 1 (positive = pointing right). */
  e1: number;
  /** x-component from sheet 2. */
  e2: number;
  net: number;
}

export interface TwoSheetsResult {
  left: RegionField;
  middle: RegionField;
  right: RegionField;
}

/** Two parallel sheets, sheet 1 on the left. Field x-components in the three regions. */
export function twoSheets(sigma1: number, sigma2: number): TwoSheetsResult {
  const a = sigma1 / (2 * EPS0); // points away from a positive sheet
  const b = sigma2 / (2 * EPS0);
  const region = (e1: number, e2: number): RegionField => ({ e1, e2, net: e1 + e2 });
  return {
    left: region(-a, -b),
    middle: region(a, -b),
    right: region(a, b),
  };
}

// ------------------------------------------------------ hollow conductor

export interface ShellCharges {
  inner: number;
  outer: number;
}

/** Induced wall charges of a hollow conductor: inner = −q_cavity, outer = Q_net − inner. */
export function shellSurfaceCharges(qCavity: number, Qnet: number): ShellCharges {
  const inner = -qCavity;
  return { inner, outer: Qnet - inner };
}

export type ShellRegion = 'cavity' | 'metal' | 'outside';

export function shellRegion(R1: number, R2: number, r: number): ShellRegion {
  if (r < R1) return 'cavity';
  if (r <= R2) return 'metal';
  return 'outside';
}

/**
 * Radial field of a hollow conductor (inner radius R1, outer R2, net charge Qnet)
 * with a point charge q in the cavity. In the cavity the value assumes q sits at the centre;
 * in the metal and outside it is valid wherever q sits.
 */
export function shellField(
  qCavity: number,
  Qnet: number,
  R1: number,
  R2: number,
  r: number,
): number {
  switch (shellRegion(R1, R2, r)) {
    case 'cavity':
      return r > 0 ? (K * qCavity) / (r * r) : 0;
    case 'metal':
      return 0;
    case 'outside':
      return (K * (qCavity + Qnet)) / (r * r);
  }
}

/** Charge enclosed by a Gaussian sphere of radius r: insulating ball (Qball, radius a) inside a shell (b..c, Qshell). */
export function ballInShellEnclosed(
  Qball: number,
  a: number,
  Qshell: number,
  b: number,
  c: number,
  r: number,
): number {
  if (r < a) return (Qball * r ** 3) / a ** 3;
  if (r < b) return Qball;
  if (r <= c) return 0; // metal: E = 0 forces q_in = 0
  return Qball + Qshell;
}

/** Radial field for the lecture example "ball inside a conducting shell". */
export function ballInShellField(
  Qball: number,
  a: number,
  Qshell: number,
  b: number,
  c: number,
  r: number,
): number {
  if (r <= 0) return 0;
  return (K * ballInShellEnclosed(Qball, a, Qshell, b, c, r)) / (r * r);
}

// --------------------------------------------------------- uniform field

/** ΔV = V_B − V_A = −E·S, where S goes from A to B. */
export function deltaVUniform(E: Vec2, A: Vec2, B: Vec2): number {
  return -dot(E, sub(B, A));
}

/** Work by an external force moving q through ΔV at constant speed, W_ext = qΔV. */
export function externalWork(q: number, deltaV: number): number {
  return q * deltaV;
}

/** Work by the field, W_int = −qΔV. */
export function fieldWork(q: number, deltaV: number): number {
  return -q * deltaV;
}

// ------------------------------------------------------------ E from V

/** E_x = −dV/dx by central difference. */
export function fieldFromPotential1D(V: (x: number) => number, x: number, h = 1e-5): number {
  return -(V(x + h) - V(x - h)) / (2 * h);
}

/** (E_x, E_y) = −(∂V/∂x, ∂V/∂y) by central differences. */
export function fieldFromPotential2D(
  V: (x: number, y: number) => number,
  p: Vec2,
  h = 1e-5,
): Vec2 {
  return {
    x: -(V(p.x + h, p.y) - V(p.x - h, p.y)) / (2 * h),
    y: -(V(p.x, p.y + h) - V(p.x, p.y - h)) / (2 * h),
  };
}

// ---------------------------------------------------------- ring and disk

/** Potential on the axis of a ring (radius a, charge Q) at distance x from its centre. */
export function ringPotential(Q: number, a: number, x: number): number {
  return (K * Q) / Math.sqrt(a * a + x * x);
}

/** Axial field of the ring, kQx/(a²+x²)^{3/2}. */
export function ringField(Q: number, a: number, x: number): number {
  return (K * Q * x) / (a * a + x * x) ** 1.5;
}

/** Potential on the axis of a disk (radius R, density σ), x ≥ 0: 2πkσ[√(R²+x²) − x]. */
export function diskPotential(sigma: number, R: number, x: number): number {
  return 2 * Math.PI * K * sigma * (Math.sqrt(R * R + x * x) - x);
}

/** Axial field of the disk, x > 0: 2πkσ[1 − x/√(R²+x²)]. */
export function diskField(sigma: number, R: number, x: number): number {
  return 2 * Math.PI * K * sigma * (1 - x / Math.sqrt(R * R + x * x));
}

// ------------------------------------------------- two spheres on a wire

export interface TwoSpheresResult {
  q1: number;
  q2: number;
  /** Common potential. */
  V: number;
  /** Surface fields. */
  E1: number;
  E2: number;
}

/** Two far-apart conducting spheres joined by a wire share one potential: q1/q2 = r1/r2. */
export function twoSpheres(Qtotal: number, r1: number, r2: number): TwoSpheresResult {
  const q1 = (Qtotal * r1) / (r1 + r2);
  const q2 = Qtotal - q1;
  return {
    q1,
    q2,
    V: (K * q1) / r1,
    E1: (K * q1) / (r1 * r1),
    E2: (K * q2) / (r2 * r2),
  };
}

// Chapter 3 lives in its own file; re-exported so callers can keep importing from './physics'.
export * from './magnetism';
export * from './faraday';
