// Tests for chapter 6 physics. Worksheet Q31–33 and the lecture examples
// (slides 9, 14, 15, 25, 26, 34, 38–39, 43) are the test cases.
import { describe, expect, it } from 'vitest';
import * as Li from './light';
import { checkAnswer } from './answers';

/** relative error below 0.5 %, i.e. agrees to 3 significant figures */
const close = (got: number, want: number, tol = 5e-3) =>
  expect(Math.abs(got - want) / Math.abs(want)).toBeLessThan(tol);

describe('worksheet Q31: double slit in symbols', () => {
  // any numbers will do: the answers are formulas
  const lam = 500e-9;
  const L = 2;
  const d = 4e-4;
  const dL = 0.5;
  it('(ก) first dark fringe x = λL/2d', () => close(Li.darkY(0, lam, L, d), (lam * L) / (2 * d)));
  it('(ข) moving the screen by ΔL adds λΔL/2d', () =>
    close(Li.darkY(0, lam, L + dL, d) - Li.darkY(0, lam, L, d), (lam * dL) / (2 * d)));
  it('(ค) keeping x needs λ₂/λ₁ = L/(L + ΔL)', () => {
    const lam2 = (lam * L) / (L + dL);
    close(Li.darkY(0, lam2, L + dL, d), Li.darkY(0, lam, L, d));
  });
});

describe('worksheet Q32: 600 nm, d = 6.40×10⁻⁴ m, 2nd bright at 3.60 mm', () => {
  const L = Li.screenDistanceFromBright(3.6e-3, 2, 600e-9, 6.4e-4);
  it('L = 1.92 m', () => close(L, 1.92));
  it('I = 0.883 I_max at 3.40 mm', () => close(Li.doubleSlitRatio(3.4e-3, 600e-9, L, 6.4e-4), 0.883, 2e-3));
  it('phase φ = 2πdy/λL ≈ 11.87 rad, so φ/2 = 5.93 rad = 340°', () =>
    close((Math.PI * 6.4e-4 * 3.4e-3) / (600e-9 * L), 5.934));
  it('λ and d cancel: I/I_max = cos²(π m y / y_m)', () =>
    close(Li.doubleSlitRatio(3.4e-3, 600e-9, L, 6.4e-4), Math.cos((Math.PI * 2 * 3.4) / 3.6) ** 2));
  it('the checker accepts 0.883 and 0.88', () => {
    expect(checkAnswer(0.883, Li.doubleSlitRatio(3.4e-3, 600e-9, L, 6.4e-4)).kind).toBe('correct');
    expect(checkAnswer(0.88, Li.doubleSlitRatio(3.4e-3, 600e-9, L, 6.4e-4)).kind).toBe('correct');
  });
});

describe('worksheet Q33: plate of thickness d, incidence 60°', () => {
  const d = 2e-3;
  const x = 1.2e-3;
  it('t = (√3/2)(d² + x²)/(cx)', () => close(Li.plateTime(d, x, 60), ((Math.sqrt(3) / 2) * (d * d + x * x)) / (3e8 * x)));
  it('agrees with t = L/v, v = c/n', () => {
    const n = Li.plateIndex(d, x, 60);
    close(Li.plateTime(d, x, 60), Math.hypot(d, x) / Li.speedFromIndex(n));
  });
  it('Snell holds inside: sin60° = n sinθ with sinθ = x/L', () =>
    close(Li.snellDeg(1, 60, Li.plateIndex(d, x, 60))!, (Math.atan(x / d) * 180) / Math.PI));
});

describe('refraction and the slides', () => {
  it('slide 4: Snell air → glass bends towards the normal', () => expect(Li.snellDeg(1, 40, 1.52)!).toBeLessThan(40));
  it('slide 7: critical angle glass → air = 41.1°', () => close(Li.criticalAngleDeg(1.52, 1)!, 41.14));
  it('no critical angle from air into glass', () => expect(Li.criticalAngleDeg(1, 1.52)).toBeNull());
  it('beyond the critical angle there is no refracted ray', () => expect(Li.snellDeg(1.52, 50, 1)).toBeNull());
  it('slide 8: λₙ = λ/n, v = c/n', () => {
    close(Li.wavelengthInMedium(589e-9, 1.333), 441.9e-9);
    close(Li.speedFromIndex(1.5), 2e8);
  });
  it('slide 2: v = c/√(Ke Km)', () => close(Li.speedInMatter(4), 1.5e8));
  it('slide 9: tank 3 m wide, sun 28° up, n = 1.333 → h = 3.39 m', () => close(Li.tankMinDepth(3, 28, 1.333), 3.394));
});

