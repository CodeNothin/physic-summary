// =====================================================================
// Worksheet question 28 (chapter 4: Faraday's law and inductance),
// in the same form as ch1to3.ts. The wording follows the worksheet;
// only the numbers change. The worksheet calls the battery E (the exam
// sheet writes ε).
// =====================================================================
import { tex } from '../lib/format';
import * as P from '../physics';
import { U, pick } from '../practice/common';
import { defineQuestion } from './types';
import type { Question } from './types';

/** "9.0" style: one decimal place, as the worksheet prints its numbers. */
const d1 = (x: number) => x.toFixed(1);
/** Two decimals for inductances like 0.20 H. */
const d2 = (x: number) => x.toFixed(2);

// ------------------------------------------------------------- Q28
// Series R, L, battery E and switch. Find the largest current, and the
// current t milliseconds after the switch is closed.

interface Q28 {
  /** resistance, Ω */
  R: number;
  /** inductance, H */
  L: number;
  /** battery, V */
  E: number;
  /** time after closing the switch, ms */
  tMs: number;
}

const q28 = defineQuestion<Q28>({
  q: 28,
  chapter: 'faraday',
  title: 'วงจร RL: กระแสสูงสุด และกระแสหลังสับสวิตช์',
  idea: 'นานมาก ๆ ตัวเหนี่ยวนำไม่มีผล $I_{max}=E/R$ ระหว่างทาง $I=\\dfrac{E}{R}(1-e^{-t/\\tau})$ โดย $\\tau=L/R$',
  lesson: '#/faraday/f-rl',
  sheet: [
    String.raw`I(t)=\dfrac{\varepsilon}{R}\left(1-e^{-t/\tau}\right)`,
    String.raw`\tau=\dfrac{L}{R}`,
    String.raw`\varepsilon_L=-L\dfrac{dI}{dt}`,
  ],
  notOnSheet: [
    'กระแสสูงสุด $I_{max}=E/R$: เมื่อเวลาผ่านไปนาน $dI/dt=0$ ตัวเหนี่ยวนำเหมือนลวดธรรมดา (หรือแทน $t\\to\\infty$ ในสูตรของชีท)',
    'เวิร์กชีตเขียนแบตเตอรี่ว่า $E$ ซึ่งคือ $\\varepsilon$ ในชีท',
  ],
  original: { R: 4.0, L: 0.2, E: 9.0, tMs: 50 },
  random: (rng) => {
    const R = pick(rng, [2, 4, 5, 6, 8, 10]);
    const L = pick(rng, [0.1, 0.2, 0.3, 0.4, 0.5]);
    const E = pick(rng, [6, 9, 12, 15, 18, 24]);
    const tau = P.rlTau(L, R);
    const tMs = Number((pick(rng, [0.5, 1, 1.5, 2]) * tau * 1000).toPrecision(2));
    return { R, L, E, tMs };
  },
  build: ({ R, L, E, tMs }) => {
    const t = tMs / 1000;
    const tau = P.rlTau(L, R);
    const Imax = P.rlMaxCurrent(E, R);
    const I = P.rlRise(E, R, L, t);
    return {
      prompt: String.raw`ตัวต้านทานไฟฟ้า $R$ ขนาด ${d1(R)} โอห์ม ขดลวดเหนี่ยวนำ $L$ ขนาด ${d2(L)} เฮนรี แบตเตอรี่ $E$ ขนาด ${d1(E)} โวลต์ และสวิตช์ $S$ ต่ออนุกรมกัน ดังรูป ถ้าสับสวิตช์ลง จงหากระแสไฟฟ้าสูงสุดในวงจร และ กระแสไฟฟ้าหลังจากสับสวิตช์เมื่อเวลาผ่านไป ${tMs} มิลลิวินาที`,
      figure: { id: 'q28', props: {} },
      parts: [
        {
          label: '',
          ask: '',
          boxes: [
            {
              kind: 'number',
              label: 'กระแสสูงสุด $I_{max}$',
              units: U.current,
              answer: Imax,
              scale: Imax,
              mistakes: [],
            },
            {
              kind: 'number',
              label: String.raw`กระแสที่ $t=${tMs}$ ms`,
              units: U.current,
              answer: I,
              scale: I,
              mistakes: [
                { id: 'rl-decay-for-rise', value: P.rlDecay(E, R, L, t) },
                { id: 'rl-tau-inverted', value: Imax * (1 - Math.exp(-t / (R / L))) },
              ],
            },
          ],
        },
      ],
      hints: [
        'กระแสสูงสุดเกิดเมื่อเวลาผ่านไปนาน จนกระแสคงที่ ตัวเหนี่ยวนำจึงไม่มีผล',
        String.raw`$\tau=\dfrac{L}{R}=\dfrac{${d2(L)}}{${d1(R)}}$`,
        String.raw`กระแสกำลังเพิ่มจาก 0: $I(t)=\dfrac{E}{R}\left(1-e^{-t/\tau}\right)$ แปลง ${tMs} ms เป็นวินาทีก่อน`,
      ],
      solution: [
        String.raw`$I_{max}=\dfrac{E}{R}=\dfrac{${d1(E)}}{${d1(R)}}=${tex(Imax)}$ A`,
        String.raw`จาก $E=IR+L\dfrac{dI}{dt}$ ได้ $I(t)=\dfrac{E}{R}\left(1-e^{-\frac{R}{L}t}\right)$`,
        String.raw`$\tau=\dfrac{L}{R}=${tex(tau)}$ s`,
        String.raw`$I=\dfrac{${d1(E)}}{${d1(R)}}\left(1-e^{-\frac{${d1(R)}}{${d2(L)}}\times${tex(t)}}\right)=${tex(I)}$ A`,
      ],
    };
  },
});

/** Chapter 4 worksheet questions. */
export const ch4Questions: Question[] = [q28];
