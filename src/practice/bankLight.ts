// =====================================================================
// Practice question generators for chapter 6 (light). Modelled on
// worksheet Q31–33 and the lecture examples (slides 9, 14, 15, 25, 26,
// 28, 34, 38–39, 42–43).
//
// Q31 and Q33 are answered with symbols in the worksheet; here their
// pieces come with numbers, and the symbolic versions live in the
// ตัวอย่างข้อสอบ tab (src/worksheet/ch6.ts).
// Every answer comes from src/physics/light.ts, with c = 3×10⁸ m/s.
// =====================================================================
import { fmt, tex } from '../lib/format';
import * as P from '../physics';
import { U, int, pick } from './common';
import type { Generator } from './common';

const C_TEX = String.raw`3\times10^{8}`;
const sinD = (d: number) => Math.sin((d * Math.PI) / 180);
const cosD = (d: number) => Math.cos((d * Math.PI) / 180);
const asinD = (s: number) => (Math.asin(s) * 180) / Math.PI;

/** Materials of the slide-6 table, as the questions name them. */
const mats = [
  { name: 'อากาศ', n: 1.0 },
  { name: 'น้ำ', n: 1.333 },
  { name: 'แก้ว', n: 1.52 },
  { name: 'แก้วฟลินต์', n: 1.66 },
  { name: 'เพชร', n: 2.419 },
];
const denser = mats.slice(1); // anything but air

/** "1.2\times10^{-3}" style, for lengths given in a prompt. */
const sci = (x: number) => tex(x, 3);

