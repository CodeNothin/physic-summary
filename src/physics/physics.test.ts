// =====================================================================
// Tests for chapters 1–2 physics. The worksheet answers to Q21–25 are the
// test cases, so if a formula in physics/index.ts is changed by mistake,
// `npm test` fails and says which worksheet answer no longer matches.
// =====================================================================
import { describe, expect, it } from 'vitest';
import * as P from './index';
import { checkAnswer, parseAnswer, parseNumber } from './answers';

const uC = 1e-6;
/** matches to 3 significant figures, like the worksheet answers */
const sig3 = (got: number, want: number) =>
  expect(Math.abs(got - want) / Math.abs(want)).toBeLessThan(5e-3);

describe('worksheet Q21: hollow conductor', () => {
  const q = 5.0 * uC;
  const Q = -20.0 * uC;
  it('inner wall −5.0 μC, outer wall −15.0 μC', () => {
    const s = P.shellSurfaceCharges(q, Q);
    expect(s.inner / uC).toBeCloseTo(-5.0, 10);
    expect(s.outer / uC).toBeCloseTo(-15.0, 10);
  });
  it('E = 0 inside the metal at r = 0.120 m', () => {
    expect(P.shellRegion(0.1, 0.14, 0.12)).toBe('metal');
    expect(P.shellField(q, Q, 0.1, 0.14, 0.12)).toBe(0);
  });
  it('outside sees q + Q', () => {
    expect(P.shellField(q, Q, 0.1, 0.14, 0.3)).toBeCloseTo((P.K * (q + Q)) / 0.09, 6);
  });
});

describe('worksheet Q22: two sheets +σ and −2σ', () => {
  const sigma = 1e-6;
  const r = P.twoSheets(sigma, -2 * sigma);
  const unit = sigma / P.EPS0;
  it('between the sheets E = 3σ/2ε0, pointing right', () => {
    expect(r.middle.net / unit).toBeCloseTo(1.5, 12);
  });
  it('outside E = σ/2ε0 toward the negative sheet', () => {
    expect(r.left.net / unit).toBeCloseTo(0.5, 12);
    expect(r.right.net / unit).toBeCloseTo(-0.5, 12);
  });
  it('single sheet σ/2ε0', () => {
    expect(P.sheetField(-2 * sigma) / unit).toBeCloseTo(1, 12);
  });
});

describe('worksheet Q23: uniform field', () => {
  const E = { x: 3.0, y: -4.0 };
  const A = { x: 2.0, y: 2.0 };
  const B = { x: 3.0, y: 5.0 };
  const dV = P.deltaVUniform(E, A, B); // V_B − V_A
  it('V_A − V_B = −9.0 V', () => {
    expect(-dV).toBeCloseTo(-9.0, 12);
  });
  it('W_ext = 2.7e-5 J for +3.0 μC', () => {
    expect(P.externalWork(3.0 * uC, dV)).toBeCloseTo(2.7e-5, 12);
    expect(P.fieldWork(3.0 * uC, dV)).toBeCloseTo(-2.7e-5, 12);
  });
});

describe('worksheet Q24: conducting sphere, symbols', () => {
  const R = 0.37;
  const V0 = 1234;
  const Q = P.chargeFromSpherePotential(V0, R);
  it('Q = 4πε0·R·V0 (k and ε0 of the worksheet agree to 0.1%)', () => {
    expect(Q / (4 * Math.PI * P.EPS0 * R * V0)).toBeCloseTo(1, 2);
  });
  it('V(R/3) = V(R) = V0 and V(6R) = V0/6', () => {
    expect(P.spherePotential('conductor', Q, R, R / 3)).toBeCloseTo(V0, 9);
    expect(P.spherePotential('conductor', Q, R, R)).toBeCloseTo(V0, 9);
    expect(P.spherePotential('conductor', Q, R, 6 * R)! / V0).toBeCloseTo(1 / 6, 12);
  });
});

describe('worksheet Q25: conducting sphere, numbers', () => {
  const Q = 4.0 * uC;
  const R = 0.1;
  it('E(14 cm) = 1.84e6 N/C', () => sig3(P.sphereField('conductor', Q, R, 0.14), 1.84e6));
  it('V(14 cm) = 2.57e5 V', () => sig3(P.spherePotential('conductor', Q, R, 0.14)!, 2.57e5));
  it('E(5 cm) = 0', () => expect(P.sphereField('conductor', Q, R, 0.05)).toBe(0));
  it('V(5 cm) = 3.6e5 V', () => sig3(P.spherePotential('conductor', Q, R, 0.05)!, 3.6e5));
});

