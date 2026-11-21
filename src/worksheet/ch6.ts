// =====================================================================
// Worksheet questions 31–33 (chapter 6: light), in the same form as
// ch5.ts. The wording follows the worksheet; only the numbers change.
//
// Q31 and Q33 are answered with symbols, so their boxes are choices (as
// Q24 is). Their "numbers" are what can change in an exam version:
//   Q31 — which dark fringe x is measured to (the worksheet: the first)
//   Q33 — the angle of incidence (the worksheet: 60°)
// Q32 is numeric.
// =====================================================================
import { tex } from '../lib/format';
import * as P from '../physics';
import { U, pick } from '../practice/common';
import { defineQuestion } from './types';
import type { Question } from './types';

/** "6.40\times10^{-4}" with three significant figures, as the worksheet prints its numbers. */
const s3 = (x: number) => {
  const [m, e] = x.toExponential(2).split('e');
  return String.raw`${m}\times10^{${Number(e)}}`;
};

/** Thai ordinal for "แถบมืดแถบแรก / ที่ 2 / ที่ 3". */
const darkName = (k: number) => (k === 1 ? 'แถบมืดแถบแรก' : `แถบมืดแถบที่ ${k}`);

/** TeX of (2k − 1)/2 as a coefficient in front of λL/d: ½, 3/2, 5/2. */
const half = (k: number) => (k === 1 ? '' : String(2 * k - 1));

// ------------------------------------------------------------- Q31
// Double slit in symbols: x to the k-th dark fringe; screen moved ΔL;
// wavelength ratio that keeps x.

interface Q31 {
  /** which dark fringe (1 = the first, as in the worksheet) */
  k: number;
}