export const lightGenerators: Generator[] = [
  // ================================================== refraction
  {
    id: 'snell-angle',
    skill: 'refraction',
    title: 'กฎของสเนล: มุมหักเห',
    make: (rng) => {
      const m2 = pick(rng, denser);
      const th1 = pick(rng, [20, 30, 37, 45, 53, 60, 70]);
      const fromSurface = rng() < 0.35; // give the angle to the surface instead of the normal
      const given = fromSurface ? 90 - th1 : th1;
      const th2 = P.snellDeg(1, th1, m2.n)!;
      return {
        prompt: String.raw`แสงเดินทางจากอากาศเข้าสู่${m2.name} ($n=${m2.n}$) โดยลำแสงทำมุม ${given}° กับ${fromSurface ? 'ผิวรอยต่อ' : 'เส้นปกติ'} จงหามุมหักเห (วัดจากเส้นปกติ)`,
        units: U.degree,
        answer: th2,
        scale: th2,
        mistakes: [
          ...(fromSurface ? [{ id: 'angle-from-surface', value: P.snellDeg(1, given, m2.n)! }] : []),
          ...(m2.n * sinD(th1) <= 1 ? [{ id: 'snell-inverted', value: asinD(m2.n * sinD(th1)) }] : []),
        ],
        hints: [
          fromSurface ? String.raw`มุมกับผิว ${given}° แปลงเป็นมุมกับเส้นปกติ: $\theta_1=90^\circ-${given}^\circ=${th1}^\circ$` : String.raw`$\theta_1=${th1}^\circ$ วัดจากเส้นปกติอยู่แล้ว`,
          String.raw`$n_1\sin\theta_1=n_2\sin\theta_2$ โดย $n_1=1$`,
        ],
        solution: [
          String.raw`$\sin\theta_2=\dfrac{\sin${th1}^\circ}{${m2.n}}=${tex(sinD(th1) / m2.n)}$`,
          String.raw`$\theta_2=${tex(th2)}^\circ$`,
        ],
      };
    },
  },
  {
    id: 'speed-wavelength-medium',
    skill: 'refraction',
    title: 'อัตราเร็วและความยาวคลื่นในตัวกลาง',
    make: (rng) => {
      const m = pick(rng, denser);
      const lamNm = pick(rng, [450, 500, 550, 589, 600, 633, 650]);
      const askSpeed = rng() < 0.5;
      const v = P.speedFromIndex(m.n);
      const lamN = P.wavelengthInMedium(lamNm * 1e-9, m.n);
      return {
        prompt: String.raw`แสงความยาวคลื่น ${lamNm} nm (ในสุญญากาศ) เดินทางเข้าไปใน${m.name} ซึ่งมีดัชนีหักเห ${m.n} จงหา${askSpeed ? 'อัตราเร็วของแสงใน' + m.name : 'ความยาวคลื่นของแสงใน' + m.name}`,
        units: askSpeed ? U.speed : U.wavelength,
        answer: askSpeed ? v : lamN,
        scale: askSpeed ? v : lamN,
        mistakes: askSpeed ? [{ id: 'n-times-speed', value: P.C_LIGHT * m.n }] : [{ id: 'lambda-n-times', value: lamNm * 1e-9 * m.n }],
        hints: [askSpeed ? String.raw`$n=\dfrac{c}{v}$` : String.raw`ความถี่ไม่เปลี่ยน $n=\dfrac{\lambda}{\lambda_n}$`],
        solution: [
          askSpeed
            ? String.raw`$v=\dfrac{c}{n}=\dfrac{${C_TEX}}{${m.n}}=${tex(v)}$ m/s`
            : String.raw`$\lambda_n=\dfrac{\lambda}{n}=\dfrac{${lamNm}}{${m.n}}=${fmt(lamN * 1e9)}$ nm`,
        ],
      };
    },
  },
  {
    id: 'critical-angle',
    skill: 'refraction',
    title: 'มุมวิกฤต',
    make: (rng) => {
      const m1 = pick(rng, denser.slice(1)); // glass or denser
      const m2 = pick(rng, [mats[0], mats[1]].filter((x) => x.n < m1.n));
      const thc = P.criticalAngleDeg(m1.n, m2.n)!;
      return {
        prompt: String.raw`แสงเดินทางจาก${m1.name} ($n=${m1.n}$) ไปยัง${m2.name} ($n=${m2.n}$) จงหามุมวิกฤต`,
        units: U.degree,
        answer: thc,
        scale: thc,
        mistakes: [{ id: 'tan-for-critical', value: (Math.atan(m2.n / m1.n) * 180) / Math.PI }],
        hints: [String.raw`ที่มุมวิกฤต มุมหักเห $\theta_2=90^\circ$: $n_1\sin\theta_c=n_2\sin90^\circ$`],
        solution: [String.raw`$\sin\theta_c=\dfrac{n_2}{n_1}=\dfrac{${m2.n}}{${m1.n}}=${tex(m2.n / m1.n)}$ จึงได้ $\theta_c=${tex(thc)}^\circ$`],
      };
    },
  },
  {
    id: 'tank-depth',
    skill: 'refraction',
    title: 'ถังน้ำที่แสงอาทิตย์ส่องไม่ถึงก้น (สไลด์ 9)',
    make: (rng) => {
      const D = pick(rng, [1, 1.5, 2, 2.5, 3, 4]);
      const elev = pick(rng, [20, 25, 28, 30, 35, 40]);
      const h = P.tankMinDepth(D, elev, 1.333);
      const th2 = P.snellDeg(1, 90 - elev, 1.333)!;
      return {
        prompt: String.raw`ถังน้ำทรงกระบอกมีเส้นผ่านศูนย์กลาง ${D} m บรรจุน้ำเต็มถัง ขณะที่ดวงอาทิตย์ทำมุม ${elev}° เหนือระดับขอบฟ้า แสงอาทิตย์ส่องไปไม่ถึงก้นถัง จงหาความลึกถังน้ำที่น้อยที่สุด ($n_{\text{น้ำ}}=1.333$)`,
        units: U.length,
        answer: h,
        scale: h,
        mistakes: [
          { id: 'tank-tan-inverted', value: D * Math.tan((th2 * Math.PI) / 180) },
          { id: 'angle-from-surface', value: D / Math.tan((P.snellDeg(1, elev, 1.333)! * Math.PI) / 180) },
        ],
        hints: [
          String.raw`มุมตกกระทบวัดจากเส้นปกติ (แนวตั้ง): $\theta_1=90^\circ-${elev}^\circ$`,
          String.raw`รังสีที่เข้าที่ขอบถังชนมุมก้นอีกด้านพอดี: $\tan\theta_2=D/h$`,
        ],
        solution: [
          String.raw`$\sin\theta_2=\dfrac{\sin${90 - elev}^\circ}{1.333}$ จึงได้ $\theta_2=${tex(th2)}^\circ$`,
          String.raw`$h=\dfrac{D}{\tan\theta_2}=\dfrac{${D}}{\tan${tex(th2)}^\circ}=${tex(h)}$ m`,
        ],
      };
    },
  },
  {
    id: 'q33-time',
    skill: 'refraction',
    title: 'เวลาที่แสงเดินทางในแผ่นพลาสติก (ตัวเลข)',
    make: (rng) => {
      const inc = pick(rng, [30, 45, 60]);
      const dMm = pick(rng, [2, 3, 4, 5, 6, 8, 10]);
      const n = pick(rng, [1.4, 1.45, 1.5, 1.6]);
      const th = asinD(sinD(inc) / n);
      const xMm = Number((dMm * Math.tan((th * Math.PI) / 180)).toFixed(2));
      const d = dMm * 1e-3;
      const x = xMm * 1e-3;
      const t = P.plateTime(d, x, inc);
      const L = Math.hypot(d, x);
      const nn = P.plateIndex(d, x, inc);
      return {
        prompt: String.raw`ยิงลำแสงผ่านแผ่นพลาสติกความหนาสม่ำเสมอ ${dMm} mm ด้วยมุมตกกระทบ ${inc}° ในอากาศ พบว่าลำแสงผ่านออกจากแผ่นที่ตำแหน่งห่างจากแนวที่ลำแสงตกกระทบ ${xMm} mm จงหาเวลาที่แสงเดินทางภายในแผ่นพลาสติก`,
        units: U.timeShort,
        answer: t,
        scale: t,
        mistakes: [
          { id: 'speed-c-in-medium', value: L / P.C_LIGHT },
          { id: 'used-thickness', value: (d * nn) / P.C_LIGHT },
        ],
        hints: [
          String.raw`ระยะทางในแผ่น $L=\sqrt{d^2+x^2}$ และมุมหักเห $\sin\theta=x/L$`,
          String.raw`$n=\dfrac{\sin${inc}^\circ}{\sin\theta}$ แล้ว $v=c/n$`,
          String.raw`$t=\dfrac{L}{v}=\dfrac{L^2\sin${inc}^\circ}{cx}$`,
        ],
        solution: [
          String.raw`$L=\sqrt{(${dMm})^2+(${xMm})^2}=${fmt(L * 1e3)}$ mm, $n=\dfrac{\sin${inc}^\circ}{${fmt(xMm)}/${fmt(L * 1e3)}}=${tex(nn)}$`,
          String.raw`$t=\dfrac{Ln}{c}=\dfrac{(${tex(L)})(${tex(nn)})}{${C_TEX}}=${tex(t)}$ s`,
        ],
      };
    },
  },
  {
    id: 'q33-index',
    skill: 'refraction',
    title: 'ดัชนีหักเหของแผ่นพลาสติกจากระยะ x',
    make: (rng) => {
      const inc = pick(rng, [30, 45, 60]);
      const dMm = pick(rng, [2, 4, 5, 8, 10]);
      const xMm = Number((dMm * pick(rng, [0.4, 0.5, 0.6, 0.7])).toFixed(1));
      const n = P.plateIndex(dMm, xMm, inc);
      return {
        prompt: String.raw`ลำแสงในอากาศตกกระทบแผ่นพลาสติกหนา ${dMm} mm ด้วยมุมตกกระทบ ${inc}° แล้วออกจากแผ่นที่ตำแหน่งห่างจากแนวที่ลำแสงตกกระทบ ${xMm} mm จงหาดัชนีหักเหของพลาสติก`,
        units: U.ratio,
        answer: n,
        scale: n,
        mistakes: [{ id: 'snell-inverted', value: 1 / n }],
        hints: [String.raw`มุมหักเห $\theta$: $\sin\theta=\dfrac{x}{\sqrt{d^2+x^2}}$`, String.raw`สเนล: $1\cdot\sin${inc}^\circ=n\sin\theta$`],
        solution: [
          String.raw`$\sin\theta=\dfrac{${xMm}}{\sqrt{${dMm}^2+${xMm}^2}}=${tex(xMm / Math.hypot(dMm, xMm))}$`,
          String.raw`$n=\dfrac{\sin${inc}^\circ}{\sin\theta}=${tex(n)}$`,
        ],
      };
    },
  },

  // ================================================== double slit
  {
    id: 'ds-bright',
    skill: 'interference',
    title: 'ตำแหน่งแถบสว่างที่ m',
    make: (rng) => {
      const lamNm = pick(rng, [450, 500, 550, 600, 650]);
      const dMm = pick(rng, [0.2, 0.25, 0.4, 0.5, 0.8, 1.0]);
      const L = pick(rng, [1, 1.5, 2, 2.5, 3]);
      const m = int(rng, 1, 4);
      const y = P.brightY(m, lamNm * 1e-9, L, dMm * 1e-3);
      return {
        prompt: String.raw`แสงความยาวคลื่น ${lamNm} nm ผ่านสลิตคู่ที่ห่างกัน ${dMm} mm ไปตกบนฉากที่ห่างออกไป ${L} m จงหาระยะจากกึ่งกลางแถบสว่างกลางถึงแถบสว่างที่ ${m}`,
        units: U.lengthSmall,
        answer: y,
        scale: y,
        mistakes: [
          { id: 'bright-as-dark', value: P.darkY(m, lamNm * 1e-9, L, dMm * 1e-3) },
          { id: 'lambda-L-swapped', value: (m * lamNm * 1e-9 * dMm * 1e-3) / L },
        ],
        hints: [String.raw`$y_{bright}=\dfrac{\lambda L}{d}m$ (แถบสว่างกลางคือ $m=0$)`],
        solution: [String.raw`$y=\dfrac{(${lamNm}\times10^{-9})(${L})}{${dMm}\times10^{-3}}(${m})=${tex(y)}$ m`],
      };
    },
  },
  {
    id: 'ds-dark',
    skill: 'interference',
    title: 'ตำแหน่งแถบมืดที่ k',
    make: (rng) => {
      const lamNm = pick(rng, [450, 500, 550, 600, 650]);
      const dMm = pick(rng, [0.2, 0.25, 0.4, 0.5, 0.8]);
      const L = pick(rng, [1, 1.5, 2, 3]);
      const k = int(rng, 1, 3);
      const y = P.darkY(k - 1, lamNm * 1e-9, L, dMm * 1e-3);
      return {
        prompt: String.raw`แสงความยาวคลื่น ${lamNm} nm ผ่านสลิตคู่ที่ห่างกัน ${dMm} mm ฉากห่างออกไป ${L} m จงหาระยะจากกึ่งกลางแถบสว่างกลางถึงกึ่งกลางแถบมืดแถบที่ ${k}`,
        units: U.lengthSmall,
        answer: y,
        scale: y,
        mistakes: [
          { id: 'dark-off-by-one', value: P.darkY(k, lamNm * 1e-9, L, dMm * 1e-3) },
          { id: 'dark-as-bright', value: P.brightY(k, lamNm * 1e-9, L, dMm * 1e-3) },
        ],
        hints: [String.raw`$y_{dark}=\dfrac{\lambda L}{d}\left(m+\tfrac12\right)$ แถบมืดแรกคือ $m=0$ แถบมืดที่ ${k} จึงใช้ $m=${k - 1}$`],
        solution: [String.raw`$y=\dfrac{(${lamNm}\times10^{-9})(${L})}{${dMm}\times10^{-3}}\left(${k - 1}+\tfrac12\right)=${tex(y)}$ m`],
      };
    },
  },
  {
    id: 'ds-lambda-from-spacing',
    skill: 'interference',
    title: 'หาความยาวคลื่นจากระยะห่างแถบ',
    make: (rng) => {
      const lamNm = pick(rng, [450, 480, 500, 550, 589, 600, 633]);
      const dMm = pick(rng, [0.2, 0.3, 0.5, 1.0]);
      const L = pick(rng, [1, 1.5, 2, 2.5]);
      const dyMm = Number((P.fringeSpacing(lamNm * 1e-9, L, dMm * 1e-3) * 1e3).toPrecision(3));
      const lam = (dyMm * 1e-3 * dMm * 1e-3) / L;
      return {
        prompt: String.raw`ในการทดลองสลิตคู่ สลิตห่างกัน ${dMm} mm ฉากห่าง ${L} m วัดระยะระหว่างแถบสว่างที่อยู่ติดกันได้ ${dyMm} mm จงหาความยาวคลื่นของแสง`,
        units: U.wavelength,
        answer: lam,
        scale: lam,
        mistakes: [{ id: 'lambda-L-swapped', value: (dyMm * 1e-3 * L) / (dMm * 1e-3) }],
        hints: [String.raw`ระยะห่างระหว่างแถบที่ติดกัน $\Delta y=\dfrac{\lambda L}{d}$`],
        solution: [String.raw`$\lambda=\dfrac{\Delta y\,d}{L}=\dfrac{(${dyMm}\times10^{-3})(${dMm}\times10^{-3})}{${L}}=${fmt(lam * 1e9)}$ nm`],
      };
    },
  },
  {
    id: 'q31-x',
    skill: 'interference',
    title: 'ระยะ x ถึงแถบมืดแถบแรก (ข้อ 31 ก แบบตัวเลข)',
    make: (rng) => {
      const lamNm = pick(rng, [450, 500, 550, 600, 650]);
      const dMm = pick(rng, [0.2, 0.25, 0.4, 0.5]);
      const L = pick(rng, [1, 1.5, 2, 2.5]);
      const x = P.darkY(0, lamNm * 1e-9, L, dMm * 1e-3);
      return {
        prompt: String.raw`แสงเอกรงค์ความยาวคลื่น ${lamNm} nm ผ่านสลิตคู่ที่ห่างกัน ${dMm} mm ไปแทรกสอดบนฉากที่ห่างออกไป ${L} m ให้ $x$ คือระยะระหว่างจุดกึ่งกลางของแถบมืดแถบแรกกับจุดกึ่งกลางของแถบสว่างกลาง จงหาค่า $x$`,
        units: U.lengthSmall,
        answer: x,
        scale: x,
        mistakes: [
          { id: 'dark-as-bright', value: 2 * x },
          { id: 'dark-off-by-one', value: 3 * x },
        ],
        hints: [String.raw`แถบมืด: $d\dfrac{x}{L}=\left(m+\tfrac12\right)\lambda$ แถบแรกคือ $m=0$`],
        solution: [String.raw`$x=\dfrac{\lambda L}{2d}=\dfrac{(${lamNm}\times10^{-9})(${L})}{2(${dMm}\times10^{-3})}=${tex(x)}$ m`],
      };
    },
  },
  {
    id: 'q31-dx',
    skill: 'interference',
    title: 'เลื่อนฉากออกไป ΔL: x เพิ่มขึ้นเท่าใด (ข้อ 31 ข แบบตัวเลข)',
    make: (rng) => {
      const lamNm = pick(rng, [450, 500, 550, 600, 650]);
      const dMm = pick(rng, [0.2, 0.25, 0.4, 0.5]);
      const L = pick(rng, [1, 1.5, 2]);
      const dLcm = pick(rng, [10, 20, 25, 40, 50]);
      const dL = dLcm / 100;
      const dx = P.darkY(0, lamNm * 1e-9, L + dL, dMm * 1e-3) - P.darkY(0, lamNm * 1e-9, L, dMm * 1e-3);
      return {
        prompt: String.raw`แสงความยาวคลื่น ${lamNm} nm ผ่านสลิตคู่ที่ห่างกัน ${dMm} mm ฉากอยู่ห่าง ${L} m ถ้าเลื่อนฉากให้ห่างออกไปจากตำแหน่งเดิมอีก ${dLcm} cm ระยะจากแถบสว่างกลางถึงแถบมืดแถบแรกจะเพิ่มขึ้นเท่าใด`,
        units: U.lengthSmall,
        answer: dx,
        scale: dx,
        mistakes: [
          { id: 'gave-new-x', value: P.darkY(0, lamNm * 1e-9, L + dL, dMm * 1e-3) },
          { id: 'dark-as-bright', value: 2 * dx },
        ],
        hints: [String.raw`$x=\dfrac{\lambda L}{2d}$ แทน $L$ ด้วย $L+\Delta L$ แล้วลบค่าเดิม`],
        solution: [String.raw`$\Delta x=\dfrac{\lambda\,\Delta L}{2d}=\dfrac{(${lamNm}\times10^{-9})(${dL})}{2(${dMm}\times10^{-3})}=${tex(dx)}$ m`],
      };
    },
  },
  {
    id: 'q31-ratio',
    skill: 'interference',
    title: 'ความยาวคลื่นใหม่ที่ทำให้ x เท่าเดิม (ข้อ 31 ค แบบตัวเลข)',
    make: (rng) => {
      const L = pick(rng, [1, 1.2, 1.5, 2]);
      const dLcm = pick(rng, [10, 20, 25, 30, 50]);
      const ratio = L / (L + dLcm / 100);
      return {
        prompt: String.raw`ในการทดลองสลิตคู่ ฉากอยู่ห่างจากสลิต ${L} m ถ้าเลื่อนฉากออกไปอีก ${dLcm} cm แล้วต้องการให้ระยะจากแถบสว่างกลางถึงแถบมืดแถบแรกเท่าเดิม โดยเปลี่ยนความยาวคลื่น จงหาอัตราส่วนของความยาวคลื่นใหม่ต่อความยาวคลื่นเดิม`,
        units: U.ratio,
        answer: ratio,
        scale: ratio,
        mistakes: [{ id: 'ratio-inverted', value: 1 / ratio }],
        hints: [String.raw`$x=\dfrac{\lambda L}{2d}$ คงที่ จึงได้ $\lambda L$ คงที่: $\lambda_2(L+\Delta L)=\lambda_1L$`],
        solution: [String.raw`$\dfrac{\lambda_2}{\lambda_1}=\dfrac{L}{L+\Delta L}=\dfrac{${L}}{${L}+${dLcm / 100}}=${tex(ratio)}$`],
      };
    },
  },
  {
    id: 'q32-L',
    skill: 'interference',
    title: 'หาระยะถึงฉากจากแถบสว่างที่ m (ข้อ 32 ขั้นแรก)',
    make: (rng) => {
      const lamNm = pick(rng, [450, 500, 550, 600, 650]);
      const d = pick(rng, [3.2, 4.0, 5.0, 6.4, 8.0]) * 1e-4;
      const m = int(rng, 1, 3);
      const ym = Number((P.brightY(m, lamNm * 1e-9, pick(rng, [1, 1.5, 1.92, 2, 2.5]), d)).toPrecision(3));
      const L = P.screenDistanceFromBright(ym, m, lamNm * 1e-9, d);
      return {
        prompt: String.raw`แสงความยาวคลื่น ${lamNm} nm ผ่านสลิตคู่ที่ห่างกัน $${sci(d)}$ m แถบสว่างที่ ${m} อยู่ห่างจากกึ่งกลางแถบสว่างกลาง $${sci(ym)}$ m บนฉาก จงหาระยะจากสลิตถึงฉาก`,
        units: U.length,
        answer: L,
        scale: L,
        mistakes: [{ id: 'bright-as-dark', value: (d * ym) / ((m + 0.5) * lamNm * 1e-9) }],
        hints: [String.raw`แถบสว่าง $d\dfrac{y_m}{L}=m\lambda$ จึงได้ $L=\dfrac{d\,y_m}{m\lambda}$`],
        solution: [String.raw`$L=\dfrac{(${sci(d)})(${sci(ym)})}{${m}(${lamNm}\times10^{-9})}=${tex(L)}$ m`],
      };
    },
  },
  {
    id: 'q32-intensity',
    skill: 'interference',
    title: 'ความเข้มที่ตำแหน่ง y เทียบกับค่าสูงสุด (ข้อ 32)',
    make: (rng) => {
      const lamNm = pick(rng, [500, 550, 600, 650]);
      const d = pick(rng, [4.0, 5.0, 6.4]) * 1e-4;
      const L = pick(rng, [1.2, 1.5, 1.92, 2]);
      const fringe = P.fringeSpacing(lamNm * 1e-9, L, d);
      const y = Number((fringe * pick(rng, [0.3, 0.6, 0.8, 1.15, 1.4, 1.7, 1.9])).toPrecision(3));
      const I = P.doubleSlitRatio(y, lamNm * 1e-9, L, d);
      const arg = (Math.PI * d * y) / (lamNm * 1e-9 * L);
      return {
        prompt: String.raw`แสงความยาวคลื่น ${lamNm} nm ผ่านสลิตคู่ที่ห่างกัน $${sci(d)}$ m ฉากห่างออกไป ${L} m ที่ตำแหน่ง $${sci(y)}$ m จากกึ่งกลางแถบสว่างกลาง ความเข้มเป็นกี่เท่าของค่าความเข้มสูงสุด`,
        units: U.timesImax,
        answer: I,
        scale: 1,
        mistakes: [
          { id: 'degrees-not-radians', value: Math.cos((arg * Math.PI) / 180) ** 2 },
          { id: 'cos-not-squared', value: Math.abs(Math.cos(arg)) },
          { id: 'used-phi-not-half', value: Math.cos(2 * arg) ** 2 },
        ],
        hints: [
          String.raw`$I=I_{max}\cos^2\left(\dfrac{\pi dy}{\lambda L}\right)$ (มุมมุมนี้เป็นเรเดียน)`,
          String.raw`$\dfrac{\pi dy}{\lambda L}=${tex(arg)}$ rad`,
        ],
        solution: [String.raw`$\dfrac{I}{I_{max}}=\cos^2(${tex(arg)}\ \mathrm{rad})=${tex(I)}$`],
      };
    },
  },
  {
    id: 'ds-intensity-position',
    skill: 'interference',
    title: 'ตำแหน่งที่ความเข้มเป็นสัดส่วนที่กำหนด (สไลด์ 15)',
    make: (rng) => {
      const f = pick(rng, [
        { v: 0.75, t: '3/4' },
        { v: 0.5, t: '1/2' },
        { v: 0.25, t: '1/4' },
      ]);
      const lamNm = pick(rng, [500, 550, 600, 650]);
      const dMm = pick(rng, [1, 2, 3]);
      const L = pick(rng, [1, 1.5, 2]);
      const y = P.yAtIntensity(f.v, lamNm * 1e-9, L, dMm * 1e-3);
      return {
        prompt: String.raw`จงหาตำแหน่งที่ห่างจากตำแหน่งกลางน้อยสุดบนฉากที่มีความเข้มแสงเป็น ${f.t} เท่าของค่าความเข้มแสงสูงสุด (กำหนดให้ $\lambda=${lamNm}$ nm, $d=${dMm}$ mm, $L=${L}$ m)`,
        units: U.lengthSmall,
        answer: y,
        scale: y,
        mistakes: [{ id: 'used-phi-not-half', value: y / 2 }],
        hints: [
          String.raw`$\cos^2\left(\dfrac{\pi dy}{\lambda L}\right)=${f.t}$`,
          String.raw`$\dfrac{\pi dy}{\lambda L}=\cos^{-1}\sqrt{${f.t}}=${tex(Math.acos(Math.sqrt(f.v)))}$ rad`,
        ],
        solution: [String.raw`$y=\dfrac{\lambda L}{\pi d}\cos^{-1}\sqrt{${f.t}}=${tex(y)}$ m`],
      };
    },
  },
  {
    id: 'ds-dark-matches-bright',
    skill: 'interference',
    title: 'แถบมืดของแสงใหม่ตรงกับแถบสว่างเดิม (สไลด์ 14)',
    make: (rng) => {
      let lamNm = 0;
      let m = 0;
      let k = 0;
      let lam2 = 0;
      // pick again until λ′ is near the visible range (slide 14 itself gives 1200 nm, infrared)
      do {
        lamNm = pick(rng, [400, 450, 500, 550, 600]);
        m = int(rng, 1, 3);
        k = int(rng, 1, 3);
        lam2 = (m * lamNm) / (k - 0.5);
      } while (lam2 < 350 || lam2 > 1300);
      return {
        prompt: String.raw`แสงความยาวคลื่น ${lamNm} nm ผ่านสลิตคู่ แล้วเกิดแถบสว่างที่ ${m} ที่ตำแหน่งหนึ่งบนฉาก จงหาว่าแสงความยาวคลื่นเท่าใดที่ทำให้เกิดแถบมืดที่ ${k} ณ ตำแหน่งเดียวกันบนฉาก`,
        units: U.wavelength,
        answer: lam2 * 1e-9,
        scale: lam2 * 1e-9,
        mistakes: [
          { id: 'dark-off-by-one', value: ((m * lamNm) / (k + 0.5)) * 1e-9 },
          ...(k !== m ? [{ id: 'dark-as-bright', value: ((m * lamNm) / k) * 1e-9 }] : []),
        ],
        hints: [String.raw`ตำแหน่งเดียวกัน: $\dfrac{\lambda L}{d}m=\dfrac{\lambda' L}{d}\left(m'+\tfrac12\right)$ แถบมืดที่ ${k} คือ $m'=${k - 1}$`, 'L และ d ตัดกันหมด'],
        solution: [String.raw`$\lambda'=\dfrac{m\lambda}{m'+\tfrac12}=\dfrac{${m}(${lamNm})}{${k - 0.5}}=${fmt(lam2)}$ nm`],
      };
    },
  },

  // ================================================== single slit, resolution, grating
  {
    id: 'ss-first-dark',
    skill: 'diffraction',
    title: 'ตำแหน่งแถบมืดลำดับที่ 1 ของสลิตเดี่ยว (สไลด์ 26)',
    make: (rng) => {
      const lamNm = pick(rng, [450, 500, 550, 580, 600, 650]);
      const aMm = pick(rng, [0.1, 0.2, 0.3, 0.4, 0.5]);
      const D = pick(rng, [1, 1.5, 2, 3]);
      const m = int(rng, 1, 2);
      const y = P.singleSlitDarkY(m, lamNm * 1e-9, D, aMm * 1e-3);
      return {
        prompt: String.raw`แสง ($\lambda=${lamNm}$ nm) ตกกระทบสลิตกว้าง ${aMm} mm จงหาตำแหน่งของแถบมืดลำดับที่ ${m} วัดจากกึ่งกลางแถบสว่างกลาง โดยที่ฉากอยู่ห่างจากสลิต $D=${D}$ m`,
        units: U.lengthSmall,
        answer: y,
        scale: y,
        mistakes: [
          ...(m === 1 ? [{ id: 'gave-full-width', value: 2 * y }] : []),
          { id: 'ss-no-half', value: ((m - 0.5) * lamNm * 1e-9 * D) / (aMm * 1e-3) },
        ],
        hints: [String.raw`สลิตเดี่ยว: $a\sin\theta_{dark}=m\lambda$ ($m=\pm1,\pm2,\dots$) และ $\sin\theta\approx y/D$`],
        solution: [String.raw`$y=\dfrac{m\lambda D}{a}=\dfrac{${m}(${lamNm}\times10^{-9})(${D})}{${aMm}\times10^{-3}}=${tex(y)}$ m`],
      };
    },
  },
  {
    id: 'ss-central-width',
    skill: 'diffraction',
    title: 'ความกว้างแถบสว่างกลางของสลิตเดี่ยว',
    make: (rng) => {
      const lamNm = pick(rng, [450, 500, 550, 580, 600, 650]);
      const aMm = pick(rng, [0.1, 0.2, 0.3, 0.5]);
      const D = pick(rng, [1, 1.5, 2, 3]);
      const w = P.centralWidth(lamNm * 1e-9, D, aMm * 1e-3);
      return {
        prompt: String.raw`แสงความยาวคลื่น ${lamNm} nm ตกกระทบสลิตเดี่ยวกว้าง ${aMm} mm ฉากอยู่ห่าง ${D} m จงหาความกว้างของแถบสว่างกลาง`,
        units: U.lengthSmall,
        answer: w,
        scale: w,
        mistakes: [{ id: 'gave-half-width', value: w / 2 }],
        hints: [String.raw`แถบสว่างกลางอยู่ระหว่างแถบมืด $m=-1$ กับ $m=+1$ แต่ละข้างห่างกลาง $\lambda D/a$`],
        solution: [String.raw`$w=\dfrac{2\lambda D}{a}=\dfrac{2(${lamNm}\times10^{-9})(${D})}{${aMm}\times10^{-3}}=${tex(w)}$ m`],
      };
    },
  },
  {
    id: 'ss-slit-width',
    skill: 'diffraction',
    title: 'หาความกว้างสลิตจากระยะห่างริ้วมืด (สไลด์ 25)',
    make: (rng) => {
      const lamNm = pick(rng, [500, 550, 600, 650]);
      const D = pick(rng, [1, 1.5, 2, 2.5]);
      const dyMm = pick(rng, [2, 2.5, 3, 4, 5]);
      const a = (lamNm * 1e-9 * D) / (dyMm * 1e-3);
      return {
        prompt: String.raw`แสงความยาวคลื่น ${lamNm} nm ตกกระทบสลิตเดี่ยวแล้วเกิดริ้วการเลี้ยวเบนบนฉากที่ห่างออกไป ${D} m พบว่าริ้วมืดที่อยู่ถัดกัน 2 ริ้ว (ด้านเดียวกันของแถบกลาง) ห่างกัน ${dyMm} mm จงหาความกว้างสลิต`,
        units: U.lengthSmall,
        answer: a,
        scale: a,
        mistakes: [
          { id: 'dark-spacing-double', value: 2 * a },
          { id: 'mm-not-converted', value: (lamNm * 1e-9 * D) / dyMm },
        ],
        hints: [String.raw`ริ้วมืดถัดกันห่างกัน $y_{m+1}-y_m=\dfrac{\lambda D}{a}$`],
        solution: [String.raw`$a=\dfrac{\lambda D}{\Delta y}=\dfrac{(${lamNm}\times10^{-9})(${D})}{${dyMm}\times10^{-3}}=${tex(a)}$ m`],
      };
    },
  },
  {
    id: 'rayleigh-circle',
    skill: 'diffraction',
    title: 'กำลังแยกของช่องกลม (เกณฑ์ของเรย์ลี)',
    make: (rng) => {
      const lamNm = pick(rng, [450, 500, 550, 600]);
      const Dmm = pick(rng, [2, 3, 5, 10, 50, 100]);
      const th = P.rayleighCircle(lamNm * 1e-9, Dmm * 1e-3);
      return {
        prompt: String.raw`แสงความยาวคลื่น ${lamNm} nm ผ่านช่องกลมเส้นผ่านศูนย์กลาง ${Dmm} mm จงหามุมที่เล็กที่สุดระหว่างแหล่งกำเนิดสองจุดที่ยังแยกได้ตามเกณฑ์ของเรย์ลี`,
        units: U.radian,
        answer: th,
        scale: th,
        mistakes: [{ id: 'no-1.22', value: P.rayleighSlit(lamNm * 1e-9, Dmm * 1e-3) }],
        hints: [String.raw`ช่องกลม: $\theta_R=\dfrac{1.22\lambda}{D}$ (เรเดียน)`],
        solution: [String.raw`$\theta_R=\dfrac{1.22(${lamNm}\times10^{-9})}{${Dmm}\times10^{-3}}=${tex(th)}$ rad`],
      };
    },
  },
  {
    id: 'grating-angle',
    skill: 'diffraction',
    title: 'มุมของแถบสว่างจากเกรตติง (สไลด์ 34)',
    make: (rng) => {
      const perMm = pick(rng, [100, 200, 300, 400, 500, 600]);
      const lamNm = pick(rng, [450, 500, 550, 589, 600, 650]);
      const d = 1e-3 / perMm;
      const maxM = P.gratingMaxOrder(lamNm * 1e-9, d);
      const m = Math.min(maxM, int(rng, 1, 2));
      const th = P.gratingAngleDeg(m, lamNm * 1e-9, d)!;
      return {
        prompt: String.raw`เกรตติงหนึ่งมี ${perMm} เส้นต่อมิลลิเมตร รับแสงความยาวคลื่น ${lamNm} nm จงหามุมที่เกิดความเข้มสูงสุดอันดับ ${m} (ด้านใดด้านหนึ่ง)`,
        units: U.degree,
        answer: th,
        scale: th,
        mistakes: [],
        hints: [
          String.raw`$d=\dfrac{1\ \mathrm{mm}}{${perMm}}=${tex(d)}$ m (ความยาว ÷ จำนวนเส้น)`,
          String.raw`$d\sin\theta=m\lambda$`,
        ],
        solution: [String.raw`$\sin\theta=\dfrac{${m}(${lamNm}\times10^{-9})}{${tex(d)}}=${tex((m * lamNm * 1e-9) / d)}$ จึงได้ $\theta=${tex(th)}^\circ$`],
      };
    },
  },
  {
    id: 'grating-max-order',
    skill: 'diffraction',
    title: 'ลำดับสูงสุดที่เห็นได้จากเกรตติง',
    make: (rng) => {
      let perMm = 0;
      let lamNm = 0;
      // pick again while d/λ is a whole number, so "round down" in the hint is always right
      do {
        perMm = pick(rng, [300, 400, 500, 600, 800]);
        lamNm = pick(rng, [450, 500, 550, 589, 600, 650, 700]);
      } while (Number.isInteger(1e6 / (perMm * lamNm)));
      const m = P.gratingMaxOrder(lamNm * 1e-9, 1e-3 / perMm);
      return {
        prompt: String.raw`เกรตติง ${perMm} เส้นต่อมิลลิเมตร รับแสง ${lamNm} nm ตั้งฉาก จะเห็นแถบสว่างได้ถึงอันดับ (m) สูงสุดเท่าใด`,
        units: [{ label: 'อันดับ', factor: 1 }],
        answer: m,
        scale: m,
        mistakes: [],
        hints: [String.raw`$\sin\theta\le1$ จึงได้ $m\le\dfrac{d}{\lambda}$ ปัดลงเป็นจำนวนเต็ม`],
        solution: [String.raw`$\dfrac{d}{\lambda}=\dfrac{${tex(1e-3 / perMm)}}{${lamNm}\times10^{-9}}=${tex(1e-3 / perMm / (lamNm * 1e-9))}$ จึงได้ $m_{max}=${m}$`],
      };
    },
  },

  // ================================================== polarization
  {
    id: 'malus-unpol-two',
    skill: 'polarization',
    title: 'แสงไม่โพลาไรซ์ผ่านแผ่นโพลารอยด์ 2 แผ่น',
    make: (rng) => {
      const th = pick(rng, [20, 30, 37, 45, 53, 60, 70]);
      const I = P.polarizerStack(1, [0, th], null)[1];
      return {
        prompt: String.raw`แสงไม่โพลาไรซ์ความเข้ม $I_0$ ผ่านแผ่นโพลารอยด์ 2 แผ่น ซึ่งแกนทำมุมกัน ${th}° ความเข้มของแสงที่ผ่านออกมาเป็นกี่เท่าของ $I_0$`,
        units: U.timesI0,
        answer: I,
        scale: 1,
        mistakes: [
          { id: 'unpol-no-half', value: cosD(th) ** 2 },
          { id: 'cos-not-squared', value: 0.5 * cosD(th) },
        ],
        hints: ['แผ่นแรก: แสงไม่โพลาไรซ์เหลือ $\\tfrac12I_0$', String.raw`แผ่นที่สอง: กฎของมาลุส $\cos^2${th}^\circ$`],
        solution: [String.raw`$I=\tfrac12I_0\cos^2${th}^\circ=${tex(I)}\,I_0$`],
      };
    },
  },
  {
    id: 'malus-three',
    skill: 'polarization',
    title: 'แสงโพลาไรซ์แนวตั้งผ่านแผ่นโพลารอยด์ 3 แผ่น (สไลด์ 38–39)',
    make: (rng) => {
      const t1 = pick(rng, [10, 20, 30]);
      const t2 = t1 + pick(rng, [15, 20, 30]);
      const t3 = t2 + pick(rng, [15, 20, 30]);
      const I = P.polarizerStack(1, [t1, t2, t3], 0)[2];
      return {
        prompt: String.raw`แผ่นโพลารอยด์ 3 แผ่นมีแกนทำมุมกับแนวตั้ง $\theta_1=${t1}^\circ$, $\theta_2=${t2}^\circ$, $\theta_3=${t3}^\circ$ แสงโพลาไรซ์ที่มีสนามไฟฟ้าในแนวตั้งความเข้ม $I_i$ ผ่านทั้งสามแผ่น ความเข้มหลังผ่านทั้งสามแผ่นเป็นกี่เท่าของ $I_i$`,
        units: [{ label: '× I_i', factor: 1 }],
        answer: I,
        scale: 1,
        mistakes: [
          { id: 'angle-from-vertical', value: cosD(t1) ** 2 * cosD(t2) ** 2 * cosD(t3) ** 2 },
          { id: 'unpol-no-half', value: I / 2 },
        ],
        hints: [
          String.raw`แผ่นแรก: มุมระหว่างสนาม (แนวตั้ง) กับแกน คือ $${t1}^\circ$`,
          String.raw`แผ่นต่อไปใช้มุม **ระหว่างแกนแผ่นนี้กับแผ่นก่อน**: $${t2 - t1}^\circ$ และ $${t3 - t2}^\circ$`,
        ],
        solution: [
          String.raw`$I_f=I_i\cos^2${t1}^\circ\cos^2${t2 - t1}^\circ\cos^2${t3 - t2}^\circ=${tex(I)}\,I_i$`,
        ],
      };
    },
  },
  {
    id: 'crossed-middle',
    skill: 'polarization',
    title: 'แผ่นกลางระหว่างโพลารอยด์ที่ตั้งฉากกัน',
    make: (rng) => {
      const th = pick(rng, [30, 45, 60]);
      const I = P.polarizerStack(1, [0, th, 90], null)[2];
      return {
        prompt: String.raw`แสงไม่โพลาไรซ์ความเข้ม $I_0$ ผ่านแผ่นโพลารอยด์ 2 แผ่นที่แกนตั้งฉากกัน (แสงไม่ผ่านเลย) ถ้าสอดแผ่นที่สามไว้ตรงกลาง โดยแกนทำมุม ${th}° กับแกนของแผ่นแรก ความเข้มที่ผ่านออกมาเป็นกี่เท่าของ $I_0$`,
        units: U.timesI0,
        answer: I,
        scale: 1,
        mistakes: [{ id: 'unpol-no-half', value: 2 * I }],
        hints: [String.raw`แผ่นแรก $\tfrac12I_0$ แผ่นกลาง $\cos^2${th}^\circ$ แผ่นสุดท้าย $\cos^2(90^\circ-${th}^\circ)$`],
        solution: [String.raw`$I=\tfrac12I_0\cos^2${th}^\circ\cos^2${90 - th}^\circ=${tex(I)}\,I_0$`],
      };
    },
  },
  {
    id: 'brewster-angle',
    skill: 'polarization',
    title: 'มุมบริวสเตอร์',
    make: (rng) => {
      const m = pick(rng, denser);
      const th = P.brewsterDeg(m.n);
      return {
        prompt: String.raw`แสงในอากาศตกกระทบผิว${m.name} ($n=${m.n}$) ที่มุมตกกระทบเท่าใด แสงสะท้อนจึงเป็นแสงโพลาไรซ์`,
        units: U.degree,
        answer: th,
        scale: th,
        mistakes: [{ id: 'brewster-sin', value: (Math.asin(1 / m.n) * 180) / Math.PI }],
        hints: [String.raw`กฎของบริวสเตอร์ $n=\tan\theta_p$ (รังสีสะท้อนตั้งฉากกับรังสีหักเห)`],
        solution: [String.raw`$\theta_p=\tan^{-1}(${m.n})=${tex(th)}^\circ$`],
      };
    },
  },
];
