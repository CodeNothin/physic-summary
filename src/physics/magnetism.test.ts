// Tests for chapter 3 physics. Worksheet answers (Q26, Q27) and the lecture
// examples are the test cases, exactly as for chapters 1–2.
import { describe, expect, it } from 'vitest';
import * as M from './magnetism';

/** relative error below 0.5 %, i.e. agrees to 3 significant figures */
const close = (got: number, want: number, tol = 5e-3) =>
  expect(Math.abs(got - want) / Math.abs(want)).toBeLessThan(tol);

describe('worksheet Q26: proton circling in B', () => {
  it('K = 5.0 MeV, B = 0.33 T, m = 1.66e-27 kg  ⇒  r = 0.98 m', () => {
    const r = M.orbitRadiusFromKineticEnergy(1.66e-27, 5.0 * M.MEV, M.E_CHARGE, 0.33);
    expect(r).toBeCloseTo(0.98, 2);
  });
});

describe('worksheet Q27: two long wires along z', () => {
  // wire A through (0, a) carries I along +k; wire B through (b, 0) carries 2I along −k
  const I = 1;
  const B = M.lineCurrentsField(
    [
      { x: 0, y: 3, I },
      { x: 4, y: 0, I: -2 * I },
    ],
    { x: 0, y: 0 },
  );
  const unit = (M.MU0 * I) / (2 * Math.PI);
  it('B = μ0 I / 2π · (1/3 î + 1/2 ĵ)', () => {
    close(B.x / unit, 1 / 3);
    close(B.y / unit, 1 / 2);
  });
});

describe('cross product and F = q v × B', () => {
  it('x̂ × ŷ = ẑ and order matters', () => {
    expect(M.cross(M.vec3(1, 0, 0), M.vec3(0, 1, 0))).toEqual(M.vec3(0, 0, 1));
    expect(M.cross(M.vec3(0, 1, 0), M.vec3(1, 0, 0))).toEqual(M.vec3(0, 0, -1));
  });
  it('slide 3: + charge, v up, B right ⇒ F into the page; − charge ⇒ out', () => {
    const v = M.vec3(0, 1, 0);
    const B = M.vec3(1, 0, 0);
    expect(M.forceOnCharge(1, v, B).z).toBeLessThan(0);
    expect(M.forceOnCharge(-1, v, B).z).toBeGreaterThan(0);
  });
  it('|F| = |q| v B sinθ', () => {
    close(M.forceOnChargeMagnitude(-2e-6, 3e5, 0.4, 30), 2e-6 * 3e5 * 0.4 * 0.5);
    expect(M.forceOnChargeMagnitude(1, 1, 1, 0)).toBe(0);
  });
});

describe('velocity selector (slide 5)', () => {
  it('v = E / B', () => {
    expect(M.velocitySelectorSpeed(2.5e4, 0.05)).toBeCloseTo(5e5, 6);
  });
  it('a proton at v = E/B goes straight; a faster one is pushed sideways', () => {
    // slide 5: E to the right (+x), B into page (−z), v up (+y)
    const run = (vy: number) =>
      M.simulateCharge2D({
        q: M.E_CHARGE,
        m: 1.67e-27,
        start: { p: { x: 0, y: 0 }, v: { x: 0, y: vy } },
        E: { x: 2.5e4, y: 0 },
        Bz: -0.05,
        dt: 1e-10,
        steps: 1000,
      });
    const straight = run(5e5);
    expect(Math.abs(straight[straight.length - 1].x)).toBeLessThan(1e-6);
    const fast = run(6e5); // F_B = qvB beats qE ⇒ pushed left (−x)
    expect(fast[fast.length - 1].x).toBeLessThan(-1e-4);
  });
  it('with E = 0 the path is a circle of radius mv/(qB)', () => {
    const m = 1.67e-27;
    const v = 1e5;
    const B = 0.1;
    const r = M.orbitRadius(m, v, M.E_CHARGE, B);
    const path = M.simulateCharge2D({
      q: M.E_CHARGE,
      m,
      start: { p: { x: 0, y: 0 }, v: { x: v, y: 0 } },
      E: { x: 0, y: 0 },
      Bz: B,
      dt: 1e-10,
      steps: 6000,
    });
    // centre of the circle is at (0, −r) for + charge, v along +x, B out of page
    for (const p of path.filter((_, i) => i % 500 === 0)) close(Math.hypot(p.x, p.y + r), r, 1e-3);
  });
});