const q31 = defineQuestion<Q31>({
  q: 31,
  chapter: 'light',
  title: 'การแทรกสอดสองสลิต (ตัวแปร)',
  idea: 'แถบมืด $d\\dfrac{x}{L}=\\left(m+\\tfrac12\\right)\\lambda$ แถบมืดแรกคือ $m=0$ แล้วแทน $L$ ด้วย $L+\\Delta L$',
  lesson: '#/light/l-double',
  sheet: [
    String.raw`d\sin\theta=\left(m+\tfrac12\right)\lambda\ \text{(dark)}`,
    String.raw`y_{\text{dark}}=\dfrac{\lambda L}{d}\left(m+\tfrac12\right)`,
  ],
  notOnSheet: ['มุมเล็ก $\\sin\\theta\\approx\\tan\\theta=x/L$ (สูตร $y_{dark}$ ในชีทใช้สิ่งนี้แล้ว)', 'แถบมืดแรกคือ $m=0$ ไม่ใช่ $m=1$'],
  original: { k: 1 },
  random: (rng) => ({ k: pick(rng, [1, 1, 2, 3]) }),
  build: ({ k }) => {
    const c = half(k); // coefficient on top of 2d
    const frac = (top: string) => String.raw`\dfrac{${c}${top}}{2d}`;
    return {
      prompt: String.raw`แสงเอกรงค์ (monochromatic) มีความยาวคลื่น $\lambda$ เคลื่อนที่ผ่านสลิตคู่ที่มีระยะห่างระหว่างสลิตเท่ากับ $d$ และไปแทรกสอดกันบนฉากรับแสงที่อยู่ห่างออกไปจากสลิตเป็นระยะ $L$ ($L\gg d$) ดังรูป (A) กำหนดให้รูของสลิตมีขนาดเล็กมากจนประมาณได้ว่าเป็นจุด และ $x$ คือระยะระหว่างจุดกึ่งกลางของ${darkName(k)}กับจุดกึ่งกลางของแถบสว่างกลาง`,
      figure: { id: 'q31', props: {} },
      parts: [
        {
          label: 'ก',
          ask: 'จงหาค่า $x$',
          boxes: [
            {
              kind: 'choice',
              label: '$x$',
              options: [
                { tex: String.raw`x=${frac(String.raw`\lambda L`)}` },
                { tex: String.raw`x=\dfrac{${k === 1 ? '' : k}\lambda L}{d}`, mistake: 'dark-as-bright' },
                { tex: String.raw`x=\dfrac{${2 * k + 1}\lambda L}{2d}`, mistake: 'dark-off-by-one' },
                { tex: String.raw`x=${frac(String.raw`\lambda d`).replace('2d', '2L')}`, mistake: 'lambda-L-swapped' },
              ],
            },
          ],
        },
        {
          label: 'ข',
          ask: String.raw`ถ้าเลื่อนฉากรับแสงให้ห่างออกไปจากตำแหน่งเดิมเป็นระยะ $\Delta L$ ดังรูป (B) ระยะ $x$ ในข้อ ก. จะเพิ่มขึ้นเท่าใด`,
          boxes: [
            {
              kind: 'choice',
              label: String.raw`$\Delta x$`,
              options: [
                { tex: String.raw`\Delta x=${frac(String.raw`\lambda\,\Delta L`)}` },
                { tex: String.raw`\Delta x=${frac(String.raw`\lambda(L+\Delta L)`)}`, mistake: 'gave-new-x' },
                { tex: String.raw`\Delta x=\dfrac{${k === 1 ? '' : k}\lambda\,\Delta L}{d}`, mistake: 'dark-as-bright' },
                { tex: String.raw`\Delta x=\dfrac{${c}\lambda d}{2\,\Delta L}`, mistake: 'lambda-L-swapped' },
              ],
            },
          ],
        },
        {
          label: 'ค',
          ask: 'จากข้อ ข. ถ้าต้องการให้ระยะ $x$ เท่าเดิมกับข้อ ก. โดยเปลี่ยนความยาวคลื่น จงหาอัตราส่วนของความยาวคลื่นใหม่ต่อความยาวคลื่นเดิม',
          boxes: [
            {
              kind: 'choice',
              label: String.raw`$\lambda_2/\lambda_1$`,
              options: [
                { tex: String.raw`\dfrac{\lambda_2}{\lambda_1}=\dfrac{L}{L+\Delta L}` },
                { tex: String.raw`\dfrac{\lambda_2}{\lambda_1}=\dfrac{L+\Delta L}{L}`, mistake: 'ratio-inverted' },
                { tex: String.raw`\dfrac{\lambda_2}{\lambda_1}=\dfrac{\Delta L}{L}` },
                { tex: String.raw`\dfrac{\lambda_2}{\lambda_1}=\dfrac{L}{\Delta L}` },
              ],
            },
          ],
        },
      ],
      hints: [
        String.raw`ผลต่างระยะทาง $\approx d\dfrac{x}{L}$ (มุมเล็ก) แถบมืดเมื่อเท่ากับ $\left(m+\tfrac12\right)\lambda$`,
        k === 1 ? 'แถบมืดแถบแรกคือ $m=0$' : String.raw`${darkName(k)}คือ $m=${k - 1}$`,
        String.raw`ข้อ ข. แทน $L$ ด้วย $L+\Delta L$ แล้วลบค่าเดิม ข้อ ค. ให้ $x$ เท่าเดิม แก้หา $\lambda$`,
      ],
      solution: [
        String.raw`ก. $d\dfrac{x}{L}=\left(${k - 1}+\tfrac12\right)\lambda$ จึงได้ $x=${frac(String.raw`\lambda L`)}$`,
        String.raw`ข. $x+\Delta x=${frac(String.raw`\lambda(L+\Delta L)`)}=${frac(String.raw`\lambda L`)}+${frac(String.raw`\lambda\Delta L`)}$ จึงได้ $\Delta x=${frac(String.raw`\lambda\Delta L`)}$`,
        String.raw`ค. จากข้อ ก. $\lambda_1=\dfrac{2dx}{${c}L}$ และ $\lambda_2=\dfrac{2dx}{${c}(L+\Delta L)}$`,
        String.raw`$\dfrac{\lambda_2}{\lambda_1}=\dfrac{L}{L+\Delta L}=\left(1+\dfrac{\Delta L}{L}\right)^{-1}$`,
      ],
    };
  },
});

// ------------------------------------------------------------- Q32
// Double slit with numbers: find L from the m-th bright fringe, then the
// intensity at another point as a fraction of I_max.

interface Q32 {
  /** wavelength, nm */
  lamNm: number;
  /** slit separation, m */
  d: number;
  /** which bright fringe is given */
  m: number;
  /** its distance from the centre, m */
  ym: number;
  /** the point asked about, m */
  y: number;
}

