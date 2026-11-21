// =====================================================================
// Chapter 5 physics: electromagnetic waves (slides 2–21, worksheet
// Q29–30).
//
// Pure functions only (no React, no drawing). Widgets, practice
// questions and worksheet questions all call these.
// Every quantity is SI: V/m, T, m, Hz, rad/s, W, W/m², J, Pa, N.
//
// The speed of light is the exam sheet's c = 3×10⁸ m/s (C_LIGHT), not
// 1/√(μ0ε0) = 2.998×10⁸, so answers match the worksheet's answer key.
// =====================================================================
import { EPS0 } from './index';
import { MU0, cross } from './magnetism';
import type { Vec3 } from './magnetism';

/** Speed of light as the exam sheet writes it, 3×10⁸ m/s. */
export const C_LIGHT = 3e8;

// ===================================================================
// 1. Displacement current and Maxwell's equations (slides 2–4)
// ===================================================================

/**
 * Maxwell's displacement current, I_d = ε0 dΦ_E/dt (slide 3).
 * `dPhiEdt` is the rate of change of electric flux, in V·m/s.
 */
export function displacementCurrent(dPhiEdt: number): number {
  return EPS0 * dPhiEdt;
}

/**
 * Displacement current between the plates of a capacitor of plate area A
 * whose field changes at dE/dt: Φ_E = E A, so I_d = ε0 A dE/dt.
 */
export function capacitorDisplacementCurrent(A: number, dEdt: number): number {
  return displacementCurrent(A * dEdt);
}

/** c from the two constants, 1/√(μ0ε0) (slide 8). About 2.998×10⁸ m/s. */
export function speedFromConstants(mu0 = MU0, eps0 = EPS0): number {
  return 1 / Math.sqrt(mu0 * eps0);
}

// ===================================================================
// 2. Making the wave: LC oscillator (slide 6)
// ===================================================================

/** Angular frequency of an LC oscillator, ω = 1/√(LC). */
export function lcOmega(L: number, C: number): number {
  return 1 / Math.sqrt(L * C);
}

/** Frequency of the same oscillator, f = ω/2π. */
export function lcFrequency(L: number, C: number): number {
  return lcOmega(L, C) / (2 * Math.PI);
}

// ===================================================================
// 3. Plane waves: E = E_max cos(kx − ωt), E/B = c (slides 8–9, 12)
// ===================================================================

/** Magnetic amplitude from the electric one: B_max = E_max / c. */
export function bFromE(E: number, c = C_LIGHT): number {
  return E / c;
}

/** Electric amplitude from the magnetic one: E_max = c B_max. */
export function eFromB(B: number, c = C_LIGHT): number {
  return B * c;
}

/** Wavelength from the wave number k (the number in front of x): λ = 2π/k. */
export function wavelengthFromK(k: number): number {
  return (2 * Math.PI) / k;
}

/** Frequency from the wavelength: c = fλ, so f = c/λ. */
export function frequencyFromWavelength(lambda: number, c = C_LIGHT): number {
  return c / lambda;
}

/** Frequency straight from k: f = c/λ = ck/2π. */
export function frequencyFromK(k: number, c = C_LIGHT): number {
  return frequencyFromWavelength(wavelengthFromK(k), c);
}

/** Angular frequency ω = 2πf = ck (the number in front of t). */
export function omegaFromK(k: number, c = C_LIGHT): number {
  return c * k;
}

/**
 * Direction of B for a wave with E along `eDir` travelling along `kDir`.
 * E × B points along the travel direction (slide 9, property 3), and for
 * perpendicular unit vectors that gives B̂ = k̂ × Ê.
 * Check with worksheet Q30: Ê = −ẑ, k̂ = +x̂ ⇒ B̂ = x̂ × (−ẑ) = +ŷ.
 */
export function bDirection(eDir: Vec3, kDir: Vec3): Vec3 {
  const b = cross(kDir, eDir);
  // "+ 0" turns a −0 from the products into a plain 0
  return { x: b.x + 0, y: b.y + 0, z: b.z + 0 };
}

// ===================================================================
// 4. Energy: Poynting vector and intensity (slides 13–15, Q29)
// ===================================================================

/** Instantaneous Poynting vector size, S = EB/μ0 (E ⊥ B). */
export function poynting(E: number, B: number): number {
  return (E * B) / MU0;
}

/** The same S written with E only: S = ε0 c E² (uses B = E/c). */
export function poyntingFromE(E: number, c = C_LIGHT): number {
  return EPS0 * c * E * E;
}