describe('force on wires (slides 7–11)', () => {
  const [I, R, B] = [2, 0.1, 0.5];
  it('semicircle: straight part +2IRB k̂, curved part −2IRB k̂', () => {
    const f = M.semicircleForces(I, R, B);
    expect(f.straight.z).toBeCloseTo(2 * I * R * B, 12);
    expect(f.curved.z).toBeCloseTo(-2 * I * R * B, 12);
  });
  it('the arc force by summing tiny pieces matches the formula (the integral)', () => {
    const arc = Array.from({ length: 4001 }, (_, k) => {
      const t = (k / 4000) * Math.PI;
      return M.vec3(R * Math.cos(t), R * Math.sin(t), 0);
    });
    const F = M.forceOnWirePath(I, arc, M.vec3(0, B, 0));
    close(F.z, -2 * I * R * B, 1e-4);
    expect(Math.abs(F.x) + Math.abs(F.y)).toBeLessThan(1e-12);
  });
  it('partial arc force reaches −2IRB at θ = π', () => {
    expect(M.semicircleArcForceUpTo(I, R, B, Math.PI)).toBeCloseTo(-2 * I * R * B, 12);
    expect(M.semicircleArcForceUpTo(I, R, B, 0)).toBe(-0);
  });
  it('|F| = I L B sinθ and F = I L × B agree', () => {
    const F = M.forceOnStraightWire(3, M.vec3(0.2, 0, 0), M.vec3(0, 0.4, 0));
    close(F.z, M.forceOnWireMagnitude(3, 0.2, 0.4, 90));
  });
});

describe('Biot–Savart (slides 12–15)', () => {
  const [I, a] = [5, 0.1];
  it('finite wire formula matches the numerical Biot–Savart sum', () => {
    const P = M.vec3(0, a, 0);
    const num = M.biotSavartPolyline(I, [M.vec3(-0.05, 0, 0), M.vec3(0.2, 0, 0)], P);
    close(num.z, M.finiteWireFieldFromEnds(I, a, -0.05, 0.2), 1e-4);
  });
  it('angle form sinθ1 + sinθ2 equals the end-position form', () => {
    const t1 = (Math.atan(0.05 / a) * 180) / Math.PI;
    const t2 = (Math.atan(0.2 / a) * 180) / Math.PI;
    close(M.finiteWireField(I, a, t1, t2), M.finiteWireFieldFromEnds(I, a, -0.05, 0.2));
  });
  it('infinite wire (θ1 = θ2 = 90°) gives μ0 I / 2πa', () => {
    close(M.finiteWireField(I, a, 90, 90), M.longWireField(I, a));
    close(M.longWireField(I, a), 1e-5);
  });
});

describe("Ampère's law (slides 16–19, 25)", () => {
  it('thick wire: B ∝ r inside, ∝ 1/r outside, continuous at R', () => {
    const [I, R] = [10, 0.02];
    close(M.thickWireField(I, R, 0.01), (M.MU0 * I * 0.01) / (2 * Math.PI * R * R));
    close(M.thickWireField(I, R, 0.04), M.longWireField(I, 0.04));
    close(M.thickWireField(I, R, R * (1 - 1e-9)), M.thickWireField(I, R, R));
    expect(M.thickWireEnclosedCurrent(I, R, 0.01)).toBeCloseTo(2.5, 12);
  });
  it('∮B·ds = μ0 I_enc for any loop shape; outside wires add nothing', () => {
    const wires = [
      { x: 0.1, y: 0, I: 3 },
      { x: -0.2, y: 0.1, I: -1 },
      { x: 2, y: 2, I: 7 }, // outside
    ];
    const square = [
      { x: -0.5, y: -0.5 },
      { x: 0.5, y: -0.5 },
      { x: 0.5, y: 0.5 },
      { x: -0.5, y: 0.5 },
    ];
    close(M.circulation(wires, square, 400), M.MU0 * 2, 2e-3);
  });
  it('solenoid B = μ0 n I', () => {
    close(M.solenoidField(M.turnsPerLength(500, 0.25), 2), 4 * Math.PI * 1e-7 * 2000 * 2);
  });
  it('slide 20: opposite currents, P at L/2 right of the right wire ⇒ 2μ0I/(3πL) into page', () => {
    const [I, L] = [1, 1];
    const Bz = M.inPageWireBz(-I, 0, 1.5 * L) + M.inPageWireBz(I, L, 1.5 * L);
    close(Bz, (-2 * M.MU0 * I) / (3 * Math.PI * L));
  });
});
