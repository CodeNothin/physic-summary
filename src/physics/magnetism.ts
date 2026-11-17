// =====================================================================
// Chapter 3 physics: Biot–Savart law and Ampère's law.
//
// Pure functions only (no React, no drawing). Widgets AND practice
// questions both call these, so a formula is written down exactly once.
// Every quantity is SI: C, kg, m, s, A (ampere), T (tesla), N, J.
//
// Coordinate convention used everywhere in this file:
//   x → right, y → up, z → out of the page (towards the reader).
//   So "+z" = out of page = ⊙, "−z" = into page = ⊗.
// =====================================================================

import type { Vec2 } from './index';

// ------------------------------------------------------------ constants

/** Permeability of free space, μ0 = 4π × 10⁻⁷ T·m/A (slide 12). */
export const MU0 = 4 * Math.PI * 1e-7;

/** Elementary charge as the worksheet writes it (C). */
export const E_CHARGE = 1.6e-19;

/** 1 MeV in joules, using the worksheet's elementary charge. */
export const MEV = 1e6 * E_CHARGE;

/** Proton mass as worksheet Q26 gives it (kg). */
export const PROTON_MASS = 1.66e-27;

// -------------------------------------------------------- 3-D vectors

/** A 3-D vector. Used for v, B, F and current directions. */
export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export const vec3 = (x: number, y: number, z: number): Vec3 => ({ x, y, z });

/**
 * Cross product a × b.
 * Memory aid (cyclic order): x̂ × ŷ = ẑ, ŷ × ẑ = x̂, ẑ × x̂ = ŷ,
 * and swapping the order flips the sign.
 */
export function cross(a: Vec3, b: Vec3): Vec3 {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
  };
}

export const add3 = (a: Vec3, b: Vec3): Vec3 => ({ x: a.x + b.x, y: a.y + b.y, z: a.z + b.z });
export const scale3 = (a: Vec3, k: number): Vec3 => ({ x: a.x * k, y: a.y * k, z: a.z * k });
export const mag3 = (a: Vec3) => Math.hypot(a.x, a.y, a.z);

// ===================================================================
// 1. Force on a moving charge (slides 3–5)
// ===================================================================

/** Magnetic force on a charge q moving with velocity v in field B:  F = q v × B. */
export function forceOnCharge(q: number, v: Vec3, B: Vec3): Vec3 {
  return scale3(cross(v, B), q);
}

/**
 * Size of the magnetic force, |F| = |q| v B sinθ,
 * where θ is the angle between v and B in degrees.
 */
export function forceOnChargeMagnitude(q: number, v: number, B: number, thetaDeg: number): number {
  return Math.abs(q) * v * B * Math.sin((thetaDeg * Math.PI) / 180);
}

/** Velocity selector (slide 5): straight-through speed when qE = qvB, so v = E / B. */
export function velocitySelectorSpeed(E: number, B: number): number {
  return E / B;
}

/** Speed from kinetic energy, K = ½mv²  ⇒  v = √(2K/m). */
export function speedFromKineticEnergy(m: number, K: number): number {
  return Math.sqrt((2 * K) / m);
}

/**
 * Radius of the circular path when v ⟂ B (worksheet Q26).
 * The magnetic force is the centripetal force: |q|vB = mv²/r  ⇒  r = mv / (|q|B).
 */
export function orbitRadius(m: number, v: number, q: number, B: number): number {
  return (m * v) / (Math.abs(q) * B);
}

/** Q26 in one call: radius for a particle of mass m and kinetic energy K (in joules). */
export function orbitRadiusFromKineticEnergy(m: number, K: number, q: number, B: number): number {
  return orbitRadius(m, speedFromKineticEnergy(m, K), q, B);
}

export interface ChargeState {
  /** position (m) */
  p: Vec2;
  /** velocity (m/s) */
  v: Vec2;
}

/**
 * Moves a charge through uniform fields that lie in the xy-plane picture:
 *   E = (E.x, E.y) in the page, B = Bz along z (out of page positive).
 * Uses the "Boris" method, which keeps the speed exact when E = 0,
 * so circles stay circles. Returns the list of positions.
 *
 * `stop(p)` lets a widget end the path early (for example when the
 * particle hits a plate).
 */
export function simulateCharge2D(opts: {
  q: number;
  m: number;
  start: ChargeState;
  E: Vec2;
  Bz: number;
  dt: number;
  steps: number;
  stop?: (p: Vec2) => boolean;
}): Vec2[] {
  const { q, m, E, Bz, dt, steps, stop } = opts;
  let p = { ...opts.start.p };
  let v = { ...opts.start.v };
  const out: Vec2[] = [{ ...p }];
  const k = (q / m) * (dt / 2);
  for (let i = 0; i < steps; i++) {
    // half kick from E
    const vm = { x: v.x + k * E.x, y: v.y + k * E.y };
    // rotation from B (t = q B dt / 2m)
    const t = k * Bz;
    const s = (2 * t) / (1 + t * t);
    const vPrime = { x: vm.x + vm.y * t, y: vm.y - vm.x * t };
    const vp = { x: vm.x + vPrime.y * s, y: vm.y - vPrime.x * s };
    // second half kick from E
    v = { x: vp.x + k * E.x, y: vp.y + k * E.y };
    p = { x: p.x + v.x * dt, y: p.y + v.y * dt };
    out.push({ ...p });
    if (stop?.(p)) break;
  }
  return out;
}

