// =====================================================================
// Practice question generators for chapter 3 (Biot–Savart, Ampère).
// Modelled on worksheet Q26–27 and the lecture examples (slides 5–25).
//
// Directions are asked as a SIGNED component, for example
// "B_z, where + means out of the page". That way a wrong direction is
// caught by the answer checker's sign test.
//
// Places marked TODO(professor-method) follow a convention the slides
// leave blank; keep them in step with src/physics/magnetism.ts.
// =====================================================================
import { tex } from '../lib/format';
import * as P from '../physics';
import { MU0_TEX, U, int, nonzero, pick } from './common';
import type { Generator } from './common';

/** μ0 written in TeX and as a number. */
const mu0 = P.MU0;

/** Turns a signed number into "+3.0" style text for prompts (TeX minus). */
const signed = (x: number, digits = 1) => `${x < 0 ? '-' : '+'}${Math.abs(x).toFixed(digits)}`;

const DIR_HINT = String.raw`ทิศใช้กฎมือขวาแบบ cross product: ชี้นิ้วตามตัวแรก งอไปหาตัวที่สอง นิ้วโป้งคือผลลัพธ์`;

export const magnetismGenerators: Generator[] = [
  // ------------------------------------------------ force on a charge
  {
    id: 'q26-radius',
    skill: 'magCharge',
    title: 'รัศมีวงโคจรของโปรตอน (แบบข้อ 26)',
    make: (rng) => {
      const KMeV = pick(rng, [1.0, 2.0, 4.0, 5.0, 8.0, 10.0]);
      const B = pick(rng, [0.2, 0.25, 0.33, 0.4, 0.5, 0.8]);
      const m = P.PROTON_MASS;
      const K = KMeV * P.MEV;
      const v = P.speedFromKineticEnergy(m, K);
      const r = P.orbitRadius(m, v, P.E_CHARGE, B);
      return {
        prompt: String.raw`โปรตอนพลังงานจลน์ ${KMeV.toFixed(1)} MeV เคลื่อนที่เข้าไปในสนามแม่เหล็กขนาด ${B} T ที่ตั้งฉากกับระนาบการเคลื่อนที่ จงหารัศมีความโค้งของเส้นทาง (มวลโปรตอน $1.66\times10^{-27}$ kg, $e=1.60\times10^{-19}$ C)`,
        units: U.length,
        answer: r,
        scale: r,
        mistakes: [
          { id: 'mev-not-converted', value: P.orbitRadiusFromKineticEnergy(m, KMeV * 1e6, P.E_CHARGE, B) },
          { id: 'no-factor-2', value: (m * Math.sqrt(K / m)) / (P.E_CHARGE * B) },
        ],
        hints: [
          String.raw`แปลงพลังงานเป็นจูล: $E_K=${KMeV.toFixed(1)}\times10^{6}\times1.60\times10^{-19}$ J`,
          String.raw`แรงแม่เหล็กเป็นแรงสู่ศูนย์กลาง: $qvB=mv^{2}/r\ \Rightarrow\ r=mv/qB$`,
          String.raw`$v=\sqrt{2E_K/m}$ จึงได้ $r=\sqrt{2mE_K}/(qB)$`,
        ],
        solution: [
          String.raw`$E_K=${KMeV.toFixed(1)}\times10^{6}\times1.60\times10^{-19}=${tex(K)}\ \mathrm J$`,
          String.raw`$v=\sqrt{2E_K/m}=${tex(v)}\ \mathrm{m/s}$`,
          String.raw`$r=\dfrac{mv}{qB}=\dfrac{(1.66\times10^{-27})(${tex(v)})}{(1.60\times10^{-19})(${B})}=${tex(r)}\ \mathrm m$`,
        ],
      };
    },
  },
  {
    id: 'mag-force-angle',
    skill: 'magCharge',
    title: 'ขนาดแรงแม่เหล็กบนประจุ',
    make: (rng) => {
      const q = nonzero(rng, -5, 5);
      const v = pick(rng, [2, 3, 4, 5, 6]) * 1e5;
      const B = pick(rng, [0.1, 0.2, 0.4, 0.5]);
      const th = pick(rng, [30, 37, 45, 53, 60, 90]);
      const F = P.forceOnChargeMagnitude(q * 1e-6, v, B, th);
      const rad = (th * Math.PI) / 180;
      return {
        prompt: String.raw`อนุภาคประจุ $${signed(q)}\ \mu\mathrm C$ เคลื่อนที่ด้วยอัตราเร็ว $${tex(v)}$ m/s ในสนามแม่เหล็กสม่ำเสมอ ${B} T โดยความเร็วทำมุม ${th}° กับสนาม จงหาขนาดของแรงแม่เหล็กที่กระทำต่ออนุภาค`,
        units: U.force,
        answer: F,
        scale: F,
        mistakes: [
          { id: 'sin-for-B', value: Math.abs(q) * 1e-6 * v * B * Math.cos(rad) },
          { id: 'no-sin', value: Math.abs(q) * 1e-6 * v * B },
        ],
        hints: [String.raw`$|\vec F|=|q|vB\sin\theta$ โดย $\theta$ คือมุมระหว่าง $\vec v$ กับ $\vec B$`, 'ขนาดของแรงไม่มีเครื่องหมาย ใช้ |q|'],
        solution: [
          String.raw`$F=|q|vB\sin\theta=(${Math.abs(q)}\times10^{-6})(${tex(v)})(${B})\sin${th}^\circ=${tex(F)}\ \mathrm N$`,
        ],
      };
    },
  },
  {
    id: 'selector-v',
    skill: 'magCharge',
    title: 'ตัวเลือกความเร็ว: หา v',
    make: (rng) => {
      const E = pick(rng, [2, 3, 4, 5, 6, 8]) * 1e4;
      const B = pick(rng, [0.02, 0.04, 0.05, 0.08, 0.1, 0.2]);
      const v = P.velocitySelectorSpeed(E, B);
      return {
        prompt: String.raw`ในตัวเลือกความเร็ว สนามไฟฟ้าขนาด $${tex(E)}$ V/m ตั้งฉากกับสนามแม่เหล็กขนาด ${B} T อนุภาคที่วิ่งผ่านเป็นเส้นตรงมีอัตราเร็วเท่าใด`,
        units: U.speed,
        answer: v,
        scale: v,
        mistakes: [{ id: 'selector-inverted', value: B / E }],
        hints: ['วิ่งเป็นเส้นตรงเมื่อแรงไฟฟ้าเท่ากับแรงแม่เหล็ก', String.raw`$qE=qvB\ \Rightarrow\ v=E/B$`],
        solution: [String.raw`$qE=qvB$ ตัด $q$ ได้ $v=\dfrac{E}{B}=\dfrac{${tex(E)}}{${B}}=${tex(v)}\ \mathrm{m/s}$`],
      };
    },
  },
  {
    id: 'selector-E',
    skill: 'magCharge',
    title: 'ตัวเลือกความเร็ว: หา E',
    make: (rng) => {
      const v = pick(rng, [2, 3, 4, 5, 8]) * 1e5;
      const B = pick(rng, [0.02, 0.05, 0.1, 0.2]);
      const E = v * B;
      return {
        prompt: String.raw`ต้องการให้อนุภาคอัตราเร็ว $${tex(v)}$ m/s วิ่งผ่านตัวเลือกความเร็วเป็นเส้นตรง โดยใช้สนามแม่เหล็ก ${B} T ต้องใช้สนามไฟฟ้าขนาดเท่าใด`,
        units: [{ label: 'V/m', factor: 1 }],
        answer: E,
        scale: E,
        mistakes: [{ id: 'selector-inverted', value: v / B }],
        hints: [String.raw`$qE=qvB$`, String.raw`$E=vB$`],
        solution: [String.raw`$E=vB=(${tex(v)})(${B})=${tex(E)}\ \mathrm{V/m}$`],
      };
    },
  },

  // ------------------------------------------------- force on a wire
  {
    id: 'wire-force',
    skill: 'wireForce',
    title: 'แรงบนลวดตรง',
    make: (rng) => {
      const I = pick(rng, [2, 3, 5, 8]);
      const L = pick(rng, [0.2, 0.5, 1.0]);
      const B = pick(rng, [0.1, 0.2, 0.4, 0.5]);
      const th = pick(rng, [30, 45, 60, 90]);
      const F = P.forceOnWireMagnitude(I, L, B, th);
      const rad = (th * Math.PI) / 180;
      return {
        prompt: `ลวดตรงยาว ${L} m มีกระแส ${I} A วางในสนามแม่เหล็กสม่ำเสมอ ${B} T โดยลวดทำมุม ${th}° กับสนาม จงหาขนาดของแรงแม่เหล็กบนลวด`,
        units: U.force,
        answer: F,
        scale: F,
        mistakes: [
          { id: 'sin-for-B', value: I * L * B * Math.cos(rad) },
          { id: 'no-sin', value: I * L * B },
        ],
        hints: [String.raw`$\vec F=I\vec L\times\vec B$ ขนาด $F=ILB\sin\theta$`],
        solution: [String.raw`$F=ILB\sin\theta=(${I})(${L})(${B})\sin${th}^\circ=${tex(F)}\ \mathrm N$`],
      };
    },
  },
  {
    id: 'semi-straight',
    skill: 'wireForce',
    title: 'ลวดครึ่งวงกลม: แรงบนส่วนตรง',
    make: (rng) => {
      const I = pick(rng, [1, 2, 3, 5]);
      const Rcm = pick(rng, [5, 10, 15, 20]);
      const B = pick(rng, [0.2, 0.3, 0.5]) * (rng() < 0.5 ? 1 : -1); // +y or −y
      const R = Rcm / 100;
      const Fz = P.semicircleForces(I, R, B).straight.z;
      return {
        prompt: String.raw`ลวดครึ่งวงกลมรัศมี ${Rcm} cm อยู่ในระนาบ $xy$ ส่วนตรงวางบนแกน $x$ มีกระแส ${I} A ไหลไปทาง $+x$ (แล้ววนกลับทางส่วนโค้ง) อยู่ในสนามแม่เหล็กสม่ำเสมอ $\vec B=${signed(B)}\,\hat j$ T จงหาองค์ประกอบ $F_z$ ของแรงบน **ส่วนตรง** (บวก = ออกจากกระดาษ)`,
        units: U.force,
        answer: Fz,
        scale: Math.abs(Fz),
        mistakes: [],
        hints: [String.raw`ส่วนตรงยาว $2R$ กระแสไป $+x$: $\vec L=2R\,\hat i$`, String.raw`$\vec F=I\vec L\times\vec B$ และ $\hat i\times\hat j=\hat k$`, DIR_HINT],
        solution: [
          String.raw`$\vec L=2R\,\hat i=${tex(2 * R)}\,\hat i$ m`,
          String.raw`$\vec F=I\vec L\times\vec B=(${I})(${tex(2 * R)}\,\hat i)\times(${signed(B)}\,\hat j)=${tex(Fz)}\,\hat k\ \mathrm N$`,
        ],
      };
    },
  },
  {
    id: 'semi-curved',
    skill: 'wireForce',
    title: 'ลวดครึ่งวงกลม: แรงบนส่วนโค้ง',
    make: (rng) => {
      const I = pick(rng, [1, 2, 3, 5]);
      const Rcm = pick(rng, [5, 10, 15, 20]);
      const B = pick(rng, [0.2, 0.3, 0.5]) * (rng() < 0.5 ? 1 : -1);
      const R = Rcm / 100;
      const Fz = P.semicircleForces(I, R, B).curved.z;
      // TODO(professor-method): the hints/solution show the integral first and the
      // chord shortcut as a check, matching MagnetismPage.tsx.
      return {
        prompt: String.raw`ลวดครึ่งวงกลมรัศมี ${Rcm} cm อยู่ในระนาบ $xy$ ส่วนตรงวางบนแกน $x$ มีกระแส ${I} A ไหลไปทาง $+x$ แล้ววนกลับทวนเข็มนาฬิกาตามส่วนโค้ง อยู่ในสนามแม่เหล็กสม่ำเสมอ $\vec B=${signed(B)}\,\hat j$ T จงหาองค์ประกอบ $F_z$ ของแรงบน **ส่วนโค้ง** (บวก = ออกจากกระดาษ)`,
        units: U.force,
        answer: Fz,
        scale: Math.abs(Fz),
        mistakes: [{ id: 'arc-length', value: (Math.PI / 2) * Fz }],
        hints: [
          String.raw`ชิ้น $ds=R\,d\theta$ ทำมุม $\theta$ กับ $\vec B$ แรงต่อชิ้นมีขนาด $IRB\sin\theta\,d\theta$ และทุกชิ้นชี้ทางเดียวกัน`,
          String.raw`$\int_0^{\pi}\sin\theta\,d\theta=2$`,
          String.raw`เช็กด้วยทางลัด: ในสนามสม่ำเสมอ ส่วนโค้งได้แรงเท่ากับลวดตรงจากปลายต้น $(R,0)$ ถึงปลายทาง $(-R,0)$`,
        ],
        solution: [
          String.raw`$\vec F=I\int d\vec s\times\vec B$ ทุกชิ้นให้แรงทิศเดียวกัน ขนาดรวม $IRB\int_0^{\pi}\sin\theta\,d\theta=2IRB$`,
          String.raw`ทิศ: ส่วนโค้งเริ่มที่ $(R,0)$ จบที่ $(-R,0)$ จึงเหมือน $\vec L=-2R\,\hat i$: $\vec F=I(-2R\,\hat i)\times(${signed(B)}\,\hat j)$`,
          String.raw`$F_z=-2IRB_y=-2(${I})(${R})(${signed(B)})=${tex(Fz)}\ \mathrm N$`,
        ],
      };
    },
  },

  // ---------------------------------------------------- Biot–Savart
  {
    id: 'finite-wire',
    skill: 'biotSavart',
    title: 'สนามจากลวดตรงยาวจำกัด',
    make: (rng) => {
      const I = pick(rng, [2, 5, 10, 20]);
      const acm = pick(rng, [2, 4, 5, 10]);
      const t1 = pick(rng, [30, 37, 45, 53, 60]);
      const t2 = pick(rng, [30, 37, 45, 53, 60]);
      const a = acm / 100;
      // TODO(professor-method): sinθ1 + sinθ2 convention (see finiteWireField)
      const B = P.finiteWireField(I, a, t1, t2);
      const rad = Math.PI / 180;
      return {
        prompt: String.raw`ลวดตรงยาวจำกัดมีกระแส ${I} A จุด P อยู่ห่างลวด ${acm} cm (วัดตั้งฉาก) เส้นที่ลากจาก P ไปยังปลายลวดทั้งสองทำมุม $\theta_1=${t1}^\circ$ และ $\theta_2=${t2}^\circ$ กับเส้นตั้งฉากจาก P ถึงลวด (ปลายอยู่คนละข้างของเส้นตั้งฉาก) จงหาขนาดสนามแม่เหล็กที่ P ($\mu_0=${MU0_TEX}$ T·m/A)`,
        units: U.tesla,
        answer: B,
        scale: B,
        mistakes: [
          { id: 'infinite-formula', value: P.longWireField(I, a) },
          { id: 'cos-for-wire', value: ((mu0 * I) / (4 * Math.PI * a)) * (Math.cos(t1 * rad) + Math.cos(t2 * rad)) },
        ],
        hints: [
          String.raw`จากกฎของบิโอต์–ซาวาร์ต: $B=\dfrac{\mu_0I}{4\pi a}(\sin\theta_1+\sin\theta_2)$`,
          String.raw`$\dfrac{\mu_0}{4\pi}=10^{-7}$ T·m/A ทำให้คิดเลขง่ายขึ้น`,
        ],
        solution: [
          String.raw`$B=\dfrac{\mu_0I}{4\pi a}(\sin\theta_1+\sin\theta_2)=\dfrac{(10^{-7})(${I})}{${a}}(\sin${t1}^\circ+\sin${t2}^\circ)$`,
          String.raw`$B=${tex(B)}\ \mathrm T$`,
        ],
      };
    },
  },
  {
    id: 'long-wire',
    skill: 'biotSavart',
    title: 'สนามจากลวดตรงยาวมาก',
    make: (rng) => {
      const I = pick(rng, [2, 5, 10, 15, 20, 30]);
      const rcm = pick(rng, [1, 2, 4, 5, 10, 20]);
      const r = rcm / 100;
      const B = P.longWireField(I, r);
      return {
        prompt: String.raw`ลวดตรงยาวมากมีกระแส ${I} A จงหาขนาดสนามแม่เหล็กที่ระยะ ${rcm} cm จากลวด ($\mu_0=${MU0_TEX}$ T·m/A)`,
        units: U.tesla,
        answer: B,
        scale: B,
        mistakes: [
          { id: 'no-2pi', value: (mu0 * I) / (4 * Math.PI * r) },
          { id: 'inverse-r2-wire', value: (mu0 * I) / (2 * Math.PI * r * r) },
          { id: 'cm-not-m', value: (mu0 * I) / (2 * Math.PI * rcm) },
        ],
        hints: [String.raw`วงแอมแปร์เป็นวงกลมรัศมี $r$: $B(2\pi r)=\mu_0I$`, 'แปลง cm เป็น m ก่อน'],
        solution: [String.raw`$B=\dfrac{\mu_0I}{2\pi r}=\dfrac{(${MU0_TEX})(${I})}{2\pi(${r})}=${tex(B)}\ \mathrm T$`],
      };
    },
  },

  // ----------------------------------------------------------- Ampère
  {
    id: 'thick-out',
    skill: 'ampere',
    title: 'ลวดหนา: สนามนอกลวด',
    make: (rng) => {
      const I = pick(rng, [5, 10, 20, 40]);
      const Rcm = pick(rng, [0.5, 1, 2]);
      const r = (Rcm * pick(rng, [2, 3, 4])) / 100;
      const B = P.thickWireField(I, Rcm / 100, r);
      return {
        prompt: String.raw`ลวดยาวรัศมี ${Rcm} cm มีกระแส ${I} A กระจายสม่ำเสมอทั่วหน้าตัด จงหาขนาดสนามแม่เหล็กที่ระยะ ${tex(r * 100)} cm จากแกนกลาง`,
        units: U.tesla,
        answer: B,
        scale: B,
        mistakes: [
          { id: 'no-2pi', value: (mu0 * I) / (4 * Math.PI * r) },
          { id: 'inverse-r2-wire', value: (mu0 * I) / (2 * Math.PI * r * r) },
        ],
        hints: ['เช็กก่อนว่าจุดอยู่ในหรือนอกลวด', String.raw`นอกลวด วงแอมแปร์ล้อมกระแสทั้งหมด: $B=\mu_0I/2\pi r$`],
        solution: [
          String.raw`$r=${tex(r * 100)}$ cm $>R$ อยู่นอกลวด กระแสที่ทะลุวงคือ $I$ ทั้งหมด`,
          String.raw`$B=\dfrac{\mu_0I}{2\pi r}=\dfrac{(${MU0_TEX})(${I})}{2\pi(${tex(r)})}=${tex(B)}\ \mathrm T$`,
        ],
      };
    },
  },
  {
    id: 'thick-in',
    skill: 'ampere',
    title: 'ลวดหนา: สนามในลวด',
    make: (rng) => {
      const I = pick(rng, [5, 10, 20, 40]);
      const Rcm = pick(rng, [1, 2, 4]);
      const frac = pick(rng, [0.25, 0.5, 0.75]);
      const R = Rcm / 100;
      const r = R * frac;
      const B = P.thickWireField(I, R, r);
      const Iin = P.thickWireEnclosedCurrent(I, R, r);
      return {
        prompt: String.raw`ลวดยาวรัศมี ${Rcm} cm มีกระแส ${I} A กระจายสม่ำเสมอทั่วหน้าตัด จงหาขนาดสนามแม่เหล็กที่ระยะ ${tex(r * 100)} cm จากแกนกลาง`,
        units: U.tesla,
        answer: B,
        scale: B,
        mistakes: [
          { id: 'thick-inside-as-outside', value: P.longWireField(I, r) },
          { id: 'thick-area-wrong', value: (mu0 * I * frac) / (2 * Math.PI * r) },
        ],
        hints: [
          'เช็กก่อนว่าจุดอยู่ในหรือนอกลวด',
          String.raw`ในลวด กระแสที่ทะลุวงเป็นสัดส่วนของพื้นที่: $I_{in}=I\,r^{2}/R^{2}$`,
          String.raw`$B(2\pi r)=\mu_0I_{in}\ \Rightarrow\ B=\dfrac{\mu_0Ir}{2\pi R^{2}}$`,
        ],
        solution: [
          String.raw`$r<R$ อยู่ในลวด: $I_{in}=I\dfrac{r^{2}}{R^{2}}=(${I})(${frac})^{2}=${tex(Iin)}$ A`,
          String.raw`$B=\dfrac{\mu_0I_{in}}{2\pi r}=\dfrac{(${MU0_TEX})(${tex(Iin)})}{2\pi(${tex(r)})}=${tex(B)}\ \mathrm T$`,
        ],
      };
    },
  },
  {
    id: 'solenoid',
    skill: 'ampere',
    title: 'สนามในโซลีนอยด์',
    make: (rng) => {
      const N = pick(rng, [200, 400, 500, 800, 1000]);
      const Lcm = pick(rng, [10, 20, 25, 40, 50]);
      const I = pick(rng, [0.5, 1, 2, 3, 5]);
      const n = P.turnsPerLength(N, Lcm / 100);
      const B = P.solenoidField(n, I);
      return {
        prompt: String.raw`โซลีนอยด์ยาว ${Lcm} cm พันลวด ${N} รอบอย่างแน่น มีกระแส ${I} A จงหาขนาดสนามแม่เหล็กภายในโซลีนอยด์ ($\mu_0=${MU0_TEX}$ T·m/A)`,
        units: U.tesla,
        answer: B,
        scale: B,
        mistakes: [
          { id: 'used-N-not-n', value: mu0 * N * I },
          { id: 'cm-not-m', value: mu0 * (N / Lcm) * I },
        ],
        hints: [String.raw`$B_{in}=\mu_0nI$ โดย $n=N/\ell$ คือจำนวนรอบต่อเมตร`, 'แปลง cm เป็น m ก่อนหาร'],
        solution: [
          String.raw`$n=\dfrac{N}{\ell}=\dfrac{${N}}{${Lcm / 100}}=${tex(n)}$ รอบ/m`,
          String.raw`$B=\mu_0nI=(${MU0_TEX})(${tex(n)})(${I})=${tex(B)}\ \mathrm T$`,
        ],
      };
    },
  },
  {
    id: 'ampere-loop',
    skill: 'ampere',
    title: 'กฎของแอมแปร์: หา ∮B·ds',
    make: (rng) => {
      const i1 = nonzero(rng, -6, 6);
      const i2 = nonzero(rng, -6, 6);
      const iOut = nonzero(rng, -6, 6);
      const word = (i: number) => (i > 0 ? 'พุ่งออกจากกระดาษ' : 'พุ่งเข้ากระดาษ');
      const Ienc = i1 + i2;
      const ans = mu0 * Ienc;
      return {
        prompt: String.raw`ลวดยาว 3 เส้นตั้งฉากกับกระดาษ เส้นที่ 1 มีกระแส ${Math.abs(i1)} A ${word(i1)} และเส้นที่ 2 มีกระแส ${Math.abs(i2)} A ${word(i2)} ทั้งสองเส้นอยู่ในวงปิดวงหนึ่ง ส่วนเส้นที่ 3 มีกระแส ${Math.abs(iOut)} A ${word(iOut)} อยู่นอกวง จงหา $\oint\vec B\cdot d\vec s$ เมื่อเดินรอบวง **ทวนเข็มนาฬิกา** (กระแสพุ่งออกนับเป็นบวก)`,
        units: U.teslaMetre,
        answer: ans,
        scale: mu0 * (Math.abs(i1) + Math.abs(i2)),
        mistakes: [
          { id: 'outside-current', value: mu0 * (Ienc + iOut) },
          { id: 'current-sign', value: mu0 * (Math.abs(i1) + Math.abs(i2)) },
        ],
        hints: [
          String.raw`$\oint\vec B\cdot d\vec s=\mu_0I_{in}$ นับเฉพาะกระแสที่ทะลุวง`,
          'เดินทวนเข็มนาฬิกา: กระแสพุ่งออก (⊙) เป็นบวก กระแสพุ่งเข้า (⊗) เป็นลบ',
        ],
        solution: [
          String.raw`$I_{in}=(${i1})+(${i2})=${Ienc}$ A (เส้นที่ 3 อยู่นอกวง ไม่นับ)`,
          String.raw`$\oint\vec B\cdot d\vec s=\mu_0I_{in}=(${MU0_TEX})(${Ienc})=${tex(ans)}\ \mathrm{T\cdot m}$`,
        ],
      };
    },
  },

  // -------------------------------------------- several long wires
  {
    id: 'two-wires-page',
    skill: 'superpose',
    title: 'ลวดขนานสองเส้น (แบบตัวอย่างในสไลด์)',
    make: (rng) => {
      const Lcm = pick(rng, [10, 20, 30, 40]);
      const I = pick(rng, [5, 10, 20]);
      const upLeft = rng() < 0.5;
      const upRight = rng() < 0.5;
      // P is either right of the right wire or between the wires
      const where = pick(rng, ['right-half', 'right-full', 'between'] as const);
      const L = Lcm / 100;
      const xP = where === 'right-half' ? 1.5 * L : where === 'right-full' ? 2 * L : 0.5 * L;
      const bL = P.inPageWireBz(upLeft ? I : -I, 0, xP);
      const bR = P.inPageWireBz(upRight ? I : -I, L, xP);
      const Bz = bL + bR;
      const placeText =
        where === 'between'
          ? 'อยู่กึ่งกลางระหว่างลวดทั้งสอง'
          : `อยู่ทางขวาของเส้นขวาเป็นระยะ ${where === 'right-half' ? 'L/2' : 'L'}`;
      const dir = (up: boolean) => (up ? 'ขึ้น' : 'ลง');
      return {
        prompt: String.raw`ลวดตรงยาวมาก 2 เส้นวางขนานกันในแนวตั้งบนกระดาษ ห่างกัน $L=${Lcm}$ cm แต่ละเส้นมีกระแส ${I} A โดยเส้นซ้ายกระแสไหล${dir(upLeft)} เส้นขวากระแสไหล${dir(upRight)} จุด P ${placeText} จงหาสนามแม่เหล็กที่ P ตอบเป็น $B_z$ (บวก = ออกจากกระดาษ ลบ = เข้ากระดาษ)`,
        units: U.tesla,
        answer: Bz,
        scale: Math.abs(bL) + Math.abs(bR),
        mistakes: [
          // same sizes, but the two fields combined the wrong way
          { id: bL * bR < 0 ? 'added-not-subtracted' : 'subtracted-not-added', value: bR - bL },
          { id: bL * bR < 0 ? 'added-not-subtracted' : 'subtracted-not-added', value: bL - bR },
        ],
        hints: [
          String.raw`แต่ละเส้นให้ $B=\mu_0I/2\pi r$ โดย $r$ คือระยะจากเส้นนั้นถึง P`,
          'ทิศ: กำมือขวาให้นิ้วโป้งตามกระแส นิ้วที่งอผ่าน P ชี้ออกหรือเข้ากระดาษ',
          'ถ้าสองเส้นให้ทิศตรงข้ามกันให้ลบ ถ้าทิศเดียวกันให้บวก',
        ],
        solution: [
          String.raw`เส้นซ้ายห่าง P ${tex(xP * 100)} cm: $B=${tex(Math.abs(bL))}$ T ทิศ${bL > 0 ? 'ออก (⊙)' : 'เข้า (⊗)'}`,
          String.raw`เส้นขวาห่าง P ${tex(Math.abs(xP - L) * 100)} cm: $B=${tex(Math.abs(bR))}$ T ทิศ${bR > 0 ? 'ออก (⊙)' : 'เข้า (⊗)'}`,
          String.raw`รวม: $B_z=${tex(bL)}+(${tex(bR)})=${tex(Bz)}\ \mathrm T$ (${Bz > 0 ? 'ออกจากกระดาษ' : 'เข้ากระดาษ'})`,
        ],
      };
    },
  },
  ...(['x', 'y'] as const).map(
    (axis): Generator => ({
      id: `q27-B${axis}`,
      skill: 'superpose',
      title: `ลวดสองเส้นแนวแกน z: หา B_${axis} (แบบข้อ 27)`,
      make: (rng) => {
        const a = int(rng, 2, 5);
        const b = int(rng, 2, 6);
        const nA = int(rng, 1, 3);
        const nB = int(rng, 1, 3);
        const aOut = rng() < 0.5; // +k̂ when true
        const bOut = rng() < 0.5;
        const unit = mu0 / (2 * Math.PI); // μ0 I / 2π with I = 1
        const wA = { x: 0, y: a, I: aOut ? nA : -nA };
        const wB = { x: b, y: 0, I: bOut ? nB : -nB };
        const BA = P.lineCurrentsField([wA], { x: 0, y: 0 });
        const BB = P.lineCurrentsField([wB], { x: 0, y: 0 });
        const Bx = (BA.x + BB.x) / unit;
        const By = (BA.y + BB.y) / unit;
        const ans = axis === 'x' ? Bx : By;
        const k = (out: boolean) => (out ? String.raw`+\hat k` : String.raw`-\hat k`);
        const nI = (n: number) => (n === 1 ? 'I' : `${n}I`);
        return {
          prompt: String.raw`ลวดตรงยาวมาก 2 เส้นขนานกับแกน $z$ ลวด A ผ่านจุด $(0,${a})$ m มีกระแส $${nI(nA)}$ ไปทาง $${k(aOut)}$ ลวด B ผ่านจุด $(${b},0)$ m มีกระแส $${nI(nB)}$ ไปทาง $${k(bOut)}$ จงหาองค์ประกอบ $B_${axis}$ ของสนามแม่เหล็กที่จุดกำเนิด ตอบเป็นจำนวนเท่าของ $\mu_0I/2\pi$ (หน่วย 1/m)`,
          units: U.timesMu0I2pi,
          answer: ans,
          scale: Math.abs(Bx) + Math.abs(By),
          mistakes: [{ id: 'other-component', value: axis === 'x' ? By : Bx }],
          hints: [
            String.raw`แต่ละเส้นให้ขนาด $\mu_0(\text{กระแส})/2\pi r$ โดย $r$ คือระยะจากลวดถึงจุดกำเนิด`,
            String.raw`ทิศของ $\vec B$ = (ทิศกระแส) × (ทิศจากลวดไปหาจุด) เช่น $\hat k\times(-\hat j)=+\hat i$`,
            'ลวด A อยู่บนแกน y จึงให้สนามแนว x เท่านั้น ลวด B อยู่บนแกน x จึงให้สนามแนว y เท่านั้น',
          ],
          solution: [
            String.raw`ลวด A: ระยะ ${a} m ทิศ $${k(aOut)}\times(-\hat j)=${aOut ? '+' : '-'}\hat i$ จึงได้ $\vec B_A=${tex(BA.x / unit)}\,\dfrac{\mu_0I}{2\pi}\,\hat i$`,
            String.raw`ลวด B: ระยะ ${b} m ทิศ $${k(bOut)}\times(-\hat i)=${bOut ? '-' : '+'}\hat j$ จึงได้ $\vec B_B=${tex(BB.y / unit)}\,\dfrac{\mu_0I}{2\pi}\,\hat j$`,
            String.raw`$\vec B=\dfrac{\mu_0I}{2\pi}\left(${tex(Bx)}\,\hat i${By < 0 ? '' : '+'}${tex(By)}\,\hat j\right)$ ดังนั้น $B_${axis}=${tex(ans)}\,\mu_0I/2\pi$`,
          ],
        };
      },
    }),
  ),
];