describe('flux and Gauss', () => {
  it('Φ = EA cosθ', () => {
    expect(P.fluxUniform(500, 0.06, 60)).toBeCloseTo(15, 9);
    expect(P.fluxUniform(500, 0.06, 90)).toBeCloseTo(0, 9);
  });
  it('only enclosed charges count', () => {
    const charges = [
      { q: 2e-9, x: 0, y: 0 },
      { q: -5e-9, x: 3, y: 0 },
    ];
    const inside = (p: P.Vec2) => Math.hypot(p.x, p.y) < 1;
    expect(P.enclosedCharge(charges, inside)).toBe(2e-9);
    expect(P.netFlux(2e-9)).toBeCloseTo(2e-9 / 8.85e-12, 6);
  });
});

describe('insulating sphere', () => {
  const Q = 8 * uC;
  const R = 0.1;
  it('inside: q_in = Q r³/R³ and E = kQr/R³', () => {
    expect(P.sphereEnclosedCharge('insulator', Q, R, 0.05)).toBeCloseTo(Q / 8, 15);
    expect(P.sphereField('insulator', Q, R, 0.05)).toBeCloseTo((9e9 * Q * 0.05) / 1e-3, 3);
  });
  it('outside looks like a point charge; field is continuous at R', () => {
    expect(P.sphereField('insulator', Q, R, 0.2)).toBeCloseTo(P.pointFieldMagnitude(Q, 0.2), 3);
    expect(P.sphereField('insulator', Q, R, R * (1 - 1e-9))).toBeCloseTo(
      P.sphereField('insulator', Q, R, R),
      -1,
    );
  });
  it('no potential formula inside an insulator in this course', () => {
    expect(P.spherePotential('insulator', Q, R, 0.05)).toBeNull();
    expect(P.spherePotential('insulator', Q, R, 0.2)).toBeCloseTo((9e9 * Q) / 0.2, 6);
  });
});

describe('lecture example: ball (+Q) inside shell (−2Q)', () => {
  const Q = 1e-6;
  const [a, b, c] = [0.1, 0.2, 0.3];
  it('enclosed charge per region', () => {
    expect(P.ballInShellEnclosed(Q, a, -2 * Q, b, c, 0.05)).toBeCloseTo(Q / 8, 15);
    expect(P.ballInShellEnclosed(Q, a, -2 * Q, b, c, 0.15)).toBe(Q);
    expect(P.ballInShellEnclosed(Q, a, -2 * Q, b, c, 0.25)).toBe(0);
    expect(P.ballInShellEnclosed(Q, a, -2 * Q, b, c, 0.4)).toBeCloseTo(-Q, 15);
  });
  it('region 4 field points inward with size kQ/r²', () => {
    expect(P.ballInShellField(Q, a, -2 * Q, b, c, 0.4)).toBeCloseTo(-(9e9 * Q) / 0.16, 6);
  });
  it('walls: inner −Q, outer −Q', () => {
    const s = P.shellSurfaceCharges(Q, -2 * Q);
    expect(s.inner).toBeCloseTo(-Q, 15);
    expect(s.outer).toBeCloseTo(-Q, 15);
  });
});

describe('point charges', () => {
  it('potential adds as numbers, field as vectors', () => {
    const cs = [
      { q: 1e-9, x: -1, y: 0 },
      { q: 1e-9, x: 1, y: 0 },
    ];
    expect(P.potentialAt(cs, { x: 0, y: 0 })).toBeCloseTo(18, 9);
    const e = P.fieldAt(cs, { x: 0, y: 0 });
    expect(Math.hypot(e.x, e.y)).toBeCloseTo(0, 9);
  });
  it('system energy has one term per pair', () => {
    const cs = [
      { q: 2e-6, x: 0, y: 0 },
      { q: -3e-6, x: 3, y: 0 },
      { q: 4e-6, x: 0, y: 4 },
    ];
    const want = 9e9 * ((2e-6 * -3e-6) / 3 + (2e-6 * 4e-6) / 4 + (-3e-6 * 4e-6) / 5);
    expect(P.systemEnergy(cs)).toBeCloseTo(want, 12);
    expect(P.pairCount(4)).toBe(6);
  });
});