// ===================================================================
// 2. Force on a current-carrying wire (slides 6–11)
// ===================================================================

/** Straight wire: F = I L × B, with L pointing along the current. */
export function forceOnStraightWire(I: number, L: Vec3, B: Vec3): Vec3 {
  return scale3(cross(L, B), I);
}

/** Size of the wire force, |F| = I L B sinθ (θ between the wire and B, in degrees). */
export function forceOnWireMagnitude(I: number, L: number, B: number, thetaDeg: number): number {
  return Math.abs(I) * L * B * Math.sin((thetaDeg * Math.PI) / 180);
}

/**
 * Any wire made of straight pieces (a polyline): F = I Σ (ds × B).
 * In a uniform B this always equals I × (straight line from first to last point) × B,
 * which is the shortcut on slide 8.
 */
export function forceOnWirePath(I: number, points: Vec3[], B: Vec3): Vec3 {
  let F = vec3(0, 0, 0);
  for (let i = 1; i < points.length; i++) {
    const ds = add3(points[i], scale3(points[i - 1], -1));
    F = add3(F, cross(ds, B));
  }
  return scale3(F, I);
}

/**
 * Slides 9–11: semicircle of radius R on the x-axis, B = B ŷ (uniform, +y).
 * Current runs +x along the straight part (from (−R,0) to (R,0))
 * and back counter-clockwise along the arc (from (R,0) to (−R,0)).
 *   straight: F = I (2R x̂) × (B ŷ) = +2IRB ẑ  (out of page)
 *   curved:   F = −2IRB ẑ                      (into page)
 * The two cancel: the net force on a closed loop in uniform B is zero.
 */
export function semicircleForces(I: number, R: number, B: number): { straight: Vec3; curved: Vec3 } {
  return {
    straight: vec3(0, 0, 2 * I * R * B),
    curved: vec3(0, 0, -2 * I * R * B),
  };
}

/**
 * Force on the arc from angle 0 up to angle θ (radians), for the slide-9 geometry.
 * Integrating dF_z = −I R B sinθ dθ from 0 to θ gives  F_z = −I R B (1 − cosθ).
 * At θ = π this is the full arc, −2IRB.
 */
export function semicircleArcForceUpTo(I: number, R: number, B: number, theta: number): number {
  return -I * R * B * (1 - Math.cos(theta));
}

// ===================================================================
// 3. Biot–Savart law (slides 12–15)
// ===================================================================

/**
 * Field of a straight wire segment at a point P a distance a from the wire's line.
 * x1 and x2 are the positions of the two ends along the wire, measured from
 * the foot of the perpendicular from P (x1 < x2, current flowing from x1 to x2).
 *
 *   B = μ0 I / (4πa) · [ x2/√(x2²+a²) − x1/√(x1²+a²) ]
 *
 * Returned with sign: positive means ds × r̂ points out of the page
 * (current to the right, P above the wire).
 */
export function finiteWireFieldFromEnds(I: number, a: number, x1: number, x2: number): number {
  const s = (x: number) => x / Math.sqrt(x * x + a * a);
  return ((MU0 * I) / (4 * Math.PI * a)) * (s(x2) - s(x1));
}

/**
 * The same result written with the angles of slide 15.
 * θ1 and θ2 are measured from the perpendicular PO to the lines joining P to each end,
 * both counted as positive when the ends are on opposite sides of O:
 *
 *   B = μ0 I / (4πa) · (sin θ1 + sin θ2)
 *
 * TODO(professor-method): the slide leaves this blank. This is the
 * "sin θ1 + sin θ2" convention; change it here if the professor writes
 * sin θ2 − sin θ1 (signed angles) or cos θ1 − cos θ2 (angles from the wire).
 */
export function finiteWireField(I: number, a: number, theta1Deg: number, theta2Deg: number): number {
  const rad = Math.PI / 180;
  return ((MU0 * I) / (4 * Math.PI * a)) * (Math.sin(theta1Deg * rad) + Math.sin(theta2Deg * rad));
}

/**
 * Biot–Savart done numerically: chop a polyline into tiny pieces ds and add
 *   dB = μ0/(4π) · I ds × r̂ / r².
 * Used by the tests to check the closed-form answers above.
 */
