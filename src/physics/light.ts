// =====================================================================
// Chapter 6 physics: light — refraction, total internal reflection,
// interference, diffraction, gratings and polarization (slides 2–43,
// worksheet Q31–33).
//
// Pure functions only (no React, no drawing). Widgets, practice
// questions and worksheet questions all call these.
// SI units throughout (m, s, rad inside the maths). Functions whose
// name ends in "Deg" take or return angles in DEGREES, because the
// slides and worksheet give angles in degrees.
// c = 3×10⁸ m/s, as on the exam sheet (C_LIGHT from emwave.ts).
// =====================================================================
import { C_LIGHT } from './emwave';

const rad = (deg: number) => (deg * Math.PI) / 180;
const deg = (r: number) => (r * 180) / Math.PI;

// ===================================================================
// 1. Speed of light in matter (slide 2)
// ===================================================================

/** Speed of light in a material with relative permittivity Ke and permeability Km: v = c/√(Ke Km). */
export function speedInMatter(Ke: number, Km = 1, c = C_LIGHT): number {
  return c / Math.sqrt(Ke * Km);
}

/** Speed of light in a medium of refractive index n: n = c/v, so v = c/n. */
export function speedFromIndex(n: number, c = C_LIGHT): number {
  return c / n;
}

/** Wavelength inside the medium: λ = λₙ n, so λₙ = λ/n (the frequency does not change). */
export function wavelengthInMedium(lambdaVacuum: number, n: number): number {
  return lambdaVacuum / n;
}

// ===================================================================
// 2. Refraction and total internal reflection (slides 4–9)
// ===================================================================

/**
 * Snell's law n₁ sinθ₁ = n₂ sinθ₂. Returns θ₂ in degrees, or null when
 * sinθ₂ would be above 1 (total internal reflection: no refracted ray).
 */
export function snellDeg(n1: number, theta1Deg: number, n2: number): number | null {
  const s = (n1 * Math.sin(rad(theta1Deg))) / n2;
  if (s > 1) return null;
  return deg(Math.asin(s));
}

/**
 * Critical angle for light going from n₁ into a smaller n₂: sinθc = n₂/n₁
 * (θ₂ = 90°). Returns null when n₂ ≥ n₁ (no total internal reflection).
 */
export function criticalAngleDeg(n1: number, n2: number): number | null {
  if (n2 >= n1) return null;
  return deg(Math.asin(n2 / n1));
}

/**
 * Slide 9: a full cylindrical tank of diameter D, the sun at `elevDeg`
 * above the horizon. The ray entering at one rim must just miss the far
 * bottom corner, so tanθ₂ = D/h and the least depth is h = D/tanθ₂.
 * The angle of incidence is measured from the normal: 90° − elevation.
 */
export function tankMinDepth(D: number, elevDeg: number, nWater: number): number {
  const theta2 = snellDeg(1, 90 - elevDeg, nWater)!;
  return D / Math.tan(rad(theta2));
}

/**
 * Worksheet Q33: a beam enters a flat plate of thickness d at angle
 * `incDeg` (from the normal) and comes out a sideways distance x further
 * on. Path inside L = √(d² + x²), sinθ = x/L, n = sin(inc)/sinθ, v = c/n,
 * so t = L/v = L² sin(inc) / (c x).
 */
export function plateTime(d: number, x: number, incDeg: number, c = C_LIGHT): number {
  return ((d * d + x * x) * Math.sin(rad(incDeg))) / (c * x);
}

/** The plate's refractive index in Q33: n = sin(inc) / (x/√(d² + x²)). */
export function plateIndex(d: number, x: number, incDeg: number): number {
  return Math.sin(rad(incDeg)) / (x / Math.hypot(d, x));
}

// ===================================================================
// 3. Young's double slit (slides 10–15, worksheet Q31–32)
// ===================================================================

/** Path difference to a point at angle θ: δ = r₂ − r₁ = d sinθ. */
export function pathDifference(d: number, thetaDeg: number): number {
  return d * Math.sin(rad(thetaDeg));
}

/** Phase difference from path difference: φ/2π = δ/λ. */
export function phaseFromPath(delta: number, lambda: number): number {
  return (2 * Math.PI * delta) / lambda;
}

/** m-th bright fringe on the screen (small angles): y = mλL/d, m = 0, ±1, ±2, … */
export function brightY(m: number, lambda: number, L: number, d: number): number {
  return (m * lambda * L) / d;
}

/**
 * Dark fringe using the sheet's numbering: y = (λL/d)(m + ½), m = 0, ±1, …
 * m = 0 is the FIRST dark fringe (slide 11: "แถบมืดที่ m+1").
 */
export function darkY(m: number, lambda: number, L: number, d: number): number {
  return ((m + 0.5) * lambda * L) / d;
}

/** Distance between neighbouring bright (or dark) fringes: Δy = λL/d. */
export function fringeSpacing(lambda: number, L: number, d: number): number {
  return (lambda * L) / d;
}

/**
 * Two-slit intensity at height y on the screen, as a fraction of I_max:
 * I/I_max = cos²(φ/2) with φ = (2π/λ) d sinθ and sinθ ≈ y/L.
 */
