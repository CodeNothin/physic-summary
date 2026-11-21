// =====================================================================
// Chapter 4 physics: Faraday's law, Lenz's law, motional emf,
// self-inductance and RL circuits (slides 3–30, worksheet Q28).
//
// Pure functions only (no React, no drawing). Widgets, practice
// questions and worksheet questions all call these.
// Every quantity is SI: T, m, m², s, V, A, Ω (ohm), H (henry), Wb.
//
// Sign convention used in this file:
//   Flux Φ_B is positive when B points along the loop's chosen normal.
//   In the slide pictures that normal is INTO the page (B_in), so
//   flux into the page counts as positive, and ε = −dΦ_B/dt follows.
// =====================================================================

// ===================================================================
// 1. Magnetic flux and Faraday's law (slide 3)
// ===================================================================

/**
 * Flux through a flat loop of area A in a uniform field B:
 * Φ_B = ∫B·dA = B A cosθ, where θ is the angle between B and the
 * loop's AREA VECTOR (the normal), in degrees.
 * If a question gives the angle to the PLANE of the loop, use 90° − that angle.
 */
export function fluxUniform(B: number, A: number, thetaDeg: number): number {
  return B * A * Math.cos((thetaDeg * Math.PI) / 180);
}

/** Faraday's law with a steady rate of change: ε = −dΦ_B/dt ≈ −ΔΦ/Δt. */
export function faradayEmf(dPhi: number, dt: number): number {
  return -dPhi / dt;
}

// ===================================================================
// 2. Lenz's law (slides 5–12)
// ===================================================================

/** Which way the induced current goes, as seen from ABOVE the loop. */
export type Turn = 'cw' | 'ccw';

/**
 * Lenz's law for a horizontal loop with a vertical field through it.
 * `fluxUp` = +1 if the field through the loop points up, −1 if down.
 * `increasing` = whether the size of that flux is growing.
 * The induced field points against the CHANGE; an upward induced field
 * needs a counter-clockwise current seen from above (right-hand grip).
 */
export function lenzTurn(fluxUp: 1 | -1, increasing: boolean): Turn {
  const change = fluxUp * (increasing ? 1 : -1); // +1 = flux change points up
  const inducedUp = -change;
  return inducedUp > 0 ? 'ccw' : 'cw';
}

/** Direction of the induced field for the same situation: +1 up, −1 down. */
export function lenzInducedField(fluxUp: 1 | -1, increasing: boolean): 1 | -1 {
  return lenzTurn(fluxUp, increasing) === 'ccw' ? 1 : -1;
}

// ===================================================================
// 3. Motional emf (slides 7–8)
// ===================================================================

/** Rod of length ℓ moving at v across a field B (all perpendicular): |ε| = B ℓ v. */
export function motionalEmf(B: number, l: number, v: number): number {
  return B * l * v;
}

/** Rod on rails closed by a resistor R: I = |ε| / R = B ℓ v / R. */
export function railCurrent(B: number, l: number, v: number, R: number): number {
  return motionalEmf(B, l, v) / R;
}

/**
 * Magnetic force on the rod, F_B = I ℓ B = B² ℓ² v / R. It points against
 * the motion (Lenz), so pushing at constant speed needs F_app of this size.
 */
export function railForce(B: number, l: number, v: number, R: number): number {
  return railCurrent(B, l, v, R) * l * B;
}

/** Power turned into heat in R: P = I² R = (B ℓ v)² / R (= F_app · v). */
export function railPower(B: number, l: number, v: number, R: number): number {
  const I = railCurrent(B, l, v, R);
  return I * I * R;
}

// ===================================================================
// 4. Loop passing through a field region (slide 13 example)
// ===================================================================

/**
 * A rectangular loop (width w along x, height ℓ) slides along x through a
 * region of uniform field B (into the page) from x = 0 to x = regionW
 * (slide 13: regionW = 3w). `x` is the position of the loop's RIGHT edge.
 * Returns the flux, positive = into the page.
 */
export function loopRegionFlux(B: number, l: number, w: number, regionW: number, x: number): number {
  const left = x - w;
  const overlap = Math.max(0, Math.min(x, regionW) - Math.max(left, 0));
  return B * l * overlap;
}

/**
 * The emf for the same loop moving right at speed v: ε = −dΦ/dt = −(dΦ/dx) v.
 * Entering: −Bℓv. Fully inside: 0. Leaving: +Bℓv. Outside: 0.
 * At the exact corners (where dΦ/dx jumps) the value on the right side is used.
 */
export function loopRegionEmf(B: number, l: number, w: number, regionW: number, x: number, v: number): number {
  const left = x - w;
  // dΦ/dx = Bℓ × (rate the overlap grows): +1 while the right edge is inside,
  // −1 while the left edge is inside (both can be inside only if w < regionW).
  const rightInside = x >= 0 && x < regionW ? 1 : 0;
  const leftInside = left >= 0 && left < regionW ? 1 : 0;
  const dPhidx = B * l * (rightInside - leftInside);
  return dPhidx === 0 ? 0 : -dPhidx * v; // avoid printing "−0"
}

// ===================================================================
// 5. Self-inductance (slide 17)
// ===================================================================

/** Self-induced emf: ε_L = −L dI/dt (it opposes the change in current). */
export function selfInducedEmf(L: number, dIdt: number): number {
  return -L * dIdt;
}

// ===================================================================
// 6. RL circuits (slides 18–30, worksheet Q28)
// ===================================================================

/** Time constant of an RL circuit: τ = L / R. */
export function rlTau(L: number, R: number): number {
  return L / R;
}

/** Steady (largest) current: once the current stops changing, ε_L = 0 and I = ε / R. */
export function rlMaxCurrent(emf: number, R: number): number {
  return emf / R;
}

/** Case 1 (switch closed at t = 0, current starts at 0): I(t) = (ε/R)(1 − e^(−t/τ)). */
export function rlRise(emf: number, R: number, L: number, t: number): number {
  return (emf / R) * (1 - Math.exp(-t / rlTau(L, R)));
}

/** Case 2 (battery taken out at t = 0, current starts at ε/R): I(t) = (ε/R) e^(−t/τ). */
export function rlDecay(emf: number, R: number, L: number, t: number): number {
  return (emf / R) * Math.exp(-t / rlTau(L, R));
}

/**
 * Voltages while the current rises (slide 26):
 * ΔV_R = I R, and ΔV_L = ε − ΔV_R = ε e^(−t/τ).
 */
export function rlRiseVoltages(emf: number, R: number, L: number, t: number): { VR: number; VL: number } {
  const VR = rlRise(emf, R, L, t) * R;
  return { VR, VL: emf - VR };
}

/** Rate of change of the rising current, dI/dt = (ε/L) e^(−t/τ). */
export function rlRiseSlope(emf: number, R: number, L: number, t: number): number {
  return (emf / L) * Math.exp(-t / rlTau(L, R));
}

/**
 * Time for the rising current to reach a fraction f of its final value
 * (0 < f < 1): f = 1 − e^(−t/τ)  ⇒  t = −τ ln(1 − f).
 */
export function rlTimeToFraction(tau: number, f: number): number {
  return -tau * Math.log(1 - f);
}

/**
 * Slides 27–30: the current must rise to no more than `Ilimit` within time t,
 * with final current Ifinal. Solves Ilimit = Ifinal(1 − e^(−t/τ)) for τ.
 */
export function rlTauForLimit(Ifinal: number, Ilimit: number, t: number): number {
  return -t / Math.log(1 - Ilimit / Ifinal);
}
