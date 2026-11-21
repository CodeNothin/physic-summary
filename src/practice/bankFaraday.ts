// =====================================================================
// Practice question generators for chapter 4 (Faraday's law, motional
// emf, RL circuits). Modelled on worksheet Q28 and the lecture
// examples (slides 7–8, 13, 24, 27–30).
//
// Lenz's-law directions are practised in the "lenz" widget (it has a
// guess-first mode), because the practice checker takes numbers only.
// Every answer comes from src/physics/faraday.ts.
// =====================================================================
import { fmt, tex } from '../lib/format';
import * as P from '../physics';
import { U, int, pick } from './common';
import type { Generator, Rng } from './common';

/** A time in ms that is a "nice" multiple of τ (so t/τ is between 0.25 and 3). */
function niceTime(rng: Rng, tau: number): number {
  const k = pick(rng, [0.25, 0.5, 1, 1.5, 2, 3]);
  return Number((k * tau * 1000).toPrecision(2)); // ms, two significant figures
}

/** R (Ω) and L (H) pairs that give tidy time constants. */
function pickRL(rng: Rng) {
  const R = pick(rng, [2, 4, 5, 6, 8, 10, 12]);
  const L = pick(rng, [0.1, 0.12, 0.2, 0.24, 0.3, 0.4, 0.5]);
  return { R, L };
}

const TAU_HINT = String.raw`ค่าคงที่เวลา $\tau=L/R$ (แปลง mH เป็น H ก่อน)`;