export function doubleSlitRatio(y: number, lambda: number, L: number, d: number): number {
  return Math.cos((Math.PI * d * y) / (lambda * L)) ** 2;
}

/** Same, written with the angle: I/I_max = cos²(π d sinθ / λ). */
export function doubleSlitRatioAngle(thetaDeg: number, lambda: number, d: number): number {
  return Math.cos((Math.PI * d * Math.sin(rad(thetaDeg))) / lambda) ** 2;
}

/**
 * Smallest y > 0 where the two-slit intensity falls to `frac` of I_max
 * (slide 15 asks for ¾): cos²(πdy/λL) = frac ⇒ y = (λL/πd) arccos(√frac).
 */
export function yAtIntensity(frac: number, lambda: number, L: number, d: number): number {
  return ((lambda * L) / (Math.PI * d)) * Math.acos(Math.sqrt(frac));
}

/** Screen distance from the m-th bright fringe at y_m: L = d y_m / (mλ) (Q32 first step). */
export function screenDistanceFromBright(ym: number, m: number, lambda: number, d: number): number {
  return (d * ym) / (m * lambda);
}

// ===================================================================
// 4. Single slit, resolution (slides 17–28)
// ===================================================================

/** Dark fringes of a single slit of width a: sinθ_dark = mλ/a, m = ±1, ±2, …  Returns θ in degrees. */
export function singleSlitDarkDeg(m: number, lambda: number, a: number): number | null {
  const s = (m * lambda) / a;
  if (Math.abs(s) > 1) return null;
  return deg(Math.asin(s));
}

/** Position of the m-th single-slit dark fringe on a screen D away (small angles): y = mλD/a. */
export function singleSlitDarkY(m: number, lambda: number, D: number, a: number): number {
  return (m * lambda * D) / a;
}

/** Width of the central bright band: from the first dark on one side to the other, 2λD/a. */
export function centralWidth(lambda: number, D: number, a: number): number {
  return (2 * lambda * D) / a;
}

/**
 * Single-slit intensity as a fraction of I_max at angle θ:
 * I/I_m = (sinα/α)², α = (πa/λ) sinθ (slide 18).
 */
export function singleSlitRatio(thetaDeg: number, lambda: number, a: number): number {
  const alpha = (Math.PI * a * Math.sin(rad(thetaDeg))) / lambda;
  if (Math.abs(alpha) < 1e-12) return 1;
  return (Math.sin(alpha) / alpha) ** 2;
}

/**
 * Double slit with slits of width a (slide 22): the interference cos²
 * multiplied by the single-slit envelope.
 */
export function doubleSlitWithWidthRatio(thetaDeg: number, lambda: number, d: number, a: number): number {
  return doubleSlitRatioAngle(thetaDeg, lambda, d) * singleSlitRatio(thetaDeg, lambda, a);
}

/** Rayleigh limit of a slit: θ_min = λ/a (radians). */
export function rayleighSlit(lambda: number, a: number): number {
  return lambda / a;
}

/** Rayleigh limit of a circular opening of diameter D: θ_R = 1.22 λ/D (radians). */
export function rayleighCircle(lambda: number, D: number): number {
  return (1.22 * lambda) / D;
}

// ===================================================================
// 5. Diffraction grating (slides 29–34)
// ===================================================================

/** Slit spacing of a grating with N lines in a length `len`: d = len / N. */
export function gratingSpacing(N: number, len: number): number {
  return len / N;
}

/** Angle of the m-th order bright line: d sinθ = mλ. Degrees, or null if that order does not exist. */
export function gratingAngleDeg(m: number, lambda: number, d: number): number | null {
  const s = (m * lambda) / d;
  if (Math.abs(s) > 1) return null;
  return deg(Math.asin(s));
}

/** Highest order that can be seen: the largest whole m with mλ < d. */
export function gratingMaxOrder(lambda: number, d: number): number {
  const m = Math.floor(d / lambda);
  // exactly d = mλ would need θ = 90°, which never reaches a screen
  return m * lambda === d ? m - 1 : m;
}

// ===================================================================
// 6. Polarization (slides 35–43)
// ===================================================================

/** Malus's law: polarized light through a polarizer at θ to its field: I = I_max cos²θ. */
export function malus(I: number, thetaDeg: number): number {
  return I * Math.cos(rad(thetaDeg)) ** 2;
}

/**
 * Light through a stack of polarizers whose axes make the angles `axesDeg`
 * with the vertical (slides 38–39).
 * `inputDeg` = direction of the incoming polarization from the vertical,
 * or null for UNPOLARIZED light (the first sheet then passes ½ of it).
 * Returns the intensity after each sheet.
 */
export function polarizerStack(I0: number, axesDeg: number[], inputDeg: number | null): number[] {
  const out: number[] = [];
  let I = I0;
  let dir = inputDeg;
  for (const a of axesDeg) {
    I = dir === null ? I / 2 : malus(I, a - dir);
    dir = a;
    out.push(I);
  }
  return out;
}

/** Brewster (polarizing) angle from air into index n: n = tanθp. Degrees. */
export function brewsterDeg(n: number, n1 = 1): number {
  return deg(Math.atan(n / n1));
}
