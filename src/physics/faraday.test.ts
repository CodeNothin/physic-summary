// Tests for chapter 4 physics. Worksheet Q28 and the lecture examples
// (slides 10–13, 24, 27–30) are the test cases, as for chapters 1–3.
import { describe, expect, it } from 'vitest';
import * as F from './faraday';
import { checkAnswer } from './answers';

/** relative error below 0.5 %, i.e. agrees to 3 significant figures */
const close = (got: number, want: number, tol = 5e-3) =>
  expect(Math.abs(got - want) / Math.abs(want)).toBeLessThan(tol);

describe('worksheet Q28: RL circuit, R = 4.0 Ω, L = 0.20 H, E = 9.0 V', () => {
  it('largest current E/R = 2.25 A (worksheet writes 2.3 A)', () => close(F.rlMaxCurrent(9, 4), 2.25));
  it('current at t = 50 ms is 1.4 A', () => close(F.rlRise(9, 4, 0.2, 0.05), 2.25 * (1 - Math.exp(-1))));
  it('the worksheet’s rounded answers are accepted by the checker', () => {
    expect(checkAnswer(2.3, F.rlMaxCurrent(9, 4)).kind).toBe('correct');
    expect(checkAnswer(1.4, F.rlRise(9, 4, 0.2, 0.05)).kind).toBe('correct');
  });
});

describe('slide 24: ε = 12.0 V, R = 6.00 Ω, L = 30.0 mH', () => {
  it('τ = 5.00 ms', () => close(F.rlTau(30e-3, 6), 5e-3));
  it('I(2.00 ms) = 0.659 A', () => close(F.rlRise(12, 6, 30e-3, 2e-3), 0.6594));
  it('slide 26: ΔV_R + ΔV_L = ε, ΔV_L starts at ε', () => {
    const v = F.rlRiseVoltages(12, 6, 30e-3, 2e-3);
    close(v.VR + v.VL, 12);
    close(F.rlRiseVoltages(12, 6, 30e-3, 0).VL, 12);
  });
});

describe('slides 27–30: protecting a 175 Ω device', () => {
  const R = 175;
  const I = 0.036;
  it('(a) emf = IR = 6.3 V', () => close(I * R, 6.3));
  it('(c) τ ≈ 0.40 ms and (b) L = τR ≈ 69 mH', () => {
    const tau = F.rlTauForLimit(I, 4.9e-3, 58e-6);
    close(tau, 3.964e-4, 2e-3);
    close(tau * R, 0.0694, 3e-3);
    close(F.rlRise(I * R, R, tau * R, 58e-6), 4.9e-3); // round trip
  });
});

describe('RL formulas solve the circuit equations', () => {
  const emf = 9;
  const R = 4;
  const L = 0.2;
  const h = 1e-6;
  it('case 1: ε − L dI/dt = IR at several times', () => {
    for (const t of [0.001, 0.02, 0.05, 0.2]) {
      const dIdt = (F.rlRise(emf, R, L, t + h) - F.rlRise(emf, R, L, t - h)) / (2 * h);
      close(emf - L * dIdt, F.rlRise(emf, R, L, t) * R, 1e-4);
      close(dIdt, F.rlRiseSlope(emf, R, L, t), 1e-4);
    }
  });
  it('case 2: −L dI/dt = IR', () => {
    for (const t of [0.001, 0.02, 0.05]) {
      const dIdt = (F.rlDecay(emf, R, L, t + h) - F.rlDecay(emf, R, L, t - h)) / (2 * h);
      close(-L * dIdt, F.rlDecay(emf, R, L, t) * R, 1e-4);
    }
  });
  it('I(τ) ≈ 0.63 ε/R rising and 0.37 ε/R falling (slides 19, 22)', () => {
    const tau = F.rlTau(L, R);
    close(F.rlRise(emf, R, L, tau) / (emf / R), 0.632, 2e-3);
    close(F.rlDecay(emf, R, L, tau) / (emf / R), 0.368, 2e-3);
  });
  it('time to reach a fraction inverts rlRise', () => {
    const tau = F.rlTau(L, R);
    const t = F.rlTimeToFraction(tau, 0.9);
    close(F.rlRise(emf, R, L, t), 0.9 * (emf / R));
  });
});

describe("Lenz's law, slides 10–11 (seen from above)", () => {
  it('(a) increasing downward flux → induced B up → counter-clockwise', () => {
    expect(F.lenzTurn(-1, true)).toBe('ccw');
    expect(F.lenzInducedField(-1, true)).toBe(1);
  });
  it('(b) decreasing upward flux → counter-clockwise', () => expect(F.lenzTurn(1, false)).toBe('ccw'));
  it('(c) decreasing downward flux → clockwise', () => expect(F.lenzTurn(-1, false)).toBe('cw'));
  it('(d) increasing upward flux → clockwise', () => expect(F.lenzTurn(1, true)).toBe('cw'));
  it('slide 9: B up and increasing → induced B down', () => expect(F.lenzInducedField(1, true)).toBe(-1));
});

describe('flux and motional emf', () => {
  it('Φ = BA cosθ', () => {
    close(F.fluxUniform(0.5, 0.02, 0), 0.01);
    close(F.fluxUniform(0.5, 0.02, 60), 0.005);
  });
  it('slide 8: ε = −dΦ/dt with Φ = Bℓx gives |ε| = Bℓv', () => {
    const B = 0.4;
    const l = 0.5;
    const v = 3;
    const dt = 0.01;
    const dPhi = B * l * v * dt;
    close(F.faradayEmf(dPhi, dt), -F.motionalEmf(B, l, v));
  });
  it('rail: F_B v = I²R (pushing power becomes heat)', () => {
    close(F.railForce(0.4, 0.5, 3, 2) * 3, F.railPower(0.4, 0.5, 3, 2));
  });
});

describe('slide 13: loop through a field region 3w wide', () => {
  const B = 0.5;
  const l = 0.2;
  const w = 0.1;
  const regionW = 3 * w;
  const v = 2;
  it('flux: 0 → rises → Bℓw flat → falls → 0', () => {
    expect(F.loopRegionFlux(B, l, w, regionW, -0.05)).toBe(0);
    close(F.loopRegionFlux(B, l, w, regionW, 0.05), B * l * 0.05);
    close(F.loopRegionFlux(B, l, w, regionW, 0.2), B * l * w);
    close(F.loopRegionFlux(B, l, w, regionW, 0.35), B * l * 0.05);
    expect(F.loopRegionFlux(B, l, w, regionW, 0.45)).toBe(0);
  });
  it('emf: −Bℓv entering, 0 inside, +Bℓv leaving, and equals −dΦ/dt', () => {
    close(F.loopRegionEmf(B, l, w, regionW, 0.05, v), -B * l * v);
    expect(F.loopRegionEmf(B, l, w, regionW, 0.2, v)).toBe(0);
    close(F.loopRegionEmf(B, l, w, regionW, 0.35, v), B * l * v);
    const h = 1e-6;
    for (const x of [0.03, 0.15, 0.27, 0.33]) {
      const dPhidt = ((F.loopRegionFlux(B, l, w, regionW, x + h) - F.loopRegionFlux(B, l, w, regionW, x - h)) / (2 * h)) * v;
      expect(F.loopRegionEmf(B, l, w, regionW, x, v)).toBeCloseTo(-dPhidt, 6);
    }
  });
});