const q32 = defineQuestion<Q32>({
  q: 32,
  chapter: 'light',
  title: 'การแทรกสอดสองสลิต (600 nm)',
  idea: 'หา $L$ จากแถบสว่างที่ $m$ ก่อน แล้ว $I=I_{max}\\cos^2(\\pi dy/\\lambda L)$ (เรเดียน)',
  lesson: '#/light/l-double',
  sheet: [
    String.raw`y_{\text{bright}}=\dfrac{\lambda L}{d}m`,
    String.raw`\phi=\dfrac{2\pi}{\lambda}d\sin\theta`,
    String.raw`I=I_{max}\cos^2\dfrac{\phi}{2}`,
  ],
  notOnSheet: ['มุมเล็ก $\\sin\\theta\\approx y/L$ จึงได้ $\\phi/2=\\pi dy/\\lambda L$', 'มุมใน $\\cos^2$ เป็นเรเดียน'],
  original: { lamNm: 600, d: 6.4e-4, m: 2, ym: 3.6e-3, y: 3.4e-3 },
  random: (rng) => {
    const lamNm = pick(rng, [450, 500, 550, 600, 650]);
    const d = pick(rng, [3.2, 4.0, 5.0, 6.4, 8.0]) * 1e-4;
    const m = pick(rng, [1, 2, 3]);
    const L = pick(rng, [1.2, 1.5, 1.8, 2.0, 2.4]);
    const ym = Number(P.brightY(m, lamNm * 1e-9, L, d).toPrecision(3));
    // a point a bit off a fringe so the answer is neither 0 nor 1
    const y = Number((ym * pick(rng, [0.8, 0.85, 0.9, 0.94, 1.06, 1.1, 1.2])).toPrecision(3));
    return { lamNm, d, m, ym, y };
  },
  build: ({ lamNm, d, m, ym, y }) => {
    const lam = lamNm * 1e-9;
    const L = P.screenDistanceFromBright(ym, m, lam, d);
    const I = P.doubleSlitRatio(y, lam, L, d);
    const arg = (Math.PI * d * y) / (lam * L);
    return {
      prompt: String.raw`นิสิตฉายแสงความยาวคลื่น ${lamNm} นาโนเมตร ผ่านสลิตคู่ที่มีระยะห่างระหว่างสลิต $${s3(d)}$ เมตร เกิดริ้วการแทรกสอดบนฉาก โดยมีแถบสว่างที่ ${m} อยู่ห่างจากกึ่งกลางแถบสว่างกลางเป็นระยะ $${s3(ym)}$ เมตร บนฉาก จงหาว่าที่ตำแหน่ง $${s3(y)}$ เมตร จากกึ่งกลางแถบสว่างกลาง จะมีความเข้มเป็นกี่เท่าของค่าความเข้มสูงสุด กำหนดให้ ฉากอยู่ไกลจากสลิตมาก เมื่อเทียบกับระยะห่างระหว่างสลิต`,
      parts: [
        {
          label: '',
          ask: '',
          boxes: [
            {
              kind: 'number',
              label: '$I/I_{max}$',
              units: U.timesImax,
              answer: I,
              scale: 1,
              mistakes: [
                { id: 'degrees-not-radians', value: Math.cos((arg * Math.PI) / 180) ** 2 },
                { id: 'cos-not-squared', value: Math.abs(Math.cos(arg)) },
                { id: 'used-phi-not-half', value: Math.cos(2 * arg) ** 2 },
              ],
            },
          ],
        },
      ],
      hints: [
        String.raw`ยังไม่รู้ $L$: แถบสว่างที่ ${m} ให้ $d\dfrac{y_m}{L}=m\lambda$`,
        String.raw`$I=I_{max}\cos^2\left(\dfrac{\phi}{2}\right)$ โดย $\phi=\dfrac{2\pi}{\lambda}d\sin\theta\approx\dfrac{2\pi}{\lambda}\dfrac{dy}{L}$`,
        'มุมใน cos² เป็นเรเดียน',
      ],
      solution: [
        String.raw`$L=\dfrac{d\,y_m}{m\lambda}=\dfrac{(${s3(d)})(${s3(ym)})}{${m}(${lamNm}\times10^{-9})}=${tex(L)}$ m`,
        String.raw`$I=I_{max}\cos^2\left(\dfrac{\pi dy}{\lambda L}\right)=I_{max}\cos^2(${tex(arg)}\ \mathrm{rad})$`,
        String.raw`$=${tex(I)}\,I_{max}$`,
        String.raw`เช็ก: $\cos^2\left(\pi m\dfrac{y}{y_m}\right)=\cos^2\left(\pi\cdot${m}\cdot\dfrac{${s3(y)}}{${s3(ym)}}\right)$ ได้ค่าเดียวกัน`,
      ],
    };
  },
});