export function biotSavartPolyline(I: number, points: Vec3[], P: Vec3, piecesPerSegment = 2000): Vec3 {
  let B = vec3(0, 0, 0);
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1];
    const seg = add3(points[i], scale3(a, -1));
    const ds = scale3(seg, 1 / piecesPerSegment);
    for (let k = 0; k < piecesPerSegment; k++) {
      const mid = add3(a, scale3(seg, (k + 0.5) / piecesPerSegment));
      const r = add3(P, scale3(mid, -1)); // from ds to P
      const rLen = mag3(r);
      if (rLen === 0) continue;
      // ds × r̂ / r² = ds × r / r³
      B = add3(B, scale3(cross(ds, r), 1 / rLen ** 3));
    }
  }
  return scale3(B, (MU0 * I) / (4 * Math.PI));
}

// ===================================================================
// 4. Ampère's law (slides 16–19, 25)
// ===================================================================

/** Long straight wire: B = μ0 I / (2π r). */
export function longWireField(I: number, r: number): number {
  return (MU0 * Math.abs(I)) / (2 * Math.PI * r);
}

/**
 * Current enclosed by an Amperian circle of radius r inside a thick wire
 * (radius R, total current I spread evenly over the cross-section):
 *   r < R : I_enc = I · r² / R²   (area fraction)
 *   r ≥ R : I_enc = I
 */
export function thickWireEnclosedCurrent(I: number, R: number, r: number): number {
  return r >= R ? I : (I * r * r) / (R * R);
}

/**
 * Field of the thick wire (slides 17–19):
 *   r < R : B = μ0 I r / (2π R²)   (grows like r)
 *   r ≥ R : B = μ0 I / (2π r)      (falls like 1/r)
 */
export function thickWireField(I: number, R: number, r: number): number {
  if (r <= 0) return 0;
  return (MU0 * Math.abs(thickWireEnclosedCurrent(I, R, r))) / (2 * Math.PI * r);
}

/** Turns per unit length, n = N / ℓ. */
export function turnsPerLength(N: number, length: number): number {
  return N / length;
}

/** Long tightly wound solenoid (slide 25): B_in = μ0 n I, and B_out ≈ 0. */
export function solenoidField(n: number, I: number): number {
  return MU0 * n * I;
}

// ---------------------------------------- many long wires, seen end-on

/**
 * A long straight wire perpendicular to the page, crossing it at (x, y).
 * I > 0 means the current comes OUT of the page (⊙), I < 0 means INTO the page (⊗).
 */
export interface LineCurrent {
  x: number;
  y: number;
  I: number;
}

/**
 * Field in the page at point p from end-on wires (superposition).
 * For one wire: B = μ0 I / (2π r²) · (ẑ × r⃗) = μ0 I / (2π r²) · (−r_y, r_x),
 * which is a circle around the wire, counter-clockwise for current out of the page.
 */
export function lineCurrentsField(wires: LineCurrent[], p: Vec2): Vec2 {
  let bx = 0;
  let by = 0;
  for (const w of wires) {
    const rx = p.x - w.x;
    const ry = p.y - w.y;
    const r2 = rx * rx + ry * ry;
    if (r2 === 0) continue;
    const k = (MU0 * w.I) / (2 * Math.PI * r2);
    bx += -ry * k;
    by += rx * k;
  }
  return { x: bx, y: by };
}

/** Ampère's law right-hand side: the current through the loop (counter-clockwise loop, ⊙ positive). */
export function enclosedCurrent(wires: LineCurrent[], contains: (p: Vec2) => boolean): number {
  return wires.reduce((s, w) => (contains(w) ? s + w.I : s), 0);
}

/**
 * Ampère's law left-hand side done numerically: ∮ B · ds around a closed polygon
 * (points listed counter-clockwise; the last point joins back to the first).
 * For any shape this comes out as μ0 × (enclosed current).
 */
export function circulation(wires: LineCurrent[], loop: Vec2[], subdivide = 40): number {
  let sum = 0;
  for (let i = 0; i < loop.length; i++) {
    const a = loop[i];
    const b = loop[(i + 1) % loop.length];
    for (let k = 0; k < subdivide; k++) {
      const t = (k + 0.5) / subdivide;
      const mid = { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
      const ds = { x: (b.x - a.x) / subdivide, y: (b.y - a.y) / subdivide };
      const B = lineCurrentsField(wires, mid);
      sum += B.x * ds.x + B.y * ds.y;
    }
  }
  return sum;
}

// --------------------------------------- long wires lying in the page

/**
 * Slide 20 geometry: a long vertical wire lying IN the page at x = xWire,
 * current Iy along +y (up) when positive. At a point at horizontal position x
 * (same page), the field is perpendicular to the page:
 *
 *   B_z = −μ0 Iy / (2π (x − xWire))
 *
 * Positive B_z = out of page (⊙), negative = into page (⊗).
 * Check: current up, point to the right ⇒ ŷ × x̂ = −ẑ ⇒ into page. ✓
 */
export function inPageWireBz(Iy: number, xWire: number, x: number): number {
  return (-MU0 * Iy) / (2 * Math.PI * (x - xWire));
}