export const faradayGenerators: Generator[] = [
  // ------------------------------------------------ flux and Faraday's law
  {
    id: 'flux-angle',
    skill: 'faradayFlux',
    title: 'ฟลักซ์แม่เหล็กผ่านขดลวดที่เอียง',
    make: (rng) => {
      const side = pick(rng, [5, 10, 12, 15, 20]); // cm
      const B = pick(rng, [0.2, 0.3, 0.4, 0.5, 0.8]);
      const ang = pick(rng, [30, 37, 45, 53, 60]);
      const toPlane = rng() < 0.5; // angle given to the plane instead of the normal
      const A = (side / 100) ** 2;
      const theta = toPlane ? 90 - ang : ang;
      const phi = P.fluxUniform(B, A, theta);
      const ref = toPlane ? 'ระนาบของขดลวด' : 'เส้นตั้งฉากกับระนาบของขดลวด';
      return {
        prompt: String.raw`ขดลวดสี่เหลี่ยมจัตุรัสยาวด้านละ ${side} cm อยู่ในสนามแม่เหล็กสม่ำเสมอ ${B} T โดยสนามทำมุม ${ang}° กับ${ref} จงหาฟลักซ์แม่เหล็กผ่านขดลวด`,
        units: U.weber,
        answer: phi,
        scale: phi,
        mistakes: [
          { id: 'angle-to-plane', value: P.fluxUniform(B, A, toPlane ? ang : 90 - ang) },
          { id: 'area-cm2', value: P.fluxUniform(B, side * side, theta) },
        ],
        hints: [
          String.raw`$\Phi_B=BA\cos\theta$ โดย $\theta$ วัดจาก **เวกเตอร์พื้นที่** (ตั้งฉากกับระนาบ)`,
          toPlane ? String.raw`มุมกับระนาบ ${ang}° จึงได้ $\theta=90^\circ-${ang}^\circ=${theta}^\circ$` : String.raw`$\theta=${ang}^\circ$ วัดจากเส้นตั้งฉากอยู่แล้ว`,
          String.raw`$A=(${side / 100})^2=${tex(A)}\ \mathrm{m^2}$`,
        ],
        solution: [
          String.raw`$\theta=${theta}^\circ$, $A=${tex(A)}\ \mathrm{m^2}$`,
          String.raw`$\Phi_B=BA\cos\theta=(${B})(${tex(A)})\cos${theta}^\circ=${tex(phi)}\ \mathrm{Wb}$`,
        ],
      };
    },
  },
  {
    id: 'faraday-dB',
    skill: 'faradayFlux',
    title: 'emf จากสนามที่เปลี่ยนตามเวลา',
    make: (rng) => {
      const rCm = pick(rng, [2, 4, 5, 8, 10]);
      const B1 = pick(rng, [0, 0.1, 0.2, 0.3]);
      const B2 = B1 + pick(rng, [0.2, 0.4, 0.5, 0.6, 0.8]);
      const dtMs = pick(rng, [20, 40, 50, 100, 200]);
      const A = Math.PI * (rCm / 100) ** 2;
      const dt = dtMs / 1000;
      const emf = Math.abs(P.faradayEmf(A * (B2 - B1), dt));
      return {
        prompt: String.raw`ขดลวดวงกลมรัศมี ${rCm} cm วางตั้งฉากกับสนามแม่เหล็กสม่ำเสมอ สนามเพิ่มจาก ${B1} T เป็น ${fmt(B2)} T อย่างสม่ำเสมอในเวลา ${dtMs} ms จงหาขนาดของ emf เหนี่ยวนำในขดลวด`,
        units: U.emf,
        answer: emf,
        scale: emf,
        mistakes: [
          ...(B1 > 0 ? [{ id: 'flux-not-change', value: (A * B2) / dt }] : []),
          { id: 'cm-not-m', value: (Math.PI * rCm * rCm * (B2 - B1)) / dt },
        ],
        hints: [
          String.raw`$|\varepsilon|=\dfrac{|\Delta\Phi_B|}{\Delta t}$ และสนามตั้งฉากกับขด จึงได้ $\Phi_B=BA$`,
          String.raw`$\Delta\Phi_B=A\,\Delta B=\pi r^2(B_2-B_1)$`,
        ],
        solution: [
          String.raw`$A=\pi(${rCm / 100})^2=${tex(A)}\ \mathrm{m^2}$`,
          String.raw`$\Delta\Phi_B=A(B_2-B_1)=(${tex(A)})(${fmt(B2 - B1)})=${tex(A * (B2 - B1))}\ \mathrm{Wb}$`,
          String.raw`$|\varepsilon|=\dfrac{${tex(A * (B2 - B1))}}{${tex(dt)}}=${tex(emf)}\ \mathrm V$`,
        ],
      };
    },
  },

  // ------------------------------------------------ motional emf
  {
    id: 'motional-emf',
    skill: 'motional',
    title: 'emf ของแท่งตัวนำที่เคลื่อนที่',
    make: (rng) => {
      const B = pick(rng, [0.2, 0.3, 0.4, 0.5, 0.8, 1.2]);
      const lcm = pick(rng, [10, 20, 25, 40, 50, 80]);
      const v = pick(rng, [2, 3, 4, 5, 8, 10]);
      const emf = P.motionalEmf(B, lcm / 100, v);
      return {
        prompt: String.raw`แท่งตัวนำยาว ${lcm} cm เคลื่อนที่ด้วยอัตราเร็ว ${v} m/s ตั้งฉากกับสนามแม่เหล็กสม่ำเสมอ ${B} T (แท่งตั้งฉากกับทั้งความเร็วและสนาม) จงหาความต่างศักย์ระหว่างปลายแท่ง`,
        units: U.emf,
        answer: emf,
        scale: emf,
        mistakes: [{ id: 'cm-not-m', value: B * lcm * v }],
        hints: [String.raw`$|\varepsilon|=B\ell v$ (อยู่ในชีท)`, 'แปลงความยาวเป็นเมตรก่อน'],
        solution: [String.raw`$|\varepsilon|=B\ell v=(${B})(${lcm / 100})(${v})=${tex(emf)}\ \mathrm V$`],
      };
    },
  },
  {
    id: 'rail-current',
    skill: 'motional',
    title: 'กระแสในวงจรแท่งบนราง',
    make: (rng) => {
      const B = pick(rng, [0.2, 0.4, 0.5, 0.6, 0.8]);
      const lcm = pick(rng, [20, 25, 40, 50, 60]);
      const v = pick(rng, [2, 3, 4, 5, 6]);
      const R = pick(rng, [0.5, 1, 2, 4, 5]);
      const I = P.railCurrent(B, lcm / 100, v, R);
      return {
        prompt: String.raw`แท่งตัวนำยาว ${lcm} cm วางพาดบนรางโลหะซึ่งปลายด้านหนึ่งต่อกับตัวต้านทาน ${R} Ω สนามแม่เหล็ก ${B} T ตั้งฉากกับระนาบของราง ถ้าลากแท่งด้วยอัตราเร็วคงที่ ${v} m/s จงหากระแสในวงจร (ไม่คิดความต้านทานของแท่งและราง)`,
        units: U.current,
        answer: I,
        scale: I,
        mistakes: [{ id: 'cm-not-m', value: P.railCurrent(B, lcm, v, R) }],
        hints: [String.raw`วงจรเทียบเท่า: แบตเตอรี่ $|\varepsilon|=B\ell v$ ต่อกับ $R$`, String.raw`$I=B\ell v/R$`],
        solution: [
          String.raw`$|\varepsilon|=B\ell v=(${B})(${lcm / 100})(${v})=${tex(P.motionalEmf(B, lcm / 100, v))}\ \mathrm V$`,
          String.raw`$I=\dfrac{|\varepsilon|}{R}=${tex(I)}\ \mathrm A$`,
        ],
      };
    },
  },
  {
    id: 'rail-force',
    skill: 'motional',
    title: 'แรงที่ต้องใช้ลากแท่งด้วยความเร็วคงที่',
    make: (rng) => {
      const B = pick(rng, [0.2, 0.4, 0.5, 0.6, 0.8]);
      const lcm = pick(rng, [20, 25, 40, 50, 60]);
      const v = pick(rng, [2, 3, 4, 5, 6]);
      const R = pick(rng, [0.5, 1, 2, 4, 5]);
      const l = lcm / 100;
      const I = P.railCurrent(B, l, v, R);
      const F = P.railForce(B, l, v, R);
      return {
        prompt: String.raw`แท่งตัวนำยาว ${lcm} cm วางพาดบนรางที่ต่อกับตัวต้านทาน ${R} Ω ในสนามแม่เหล็ก ${B} T ซึ่งตั้งฉากกับระนาบของราง ต้องออกแรงเท่าใดจึงจะลากแท่งด้วยอัตราเร็วคงที่ ${v} m/s (ไม่คิดแรงเสียดทาน)`,
        units: U.force,
        answer: F,
        scale: F,
        mistakes: [{ id: 'gave-current', value: I }],
        hints: [
          'ความเร็วคงที่: แรงที่ลาก = แรงแม่เหล็กที่ต้านแท่ง',
          String.raw`$I=B\ell v/R$ แล้ว $F_B=I\ell B$`,
          String.raw`รวมกันได้ $F=\dfrac{B^2\ell^2v}{R}$`,
        ],
        solution: [
          String.raw`$I=\dfrac{B\ell v}{R}=\dfrac{(${B})(${l})(${v})}{${R}}=${tex(I)}\ \mathrm A$`,
          String.raw`$F=I\ell B=(${tex(I)})(${l})(${B})=${tex(F)}\ \mathrm N$`,
        ],
      };
    },
  },
  {
    id: 'loop-region-emf',
    skill: 'motional',
    title: 'ขดลวดผ่านบริเวณสนาม (สไลด์ 13)',
    make: (rng) => {
      const B = pick(rng, [0.2, 0.4, 0.5, 0.8]);
      const lcm = pick(rng, [5, 10, 20]);
      const wcm = pick(rng, [5, 10, 20]);
      const v = pick(rng, [1, 2, 3, 4]);
      // right edge somewhere in one of the three phases (never exactly on a corner)
      const phase = pick(rng, ['in', 'inside', 'out'] as const);
      const xw = phase === 'in' ? pick(rng, [0.3, 0.5, 0.7]) : phase === 'inside' ? pick(rng, [1.5, 2, 2.5]) : pick(rng, [3.3, 3.5, 3.8]);
      const xcm = Number((xw * wcm).toFixed(1));
      const emf = Math.abs(P.loopRegionEmf(B, lcm / 100, wcm / 100, (3 * wcm) / 100, xcm / 100, v));
      const Blv = P.motionalEmf(B, lcm / 100, v);
      return {
        prompt: String.raw`ขดลวดสี่เหลี่ยมกว้าง $w=${wcm}$ cm สูง $\ell=${lcm}$ cm เคลื่อนที่ด้วยความเร็วคงที่ ${v} m/s ผ่านบริเวณกว้าง $3w$ (จาก $x=0$ ถึง $x=${3 * wcm}$ cm) ที่มีสนามแม่เหล็กสม่ำเสมอ ${B} T พุ่งเข้า ขณะขอบขวาของขดอยู่ที่ $x=${xcm}$ cm จงหาขนาดของ emf เหนี่ยวนำ`,
        units: U.emf,
        answer: emf,
        scale: Blv,
        mistakes: phase === 'inside' ? [{ id: 'emf-while-inside', value: Blv }] : [{ id: 'cm-not-m', value: B * lcm * v }],
        hints: [
          String.raw`ขดอยู่ในสนามแค่บางส่วน ทั้งขด หรือกำลังออก? ขอบซ้ายอยู่ที่ $x-w=${fmt(xcm - wcm)}$ cm`,
          'emf เกิดเมื่อฟลักซ์เปลี่ยน คือมีขอบข้างเดียวอยู่ในสนาม',
          String.raw`ขอบข้างเดียวตัดสนาม: $|\varepsilon|=B\ell v$`,
        ],
        solution:
          phase === 'inside'
            ? [String.raw`ขอบซ้ายที่ ${fmt(xcm - wcm)} cm และขอบขวาที่ ${xcm} cm อยู่ในสนามทั้งคู่ ฟลักซ์ $=B\ell w$ คงที่`, String.raw`$|\varepsilon|=\left|\dfrac{d\Phi_B}{dt}\right|=0$`]
            : [
                phase === 'in' ? 'ขอบขวาอยู่ในสนาม ขอบซ้ายยังไม่เข้า: ฟลักซ์กำลังเพิ่ม' : 'ขอบขวาออกไปแล้ว ขอบซ้ายยังอยู่ในสนาม: ฟลักซ์กำลังลด',
                String.raw`$|\varepsilon|=B\ell v=(${B})(${lcm / 100})(${v})=${tex(Blv)}\ \mathrm V$`,
              ],
      };
    },
  },

  // ------------------------------------------------ RL circuits
  {
    id: 'rl-tau',
    skill: 'rl',
    title: 'ค่าคงที่เวลาของวงจร RL',
    make: (rng) => {
      const R = pick(rng, [2, 4, 5, 6, 8, 10, 20]);
      const LmH = pick(rng, [10, 20, 30, 50, 100, 200, 400]);
      const tau = P.rlTau(LmH / 1000, R);
      return {
        prompt: String.raw`วงจร RL มีตัวต้านทาน ${R} Ω และตัวเหนี่ยวนำ ${LmH} mH จงหาค่าคงที่เวลาของวงจร`,
        units: U.time,
        answer: tau,
        scale: tau,
        mistakes: [
          { id: 'rl-tau-inverted', value: R / (LmH / 1000) },
          { id: 'mH-not-converted', value: LmH / R },
        ],
        hints: [TAU_HINT],
        solution: [String.raw`$\tau=\dfrac{L}{R}=\dfrac{${LmH}\times10^{-3}}{${R}}=${tex(tau)}\ \mathrm s$`],
      };
    },
  },
  {
    id: 'q28-imax',
    skill: 'rl',
    title: 'กระแสสูงสุดในวงจร RL (แบบข้อ 28)',
    make: (rng) => {
      const { R, L } = pickRL(rng);
      const E = pick(rng, [6, 9, 12, 18, 24]);
      const I = P.rlMaxCurrent(E, R);
      return {
        prompt: String.raw`ตัวต้านทาน ${R} Ω ขดลวดเหนี่ยวนำ ${L} H แบตเตอรี่ ${E} V และสวิตช์ต่ออนุกรมกัน หลังสับสวิตช์ลงนานมาก กระแสในวงจรมีค่าสูงสุดเท่าใด`,
        units: U.current,
        answer: I,
        scale: I,
        mistakes: [],
        hints: ['เมื่อเวลาผ่านไปนาน กระแสคงที่ $dI/dt=0$ ตัวเหนี่ยวนำจึงเหมือนลวดธรรมดา', String.raw`$I_{max}=\varepsilon/R$`],
        solution: [String.raw`$I_{max}=\dfrac{\varepsilon}{R}=\dfrac{${E}}{${R}}=${tex(I)}\ \mathrm A$ (ไม่ขึ้นกับ $L$)`],
      };
    },
  },
  {
    id: 'q28-current',
    skill: 'rl',
    title: 'กระแสขณะกำลังเพิ่ม (แบบข้อ 28)',
    make: (rng) => {
      const { R, L } = pickRL(rng);
      const E = pick(rng, [6, 9, 12, 18, 24]);
      const tau = P.rlTau(L, R);
      const tMs = niceTime(rng, tau);
      const t = tMs / 1000;
      const I = P.rlRise(E, R, L, t);
      return {
        prompt: String.raw`ตัวต้านทาน ${R} Ω ขดลวดเหนี่ยวนำ ${L} H แบตเตอรี่ ${E} V และสวิตช์ต่ออนุกรมกัน จงหากระแสหลังสับสวิตช์ลงไปแล้ว ${tMs} ms`,
        units: U.current,
        answer: I,
        scale: I,
        mistakes: [
          { id: 'rl-decay-for-rise', value: P.rlDecay(E, R, L, t) },
          { id: 'rl-tau-inverted', value: (E / R) * (1 - Math.exp(-t / (R / L))) },
        ],
        hints: [TAU_HINT, String.raw`กระแสเริ่มจาก 0 แล้วเพิ่ม: $I(t)=\dfrac{\varepsilon}{R}\left(1-e^{-t/\tau}\right)$`],
        solution: [
          String.raw`$\tau=\dfrac{L}{R}=\dfrac{${L}}{${R}}=${tex(tau)}\ \mathrm s$`,
          String.raw`$I=\dfrac{${E}}{${R}}\left(1-e^{-${tex(t)}/${tex(tau)}}\right)=${tex(I)}\ \mathrm A$`,
        ],
      };
    },
  },
  {
    id: 'rl-decay',
    skill: 'rl',
    title: 'กระแสขณะกำลังลด (กรณีที่ 2)',
    make: (rng) => {
      const { R, L } = pickRL(rng);
      const E = pick(rng, [6, 9, 12, 18, 24]);
      const tau = P.rlTau(L, R);
      const tMs = niceTime(rng, tau);
      const t = tMs / 1000;
      const I = P.rlDecay(E, R, L, t);
      return {
        prompt: String.raw`วงจร RL ($R=${R}\ \Omega$, $L=${L}$ H) ต่อกับแบตเตอรี่ ${E} V จนกระแสคงที่ แล้วที่ $t=0$ สับสวิตช์ตัดแบตเตอรี่ออก (R และ L ยังต่อกันเป็นวง) จงหากระแสที่ $t=${tMs}$ ms`,
        units: U.current,
        answer: I,
        scale: I,
        mistakes: [{ id: 'rl-rise-for-decay', value: P.rlRise(E, R, L, t) }],
        hints: [TAU_HINT, String.raw`กระแสเริ่มที่ $\varepsilon/R$ แล้วลด: $I(t)=\dfrac{\varepsilon}{R}e^{-t/\tau}$`],
        solution: [
          String.raw`$\tau=\dfrac{L}{R}=${tex(tau)}\ \mathrm s$, $I(0)=\dfrac{${E}}{${R}}=${tex(E / R)}\ \mathrm A$`,
          String.raw`$I=${tex(E / R)}\,e^{-${tex(t)}/${tex(tau)}}=${tex(I)}\ \mathrm A$`,
        ],
      };
    },
  },
  {
    id: 'rl-VL',
    skill: 'rl',
    title: 'แรงดันคร่อมตัวเหนี่ยวนำ (สไลด์ 26)',
    make: (rng) => {
      const R = pick(rng, [2, 4, 5, 6, 10]);
      const LmH = pick(rng, [10, 20, 30, 50, 100]);
      const E = pick(rng, [6, 9, 12, 18, 24]);
      const L = LmH / 1000;
      const tau = P.rlTau(L, R);
      const tMs = niceTime(rng, tau);
      const { VR, VL } = P.rlRiseVoltages(E, R, L, tMs / 1000);
      return {
        prompt: String.raw`วงจร RL ต่ออนุกรมกับแบตเตอรี่ $\varepsilon=${E}$ V โดย $R=${R}\ \Omega$ และ $L=${LmH}$ mH หลังปิดสวิตช์ไป ${tMs} ms แรงดันคร่อมตัวเหนี่ยวนำมีขนาดเท่าใด`,
        units: U.emf,
        answer: VL,
        scale: VL,
        mistakes: [{ id: 'rl-VR-for-VL', value: VR }],
        hints: [TAU_HINT, String.raw`$\Delta V_R=IR$ และ $\Delta V_L=\varepsilon-\Delta V_R$`, String.raw`รวมกันได้ $\Delta V_L=\varepsilon e^{-t/\tau}$`],
        solution: [
          String.raw`$\tau=\dfrac{${LmH}\times10^{-3}}{${R}}=${tex(tau)}\ \mathrm s$`,
          String.raw`$\Delta V_L=\varepsilon e^{-t/\tau}=${E}\,e^{-${tex(tMs / 1000)}/${tex(tau)}}=${tex(VL)}\ \mathrm V$`,
        ],
      };
    },
  },
  {
    id: 'rl-time-fraction',
    skill: 'rl',
    title: 'เวลาที่กระแสขึ้นถึงกี่เปอร์เซ็นต์',
    make: (rng) => {
      const R = pick(rng, [2, 4, 5, 10, 20]);
      const LmH = pick(rng, [20, 50, 100, 200, 500]);
      const pct = pick(rng, [50, 75, 80, 90, 95, 99]);
      const tau = P.rlTau(LmH / 1000, R);
      const t = P.rlTimeToFraction(tau, pct / 100);
      return {
        prompt: String.raw`วงจร RL มี $R=${R}\ \Omega$ และ $L=${LmH}$ mH ต่อกับแบตเตอรี่ที่ $t=0$ ต้องใช้เวลานานเท่าใดกระแสจึงขึ้นถึง ${pct}% ของค่าสูงสุด`,
        units: U.time,
        answer: t,
        scale: t,
        mistakes: [
          { id: 'rl-ln-sign', value: -tau * Math.log(pct / 100) },
          { id: 'rl-tau-inverted', value: (-R / (LmH / 1000)) * Math.log(1 - pct / 100) },
        ],
        hints: [TAU_HINT, String.raw`$\dfrac{I}{I_{max}}=1-e^{-t/\tau}=${pct / 100}$`, String.raw`$t=-\tau\ln(1-${pct / 100})$`],
        solution: [
          String.raw`$\tau=\dfrac{${LmH}\times10^{-3}}{${R}}=${tex(tau)}\ \mathrm s$`,
          String.raw`$e^{-t/\tau}=1-${pct / 100}=${fmt(1 - pct / 100)}$`,
          String.raw`$t=-\tau\ln(${fmt(1 - pct / 100)})=${tex(t)}\ \mathrm s$`,
        ],
      };
    },
  },
  {
    id: 'rl-design-L',
    skill: 'rl',
    title: 'เลือก L ให้กระแสขึ้นช้าพอ (สไลด์ 27–30)',
    make: (rng) => {
      const R = pick(rng, [100, 150, 175, 200, 250]);
      const ImA = pick(rng, [20, 30, 36, 40, 50]);
      const limA = Number((ImA * pick(rng, [0.1, 0.12, 0.15, 0.2])).toPrecision(2));
      const tUs = int(rng, 4, 12) * 10;
      const tau = P.rlTauForLimit(ImA / 1000, limA / 1000, tUs * 1e-6);
      const L = tau * R;
      return {
        prompt: String.raw`อุปกรณ์ที่มีความต้านทาน ${R} Ω ทำงานที่กระแส ${ImA} mA แต่ใน ${tUs} μs แรกหลังปิดสวิตช์ กระแสต้องไม่เกิน ${limA} mA จึงต่อตัวเหนี่ยวนำอนุกรมกับอุปกรณ์ ต้องใช้ความเหนี่ยวนำเท่าใด`,
        units: U.henry,
        answer: L,
        scale: L,
        mistakes: [{ id: 'rl-tau-inverted', value: R / tau }],
        hints: [
          String.raw`$I(t)=I_{max}\left(1-e^{-t/\tau}\right)$ แทน $I=${limA}$ mA, $I_{max}=${ImA}$ mA`,
          String.raw`$e^{-t/\tau}=1-\dfrac{${limA}}{${ImA}}$ แล้วใส่ ln ทั้งสองข้าง`,
          String.raw`ได้ $\tau$ แล้ว $L=\tau R$`,
        ],
        solution: [
          String.raw`$e^{-t/\tau}=1-\dfrac{${limA}}{${ImA}}=${fmt(1 - limA / ImA)}$`,
          String.raw`$\tau=\dfrac{-t}{\ln(${fmt(1 - limA / ImA)})}=\dfrac{${tUs}\times10^{-6}}{${fmt(-Math.log(1 - limA / ImA))}}=${tex(tau)}\ \mathrm s$`,
          String.raw`$L=\tau R=(${tex(tau)})(${R})=${tex(L)}\ \mathrm H$`,
        ],
      };
    },
  },
];