describe('interference examples', () => {
  it('slide 13: neighbouring bright fringes are λL/d apart', () =>
    close(Li.brightY(3, 6e-7, 2, 1e-3) - Li.brightY(2, 6e-7, 2, 1e-3), Li.fringeSpacing(6e-7, 2, 1e-3)));
  it('slide 14: 1st dark of λ′ on the 1st bright of 600 nm ⇒ λ′ = 1200 nm', () => {
    const d = (600e-9 * 3) / 4.84e-3; // from the 4.84 mm
    const lam2 = (Li.brightY(1, 600e-9, 3, d) * d) / (0.5 * 3);
    close(lam2, 1200e-9);
  });
  it('slide 15: I = ¾ I_max first at y = λL/6d = 5.0×10⁻⁵ m', () => close(Li.yAtIntensity(0.75, 600e-9, 1, 2e-3), 5e-5));
  it('bright fringes have I = I_max, dark ones 0', () => {
    close(Li.doubleSlitRatio(Li.brightY(2, 5e-7, 1, 1e-3), 5e-7, 1, 1e-3), 1);
    expect(Li.doubleSlitRatio(Li.darkY(1, 5e-7, 1, 1e-3), 5e-7, 1, 1e-3)).toBeLessThan(1e-12);
  });
});

describe('diffraction examples', () => {
  it('slide 25: neighbouring darks 4.0 mm apart, 600 nm, 2.0 m ⇒ a = 0.30 mm', () => close((600e-9 * 2) / 4e-3, 3e-4));
  it('slide 26: 580 nm, a = 0.3 mm, D = 2 m ⇒ 1st dark 3.87 mm, central band 7.73 mm', () => {
    close(Li.singleSlitDarkY(1, 580e-9, 2, 3e-4), 3.867e-3);
    close(Li.centralWidth(580e-9, 2, 3e-4), 7.733e-3);
  });
  it('single-slit intensity is 1 at the centre and 0 at the first dark', () => {
    expect(Li.singleSlitRatio(0, 5e-7, 1e-5)).toBe(1);
    expect(Li.singleSlitRatio(Li.singleSlitDarkDeg(1, 5e-7, 1e-5)!, 5e-7, 1e-5)).toBeLessThan(1e-12);
  });
  it('slide 28: θ_R = 1.22λ/D', () => close(Li.rayleighCircle(500e-9, 0.1), 6.1e-6));
  it('slide 34: 1.26×10⁴ lines per 25.4 mm, 589 nm ⇒ 1st order at 17.0°', () =>
    close(Li.gratingAngleDeg(1, 589e-9, Li.gratingSpacing(1.26e4, 25.4e-3))!, 16.99));
  it('highest order: d = 2.016 μm, 589 nm ⇒ m = 3', () => expect(Li.gratingMaxOrder(589e-9, 2.016e-6)).toBe(3));
});

describe('polarization', () => {
  it('slide 36: Malus I = I_max cos²θ', () => close(Li.malus(10, 60), 2.5));
  it('slides 38–39: vertical light through θ₁, θ₂, θ₃', () => {
    const out = Li.polarizerStack(1, [20, 40, 60], 0);
    close(out[2], Math.cos((20 * Math.PI) / 180) ** 6);
  });
  it('unpolarized light: the first sheet passes ½', () => close(Li.polarizerStack(8, [0, 45, 90], null)[2], 1));
  it('crossed polarizers pass nothing', () => expect(Li.polarizerStack(1, [0, 90], null)[1]).toBeLessThan(1e-12));
  it('slide 43: Brewster angle for water ≈ 53°', () => close(Li.brewsterDeg(1.333), 53.13));
});