// ------------------------------------------------------------- Q33
// A beam through a plate of thickness d at incidence θi comes out a
// sideways distance x further on; find the time inside (in symbols).

interface Q33 {
  /** angle of incidence in degrees (60 in the worksheet) */
  inc: number;
}

/** Exact TeX for sin of the angles used. */
const sinTex: Record<number, string> = {
  30: String.raw`\dfrac{1}{2}`,
  45: String.raw`\dfrac{\sqrt2}{2}`,
  60: String.raw`\dfrac{\sqrt3}{2}`,
  37: String.raw`\dfrac{3}{5}`,
  53: String.raw`\dfrac{4}{5}`,
};

const q33 = defineQuestion<Q33>({
  q: 33,
  chapter: 'light',
  title: 'แสงผ่านแผ่นพลาสติก มุมตกกระทบ 60°',
  idea: 'หา $n$ จากสเนล ($\\sin\\theta=x/L$) ระยะทางในแผ่น $L=\\sqrt{d^2+x^2}$ อัตราเร็ว $v=c/n$ แล้ว $t=L/v$',
  lesson: '#/light/l-refraction',
  sheet: [String.raw`\dfrac{\sin\theta_2}{\sin\theta_1}=\dfrac{n_1}{n_2}=\dfrac{v_2}{v_1}`, String.raw`n=\dfrac{c}{v}`],
  notOnSheet: ['ระยะทางในแผ่น $L=\\sqrt{d^2+x^2}$ และ $\\sin\\theta=x/L$ (ตรีโกณ)', 'เวลา $t=$ ระยะทาง/อัตราเร็ว'],
  original: { inc: 60 },
  random: (rng) => ({ inc: pick(rng, [30, 37, 45, 53, 60]) }),
  build: ({ inc }) => {
    const s = sinTex[inc];
    return {
      prompt: String.raw`ยิงลำแสงผ่านแผ่นพลาสติกความหนาสม่ำเสมอ $d$ ด้วยมุมตกกระทบ $${inc}^\circ$ ในอากาศและพบว่าลำแสงผ่านออกจากแผ่นพลาสติกที่ตำแหน่งห่างจากแนวที่ลำแสงตกกระทบ $x$ ดังรูป จงหาเวลาที่แสงเดินทางภายในแผ่นพลาสติก`,
      figure: { id: 'q33', props: { inc } },
      parts: [
        {
          label: '',
          ask: '',
          boxes: [
            {
              kind: 'choice',
              label: 'เวลา $t$',
              options: [
                { tex: String.raw`t=\left(${s}\right)\dfrac{d^2+x^2}{cx}` },
                { tex: String.raw`t=\dfrac{\sqrt{d^2+x^2}}{c}`, mistake: 'speed-c-in-medium' },
                { tex: String.raw`t=\left(${s}\right)\dfrac{d\sqrt{d^2+x^2}}{cx}`, mistake: 'used-thickness' },
                { tex: String.raw`t=\dfrac{x}{\left(${s}\right)c}`, mistake: 'n-times-speed' },
              ],
            },
          ],
        },
      ],
      hints: [
        String.raw`ให้มุมหักเหในแผ่นเป็น $\theta$: สเนล $1\cdot\sin${inc}^\circ=n\sin\theta$`,
        String.raw`จากรูป ระยะทางในแผ่น $L=\sqrt{d^2+x^2}$ และ $\sin\theta=x/L$`,
        String.raw`$v=c/n$ แล้ว $t=L/v$`,
      ],
      solution: [
        String.raw`$n=\dfrac{\sin${inc}^\circ}{\sin\theta}$ และ $v=\dfrac{c}{n}$`,
        String.raw`$t=\dfrac{L}{v}=\dfrac{Ln}{c}=\dfrac{L\sin${inc}^\circ}{c\sin\theta}$`,
        String.raw`แทน $\sin\theta=x/L$: $t=\dfrac{L^2\sin${inc}^\circ}{cx}=\left(${s}\right)\dfrac{d^2+x^2}{cx}$`,
      ],
    };
  },
});

/** Chapter 6 worksheet questions. */
export const ch6Questions: Question[] = [q31, q32, q33];