/**
 * Intensity (time-averaged S) from the electric amplitude:
 * I = E_max² / (2μ0c). The ½ is the average of cos² over one period.
 */
export function intensityFromEmax(Emax: number, c = C_LIGHT): number {
  return (Emax * Emax) / (2 * MU0 * c);
}

/** Intensity from the magnetic amplitude: I = c B_max² / (2μ0). */
export function intensityFromBmax(Bmax: number, c = C_LIGHT): number {
  return (c * Bmax * Bmax) / (2 * MU0);
}

/** Electric amplitude that carries intensity I: E_max = √(2μ0 c I). */
export function emaxFromIntensity(I: number, c = C_LIGHT): number {
  return Math.sqrt(2 * MU0 * c * I);
}

/** How the source spreads its power: in every direction, or only above the ground. */
export type Spread = 'sphere' | 'hemisphere';

/** Area the wave has spread over at distance r: 4πr² (sphere) or 2πr² (half sphere). */
export function spreadArea(r: number, spread: Spread = 'sphere'): number {
  return (spread === 'sphere' ? 4 : 2) * Math.PI * r * r;
}

/**
 * Intensity at distance r from a source of average power P:
 * I = S_av = (Power)_av / A, with A = 4πr² when it sends "ทุกทิศทาง"
 * (Q29) and A = 2πr² when it sends only "เหนือพื้นโลก" (slide 15).
 */
export function intensityAtDistance(P: number, r: number, spread: Spread = 'sphere'): number {
  return P / spreadArea(r, spread);
}

/** Energy that reaches an area A in time t: U = I A t (Q29 part ข). */
export function energyOnArea(I: number, A: number, t: number): number {
  return I * A * t;
}

// ===================================================================
// 5. Momentum and radiation pressure (slides 16–21)
// ===================================================================

/**
 * Radiation pressure for a surface that reflects a fraction f of the wave
 * (head-on): P = (1 + f) S / c.
 *   f = 0 → perfect absorber, P = S/c (slide 17)
 *   f = 1 → perfect mirror,   P = 2S/c (slide 18)
 * Use the average S (the intensity) to get the average pressure.
 */
export function radiationPressure(S: number, f = 0, c = C_LIGHT): number {
  return ((1 + f) * S) / c;
}

/** Momentum delivered by energy U: p = (1 + f) U cosθ / c, θ measured from the normal, in degrees. */
export function radiationMomentum(U: number, f = 0, thetaDeg = 0, c = C_LIGHT): number {
  return ((1 + f) * U * Math.cos((thetaDeg * Math.PI) / 180)) / c;
}

/** Force on a flat area A facing the wave: F = P A. */
export function radiationForce(S: number, A: number, f = 0, c = C_LIGHT): number {
  return radiationPressure(S, f, c) * A;
}

/** Back from a measured pressure to the intensity: S = P c / (1 + f) (slide 20). */
export function intensityFromPressure(P: number, f = 0, c = C_LIGHT): number {
  return (P * c) / (1 + f);
}

// ===================================================================
// 6. The spectrum (slides 10–11)
// ===================================================================

/** One band of the spectrum, from the slide-10 chart (rough edges; bands overlap). */
export interface Band {
  name: string;
  en: string;
  /** lower frequency edge, Hz */
  fMin: number;
  /** upper frequency edge, Hz */
  fMax: number;
}

/**
 * Bands from low to high frequency, as read off slide 10. The edges are
 * approximate on purpose: the slide notes that neighbouring bands overlap.
 */
export const bands: Band[] = [
  { name: 'คลื่นวิทยุ', en: 'radio', fMin: 1e3, fMax: 3e8 },
  { name: 'ไมโครเวฟ', en: 'microwave', fMin: 3e8, fMax: 3e11 },
  { name: 'อินฟราเรด', en: 'infrared', fMin: 3e11, fMax: 4.3e14 },
  { name: 'แสงที่ตามองเห็น', en: 'visible', fMin: 4.3e14, fMax: 7.5e14 },
  { name: 'อัลตราไวโอเลต', en: 'ultraviolet', fMin: 7.5e14, fMax: 3e16 },
  { name: 'รังสีเอกซ์', en: 'X-ray', fMin: 3e16, fMax: 3e19 },
  { name: 'รังสีแกมมา', en: 'gamma ray', fMin: 3e19, fMax: 1e23 },
];

/** The band a frequency falls in (the lower band wins at an edge). */
export function bandOf(f: number): Band {
  return bands.find((b) => f < b.fMax) ?? bands[bands.length - 1];
}