describe('E from V', () => {
  it('ring: −dV/dx equals the direct field formula', () => {
    const [Q, a, x] = [5e-9, 0.3, 0.4];
    expect(P.ringPotential(Q, a, x)).toBeCloseTo(90, 9);
    expect(P.fieldFromPotential1D((s) => P.ringPotential(Q, a, s), x)).toBeCloseTo(
      P.ringField(Q, a, x),
      4,
    );
    expect(P.ringField(Q, a, 0)).toBe(0);
  });
  it('disk: −dV/dx equals the field and tends to σ/2ε0 for a huge disk', () => {
    const sigma = 1e-9;
    expect(P.fieldFromPotential1D((s) => P.diskPotential(sigma, 0.5, s), 0.2)).toBeCloseTo(
      P.diskField(sigma, 0.5, 0.2),
      4,
    );
    // 2πk and 1/2ε0 differ by 0.1% with the worksheet constants
    expect(P.diskField(sigma, 1e6, 0.1) / P.sheetField(sigma)).toBeCloseTo(1, 2);
  });
  it('partial derivatives', () => {
    const V = (x: number, y: number) => 3 * x * x * y - 2 * y;
    const e = P.fieldFromPotential2D(V, { x: 1, y: 2 });
    expect(e.x).toBeCloseTo(-12, 5);
    expect(e.y).toBeCloseTo(-1, 5);
  });
});

describe('two spheres on a wire', () => {
  const r = P.twoSpheres(8e-9, 0.06, 0.02);
  it('charge splits like the radii', () => {
    expect(r.q1).toBeCloseTo(6e-9, 15);
    expect(r.q2).toBeCloseTo(2e-9, 15);
  });
  it('same potential, field ratio r2/r1', () => {
    expect(r.V).toBeCloseTo(900, 6);
    expect((P.K * r.q2) / 0.02).toBeCloseTo(r.V, 6);
    expect(r.E1 / r.E2).toBeCloseTo(0.02 / 0.06, 12);
  });
});

describe('answer parsing', () => {
  it('numbers', () => {
    expect(parseNumber('1.84e6')).toBe(1.84e6);
    expect(parseNumber('2.7×10^-5')).toBeCloseTo(2.7e-5, 15);
    expect(parseNumber('2.7x10^-5')).toBeCloseTo(2.7e-5, 15);
    expect(parseNumber('2.7×10⁻⁵')).toBeCloseTo(2.7e-5, 15);
    expect(parseNumber('−9')).toBe(-9);
    expect(parseNumber('1/6')).toBeCloseTo(1 / 6, 15);
    expect(parseNumber('abc')).toBeNaN();
  });
  it('numbers with units', () => {
    expect(parseAnswer('-5 μC')!.base).toBe('C');
    expect(parseAnswer('-5 μC')!.value).toBeCloseTo(-5e-6, 15);
    expect(parseAnswer('-15uC')!.value).toBeCloseTo(-15e-6, 15);
    expect(parseAnswer('2.7e-5 J')).toEqual({ value: 2.7e-5, base: 'J' });
    expect(parseAnswer('1.84e6 N/C')).toEqual({ value: 1.84e6, base: 'N/C' });
    expect(parseAnswer('360 kV')!.value).toBeCloseTo(3.6e5, 6);
    expect(parseAnswer('14 cm')!.value).toBeCloseTo(0.14, 12);
    expect(parseAnswer('15 Nm2/C')).toEqual({ value: 15, base: 'N·m²/C' });
    expect(parseAnswer('5 bananas')).toBeNull();
  });
});

describe('answer checking', () => {
  it('accepts within 2%', () => {
    expect(checkAnswer(1.84e6, 1.8367e6).kind).toBe('correct');
    expect(checkAnswer(1.9e6, 1.8367e6).kind).toBe('wrong');
    expect(checkAnswer(0, 0).kind).toBe('correct');
  });
  it('spots a sign error', () => {
    expect(checkAnswer(9, -9).kind).toBe('sign');
  });
  it('spots a power of ten', () => {
    expect(checkAnswer(1.84e4, 1.8367e6)).toEqual({ kind: 'power10', exponent: -2 });
    expect(checkAnswer(-2.7e-2, 2.7e-5).kind).toBe('wrong');
  });
  it('spots 1/r used where 1/r² was needed', () => {
    const E = P.sphereField('conductor', 4e-6, 0.1, 0.14);
    const wrong = (P.K * 4e-6) / 0.14;
    expect(checkAnswer(2.57e5, E, [{ id: 'inverse-r', value: wrong }])).toEqual({
      kind: 'mistake',
      id: 'inverse-r',
    });
  });
});
