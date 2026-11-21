// Tests for chapter 5 physics. Worksheet Q29–30 and the lecture examples
// (slides 12, 15, 20, 21) are the test cases, as for chapters 1–4.
import { describe, expect, it } from 'vitest';
import * as W from './emwave';
import { checkAnswer } from './answers';
import { vec3 } from './magnetism';

/** relative error below 0.5 %, i.e. agrees to 3 significant figures */
const close = (got: number, want: number, tol = 5e-3) =>
  expect(Math.abs(got - want) / Math.abs(want)).toBeLessThan(tol);

describe('worksheet Q29: 50 kW source sending in every direction', () => {
  const I = W.intensityAtDistance(50e3, 200);
  it('(ก) intensity at 200 m is 0.0995 W/m² (worksheet writes 0.10)', () => close(I, 0.0995));
  it('(ข) energy on 4.0 m² in 1 minute is 23.9 J (worksheet writes 24)', () => close(W.energyOnArea(I, 4, 60), 23.87));
  it('the worksheet’s rounded answers are accepted by the checker', () => {
    expect(checkAnswer(0.1, I).kind).toBe('correct');
    expect(checkAnswer(24, W.energyOnArea(I, 4, 60)).kind).toBe('correct');
  });
});

describe('worksheet Q30: E = −2.0×10⁶ sin(1.2×10⁷x − ωt) ẑ', () => {
  it('(ก) B_max = 6.7×10⁻³ T', () => close(W.bFromE(2e6), 6.667e-3));
  it('(ก) B points along +ŷ', () => expect(W.bDirection(vec3(0, 0, -1), vec3(1, 0, 0))).toEqual({ x: 0, y: 1, z: 0 }));
  it('(ข) λ = 523.6 nm and f = 5.7×10¹⁴ Hz', () => {
    close(W.wavelengthFromK(1.2e7), 523.6e-9);
    close(W.frequencyFromK(1.2e7), 5.73e14);
    expect(checkAnswer(5.7e14, W.frequencyFromK(1.2e7)).kind).toBe('correct');
  });
  it('E × B points along the travel direction for every pair of axes', () => {
    const axes = [vec3(1, 0, 0), vec3(0, 1, 0), vec3(0, 0, 1)];
    for (const k of axes)
      for (const e of axes) {
        if (k === e) continue;
        for (const s of [1, -1]) {
          const E = vec3(e.x * s, e.y * s, e.z * s);
          const B = W.bDirection(E, k);
          // E × B, computed by hand
          const ExB = { x: E.y * B.z - E.z * B.y, y: E.z * B.x - E.x * B.z, z: E.x * B.y - E.y * B.x };
          expect({ x: ExB.x + 0, y: ExB.y + 0, z: ExB.z + 0 }).toEqual({ x: k.x, y: k.y, z: k.z });
        }
      }
  });
});

describe('slide 12: E_y = 100 sin(1×10⁷x − ωt)', () => {
  it('B_max = 3.33×10⁻⁷ T', () => close(W.bFromE(100), 3.333e-7));
  it('λ = 628 nm', () => close(W.wavelengthFromK(1e7), 6.283e-7));
  it('f = 4.77×10¹⁴ Hz', () => close(W.frequencyFromK(1e7), 4.775e14));
  it('ω = ck = 3×10¹⁵ rad/s', () => close(W.omegaFromK(1e7), 3e15));
});

describe('slide 15: 50 kW radio station sending only above the ground', () => {
  it('half sphere: I = 50×10³ / (2π × (100 km)²) = 7.96×10⁻⁷ W/m²', () =>
    close(W.intensityAtDistance(50e3, 100e3, 'hemisphere'), 7.958e-7));
  it('a half sphere doubles the intensity of a full sphere', () =>
    close(W.intensityAtDistance(1, 3, 'hemisphere') / W.intensityAtDistance(1, 3, 'sphere'), 2));
});

describe('slide 20: absorber at 5 m feels 9×10⁻⁶ Pa', () => {
  it('S = Pc = 2700 W/m²', () => close(W.intensityFromPressure(9e-6), 2700));
  it('power = S × 4πr² = 8.48×10⁵ W', () => close(W.intensityFromPressure(9e-6) * W.spreadArea(5), 8.482e5));
});

describe('slide 21: sunlight 1370 W/m² fully absorbed by the Earth', () => {
  it('force = (S/c) πR² = 5.8×10⁸ N with R = 6.37×10⁶ m', () =>
    close(W.radiationForce(1370, Math.PI * 6.37e6 ** 2), 5.823e8));
});

describe('pressure and momentum formulas on the sheet', () => {
  it('absorb S/c, reflect 2S/c, partial (1+f)S/c', () => {
    close(W.radiationPressure(300), 1e-6);
    close(W.radiationPressure(300, 1), 2e-6);
    close(W.radiationPressure(300, 0.5), 1.5e-6);
  });
  it('slide 19: oblique mirror p = 2U cosθ/c', () => close(W.radiationMomentum(3e8, 1, 60), 1));
});

describe('the three ways of writing S and I agree (slide 14)', () => {
  const E = 500;
  const B = W.bFromE(E);
  it('EB/μ0 = ε0cE² = cB²/μ0 (within the small gap between 3×10⁸ and 1/√μ0ε0)', () => {
    close(W.poynting(E, B), W.poyntingFromE(E), 2e-3);
    close(W.poynting(E, B), W.intensityFromBmax(B) * 2);
  });
  it('I = E²/2μ0c = cB²/2μ0, and E_max from I goes back', () => {
    close(W.intensityFromEmax(E), W.intensityFromBmax(B));
    close(W.emaxFromIntensity(W.intensityFromEmax(E)), E);
  });
  it('1/√(μ0ε0) ≈ 3.00×10⁸ m/s', () => close(W.speedFromConstants(), 2.998e8));
});

describe('displacement current, LC oscillator, spectrum', () => {
  it('I_d = ε0 A dE/dt', () => close(W.capacitorDisplacementCurrent(0.01, 1e12), 8.85e-2));
  it('ω = 1/√(LC)', () => close(W.lcOmega(1e-3, 1e-9), 1e6));
  it('visible light near 5×10¹⁴ Hz, FM radio near 10⁸ Hz', () => {
    expect(W.bandOf(5e14).en).toBe('visible');
    expect(W.bandOf(1e8).en).toBe('radio');
    expect(W.bandOf(2.45e9).en).toBe('microwave');
  });
});
