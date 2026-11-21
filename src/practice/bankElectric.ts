// =====================================================================
// Practice question generators for chapters 1–2 (Gauss's law, potential).
// Modelled on worksheet Q21–25 and the lecture examples.
//
// Each entry of `electricGenerators` is one question type. Its `make`
// function picks random numbers with the helpers from common.ts, then
// returns the prompt, the answer (from src/physics), the known wrong
// answers (`mistakes`), step-by-step hints and the worked solution.
// =====================================================================
import { tex } from '../lib/format';
import * as P from '../physics';
import { E0_TEX, K_TEX, U, int, nC, nonzero, pick, s1, sgn, uC } from './common';
import type { Generator, Rng } from './common';

const REGION_FIRST = 'เช็กก่อนว่าจุดที่ถามอยู่บริเวณไหน: ในเนื้อโลหะ ในโพรง ในฉนวน หรือข้างนอก';

// ------------------------------------------------------- shared set-ups

function shellSetup(rng: Rng) {
  const [R1, R2] = pick(rng, [
    [0.08, 0.12],
    [0.1, 0.14],
    [0.06, 0.1],
    [0.12, 0.18],
  ] as const);
  const q = nonzero(rng, -8, 8);
  let Q = nonzero(rng, -20, 20);
  while (Q + q === 0) Q = nonzero(rng, -20, 20);
  const text = String.raw`ตัวนำทรงกลมกลวง รัศมีภายใน ${R1.toFixed(3)} m รัศมีภายนอก ${R2.toFixed(3)} m มีประจุสุทธิ $Q=${s1(Q)}\ \mu\mathrm C$ ในโพรงมีจุดประจุ $q=${s1(q)}\ \mu\mathrm C$`;
  return { R1, R2, q, Q, text };
}

function condSetup(rng: Rng, allowNegative: boolean) {
  const Rcm = pick(rng, [5, 8, 10, 12, 15, 20]);
  const Q = pick(rng, [1.5, 2.0, 3.0, 4.0, 5.0, 6.0]) * (allowNegative && rng() < 0.35 ? -1 : 1);
  const rOut = Rcm + pick(rng, [2, 4, 5, 6, 10]);
  const rIn = Rcm - pick(rng, [2, 3, 4].filter((d) => d < Rcm - 1));
  const text = String.raw`ตัวนำทรงกลมตันรัศมี ${Rcm.toFixed(1)} cm มีประจุ $${s1(Q).replace('+', '')}\ \mu\mathrm C$`;
  return { Rcm, R: Rcm / 100, Q, Qsi: Q * uC, rOut, rIn, text };
}

function sheetSetup(rng: Rng) {
  const a = nonzero(rng, -3, 3);
  let b = nonzero(rng, -3, 3);
  if (a === b && rng() < 0.5) b = -b; // more opposite-sign cases, like the worksheet
  const name = (n: number) => `${sgn(n)}${Math.abs(n) === 1 ? '' : Math.abs(n)}\\sigma`;
  const text = String.raw`แผ่นประจุขนาดใหญ่มาก 2 แผ่นวางขนานกัน แผ่นซ้ายมีความหนาแน่นประจุ $${name(a)}$ แผ่นขวามี $${name(b)}$`;
  return { a, b, text, res: P.twoSheets(a, b) };
}

function uniformSetup(rng: Rng) {
  const E = { x: nonzero(rng, -5, 5), y: nonzero(rng, -5, 5) };
  let A = { x: 0, y: 0 };
  let B = { x: 0, y: 0 };
  let dV = 0;
  while (dV === 0) {
    A = { x: int(rng, 0, 5), y: int(rng, 0, 5) };
    B = { x: int(rng, 0, 5), y: int(rng, 0, 5) };
    dV = P.deltaVUniform(E, A, B);
  }
  const S = { x: B.x - A.x, y: B.y - A.y };
  const text = String.raw`บริเวณหนึ่งมีสนามไฟฟ้าสม่ำเสมอ $\vec E=${E.x.toFixed(1)}\,\hat i${sgn(E.y)}${Math.abs(E.y).toFixed(1)}\,\hat j$ N/C จุด A อยู่ที่ (${A.x.toFixed(1)}, ${A.y.toFixed(1)}) m และจุด B อยู่ที่ (${B.x.toFixed(1)}, ${B.y.toFixed(1)}) m`;
  const work = [
    String.raw`การกระจัดจาก A ไป B: $\vec S=${S.x}\,\hat i${sgn(S.y)}${Math.abs(S.y)}\,\hat j$ m`,
    String.raw`$\vec E\cdot\vec S=(${E.x})(${S.x})+(${E.y})(${S.y})=${-dV}$`,
    String.raw`$V_B-V_A=-\vec E\cdot\vec S=${dV}\ \mathrm V$`,
  ];
  return { E, A, B, S, dV, text, work };
}

function pointsSetup(rng: Rng) {
  const [a, b] = pick(rng, [
    [3, 4],
    [4, 3],
    [6, 8],
    [8, 6],
  ] as const);
  const q = [nonzero(rng, -5, 5), nonzero(rng, -5, 5), nonzero(rng, -5, 5)];
  const charges: P.PointCharge[] = [
    { q: q[0] * uC, x: 0, y: 0 },
    { q: q[1] * uC, x: a, y: 0 },
    { q: q[2] * uC, x: 0, y: b },
  ];
  const Pt = { x: a, y: b };
  const c = Math.hypot(a, b);
  const text = String.raw`จุดประจุ 3 ตัวถูกตรึงไว้ในระนาบ xy: $q_1=${s1(q[0])}\ \mu\mathrm C$ ที่ (0, 0), $q_2=${s1(q[1])}\ \mu\mathrm C$ ที่ (${a}.0, 0) m และ $q_3=${s1(q[2])}\ \mu\mathrm C$ ที่ (0, ${b}.0) m`;
  return { a, b, c, q, charges, Pt, text };
}

function ringSetup(rng: Rng) {
  const [a, x] = pick(rng, [
    [0.3, 0.4],
    [0.6, 0.8],
    [0.4, 0.3],
    [0.05, 0.12],
    [0.12, 0.05],
  ] as const);
  const Q = pick(rng, [2, 3, 5, 6, 8]);
  const text = String.raw`วงแหวนรัศมี ${a.toFixed(2)} m มีประจุ $+${Q}.0$ nC กระจายสม่ำเสมอ`;
  return { a, x, Q, Qsi: Q * nC, d: Math.hypot(a, x), text };
}

function twoSetup(rng: Rng) {
  const [r1, r2] = pick(rng, [
    [6, 2],
    [8, 2],
    [9, 3],
    [5, 10],
    [4, 12],
    [10, 5],
  ] as const);
  const Q = pick(rng, [4, 6, 8, 12]) * (r1 + r2 > 12 ? 1.5 : 1);
  const text = String.raw`ตัวนำทรงกลมสองลูกรัศมี $r_1=${r1}.0$ cm และ $r_2=${r2}.0$ cm อยู่ห่างกันมากและต่อกันด้วยลวดตัวนำเส้นเล็ก ประจุรวมของทั้งคู่คือ $+${Q}$ nC`;
  return { r1, r2, Q, text, res: P.twoSpheres(Q * nC, r1 / 100, r2 / 100) };
}

function polySetup(rng: Rng) {
  const a = int(rng, 1, 4);
  const b = int(rng, 1, 5);
  const x = int(rng, 1, 3);
  const y = int(rng, 1, 3);
  const V = (X: number, Y: number) => a * X * X * Y - b * Y;
  const text = String.raw`ในบริเวณหนึ่งศักย์ไฟฟ้าเป็น $V(x,y)=${a}x^{2}y-${b}y$ (หน่วยโวลต์ โดย $x,y$ เป็นเมตร)`;
  return { a, b, x, y, text, E: P.fieldFromPotential2D(V, { x, y }) };
}

// ------------------------------------------------------------ generators

export const electricGenerators: Generator[] = [
  // ---- Q21: hollow conductor
  {
    id: 'shell-metal-E',
    skill: 'shell',
    title: 'ตัวนำกลวง: สนามในเนื้อโลหะ',
    make: (rng) => {
      const s = shellSetup(rng);
      const r = (s.R1 + s.R2) / 2;
      return {
        prompt: `${s.text} จงหาขนาดของสนามไฟฟ้าที่ระยะ ${r.toFixed(3)} m จากจุดศูนย์กลาง`,
        units: U.field,
        answer: Math.abs(P.shellField(s.q * uC, s.Q * uC, s.R1, s.R2, r)),
        scale: P.pointFieldMagnitude(s.q * uC, r),
        mistakes: [
          { id: 'all-charge', value: P.pointFieldMagnitude(s.q * uC, r) },
          { id: 'all-charge', value: P.pointFieldMagnitude((s.q + s.Q) * uC, r) },
        ],
        hints: [REGION_FIRST, String.raw`$${s.R1.toFixed(3)}<${r.toFixed(3)}<${s.R2.toFixed(3)}$ จุดนี้อยู่ในเนื้อโลหะ`],
        solution: [
          String.raw`$${s.R1.toFixed(3)}<${r.toFixed(3)}<${s.R2.toFixed(3)}$ จุดนี้อยู่ **ในเนื้อตัวนำ**`,
          String.raw`สนามไฟฟ้าในเนื้อตัวนำที่สมดุลเป็นศูนย์: $E=0$ N/C ไม่ต้องคำนวณ`,
        ],
      };
    },
  },
  {
    id: 'shell-inner',
    skill: 'shell',
    title: 'ตัวนำกลวง: ประจุที่ผิวใน',
    make: (rng) => {
      const s = shellSetup(rng);
      const w = P.shellSurfaceCharges(s.q * uC, s.Q * uC);
      return {
        prompt: `${s.text} จงหาประจุที่ผิวด้านในของตัวนำ`,
        units: U.chargeU,
        answer: w.inner,
        scale: uC,
        mistakes: [{ id: 'forgot-cavity', value: s.Q * uC }],
        hints: [
          'วาดผิวเกาส์ทรงกลมในเนื้อโลหะ บนผิวนั้น E = 0 ทุกจุด',
          String.raw`ฟลักซ์เป็นศูนย์ จึงได้ $q_{in}=q+q_{\text{ผิวใน}}=0$`,
        ],
        solution: [
          String.raw`ผิวเกาส์ในเนื้อโลหะมี $E=0$ จึงได้ $q_{in}=0$`,
          String.raw`$q+q_{\text{ผิวใน}}=0\ \Rightarrow\ q_{\text{ผิวใน}}=-q=${s1(-s.q)}\ \mu\mathrm C$`,
        ],
      };
    },
  },
  {
    id: 'shell-outer',
    skill: 'shell',
    title: 'ตัวนำกลวง: ประจุที่ผิวนอก',
    make: (rng) => {
      const s = shellSetup(rng);
      const w = P.shellSurfaceCharges(s.q * uC, s.Q * uC);
      return {
        prompt: `${s.text} จงหาประจุที่ผิวด้านนอกของตัวนำ`,
        units: U.chargeU,
        answer: w.outer,
        scale: uC,
        mistakes: [
          { id: 'forgot-cavity', value: s.Q * uC },
          { id: 'outer-sign', value: (s.Q - s.q) * uC },
        ],
        hints: [
          String.raw`หาประจุที่ผิวในก่อน: $q_{\text{ผิวใน}}=-q$`,
          String.raw`ประจุสุทธิของตัวนำคือผลรวมสองผิว: $Q=q_{\text{ผิวใน}}+q_{\text{ผิวนอก}}$`,
        ],
        solution: [
          String.raw`$q_{\text{ผิวใน}}=-q=${s1(-s.q)}\ \mu\mathrm C$`,
          String.raw`$q_{\text{ผิวนอก}}=Q-q_{\text{ผิวใน}}=${s1(s.Q)}-(${s1(-s.q)})=${s1(s.Q + s.q)}\ \mu\mathrm C$`,
        ],
      };
    },
  },
  {
    id: 'shell-outside-E',
    skill: 'shell',
    title: 'ตัวนำกลวง: สนามข้างนอก',
    make: (rng) => {
      const s = shellSetup(rng);
      const r = s.R2 + pick(rng, [0.06, 0.08, 0.1]);
      const ans = Math.abs(P.shellField(s.q * uC, s.Q * uC, s.R1, s.R2, r));
      const tot = s.q + s.Q;
      return {
        prompt: `${s.text} จงหาขนาดของสนามไฟฟ้าที่ระยะ ${r.toFixed(3)} m จากจุดศูนย์กลาง`,
        units: U.field,
        answer: ans,
        scale: ans,
        mistakes: [
          { id: 'only-Q', value: P.pointFieldMagnitude(s.Q * uC, r) },
          { id: 'only-Q', value: P.pointFieldMagnitude(s.q * uC, r) },
          { id: 'inverse-r', value: Math.abs(P.pointPotential(tot * uC, r)) },
        ],
        hints: [
          REGION_FIRST,
          String.raw`${r.toFixed(3)} m อยู่นอกทุกอย่าง ผิวเกาส์ตรงนี้ล้อม $q+Q$`,
          String.raw`$E=k\,|q_{in}|/r^{2}$`,
        ],
        solution: [
          String.raw`ผิวเกาส์รัศมี ${r.toFixed(3)} m ล้อม $q_{in}=q+Q=${s1(s.q)}${s1(s.Q)}=${s1(tot)}\ \mu\mathrm C$`,
          String.raw`$E=\dfrac{k\,|q_{in}|}{r^{2}}=\dfrac{(${K_TEX})(${Math.abs(tot).toFixed(1)}\times10^{-6})}{(${r.toFixed(3)})^{2}}=${tex(ans)}\ \mathrm{N/C}$`,
          `สนามชี้${tot > 0 ? 'ออกจาก' : 'เข้าหา'}ทรงกลม เพราะประจุที่ถูกล้อมเป็น${tot > 0 ? 'บวก' : 'ลบ'}`,
        ],
      };
    },
  },

  // ---- Q22: sheets
  {
    id: 'sheets-middle',
    skill: 'sheets',
    title: 'สองแผ่นประจุ: ระหว่างแผ่น',
    make: (rng) => {
      const s = sheetSetup(rng);
      const ans = Math.abs(s.res.middle.net) * P.EPS0;
      return {
        prompt: String.raw`${s.text} ขนาดของสนามไฟฟ้า **ระหว่างแผ่นทั้งสอง** เป็นกี่เท่าของ $\sigma/\varepsilon_0$ (ถ้าเป็นศูนย์ตอบ 0)`,
        units: U.timesSigma,
        answer: ans,
        scale: 1,
        mistakes: [
          { id: 'wrong-direction', value: Math.abs(s.res.left.net) * P.EPS0 },
          { id: 'no-half', value: ans * 2 },
        ],
        hints: [
          String.raw`แต่ละแผ่นสร้างสนามขนาด $|\sigma_i|/2\varepsilon_0$ เท่ากันทุกบริเวณ`,
          'ระหว่างแผ่น: วาดลูกศรของแผ่นซ้ายและแผ่นขวา (ออกจากแผ่นบวก เข้าหาแผ่นลบ)',
          'ถ้าลูกศรชี้ทางเดียวกันให้บวก ถ้าสวนทางให้ลบ',
        ],
        solution: [
          String.raw`แผ่นซ้าย: $${Math.abs(s.a)}\sigma/2\varepsilon_0$ ระหว่างแผ่นชี้ไปทาง${s.a > 0 ? 'ขวา' : 'ซ้าย'}`,
          String.raw`แผ่นขวา: $${Math.abs(s.b)}\sigma/2\varepsilon_0$ ระหว่างแผ่นชี้ไปทาง${s.b > 0 ? 'ซ้าย' : 'ขวา'}`,
          String.raw`ลูกศรสองอัน${s.a * s.b < 0 ? 'ชี้ทางเดียวกัน จึงบวกกัน' : 'สวนทางกัน จึงลบกัน'}: $E=${tex(ans)}\ \sigma/\varepsilon_0$`,
        ],
      };
    },
  },
  {
    id: 'sheets-outside',
    skill: 'sheets',
    title: 'สองแผ่นประจุ: ด้านนอก',
    make: (rng) => {
      const s = sheetSetup(rng);
      const ans = Math.abs(s.res.left.net) * P.EPS0;
      return {
        prompt: String.raw`${s.text} ขนาดของสนามไฟฟ้า **ทางซ้ายของแผ่นทั้งสอง** เป็นกี่เท่าของ $\sigma/\varepsilon_0$ (ถ้าเป็นศูนย์ตอบ 0)`,
        units: U.timesSigma,
        answer: ans,
        scale: 1,
        mistakes: [
          { id: 'wrong-direction', value: Math.abs(s.res.middle.net) * P.EPS0 },
          { id: 'no-half', value: ans * 2 },
        ],
        hints: [
          String.raw`แต่ละแผ่นสร้างสนามขนาด $|\sigma_i|/2\varepsilon_0$`,
          'ทางซ้ายของทั้งสองแผ่น: แผ่นบวกผลักลูกศรไปทางซ้าย แผ่นลบดึงลูกศรไปทางขวา',
        ],
        solution: [
          String.raw`ทางซ้าย แผ่นซ้ายให้ $${Math.abs(s.a)}\sigma/2\varepsilon_0$ ชี้${s.a > 0 ? 'ซ้าย' : 'ขวา'} แผ่นขวาให้ $${Math.abs(s.b)}\sigma/2\varepsilon_0$ ชี้${s.b > 0 ? 'ซ้าย' : 'ขวา'}`,
          String.raw`${s.a * s.b > 0 ? 'ทิศเดียวกัน จึงบวกกัน' : 'สวนทางกัน จึงลบกัน'}: $E=${tex(ans)}\ \sigma/\varepsilon_0$`,
        ],
      };
    },
  },
  {
    id: 'sheets-numeric',
    skill: 'sheets',
    title: 'สองแผ่นประจุ: ตัวเลข',
    make: (rng) => {
      const a = nonzero(rng, -6, 6);
      let b = nonzero(rng, -6, 6);
      if (a === b) b = -b;
      const res = P.twoSheets(a * nC, b * nC);
      const ans = Math.abs(res.middle.net);
      return {
        prompt: String.raw`แผ่นประจุขนาดใหญ่มาก 2 แผ่นวางขนานกัน แผ่นซ้ายมี $\sigma_1=${s1(a)}\ \mathrm{nC/m^2}$ แผ่นขวามี $\sigma_2=${s1(b)}\ \mathrm{nC/m^2}$ จงหาขนาดของสนามไฟฟ้าระหว่างแผ่นทั้งสอง (ใช้ $\varepsilon_0=${E0_TEX}$)`,
        units: U.field,
        answer: ans,
        scale: ans,
        mistakes: [
          { id: 'wrong-direction', value: Math.abs(res.left.net) },
          { id: 'no-half', value: ans * 2 },
        ],
        hints: [
          String.raw`สนามของแต่ละแผ่น: $E_i=|\sigma_i|/2\varepsilon_0$`,
          'ระหว่างแผ่น วาดลูกศรของแต่ละแผ่นแล้วรวมแบบเวกเตอร์',
        ],
        solution: [
          String.raw`$E_1=\dfrac{${Math.abs(a)}\times10^{-9}}{2(${E0_TEX})}=${tex(P.sheetField(a * nC))}$ N/C, $E_2=${tex(P.sheetField(b * nC))}$ N/C`,
          String.raw`ระหว่างแผ่น ลูกศร${a * b < 0 ? 'ชี้ทางเดียวกัน จึงบวกกัน' : 'สวนทางกัน จึงลบกัน'}: $E=${tex(ans)}\ \mathrm{N/C}$`,
        ],
      };
    },
  },

  // ---- Q23: uniform field
  {
    id: 'uniform-VA-VB',
    skill: 'uniform',
    title: 'สนามสม่ำเสมอ: V_A − V_B',
    make: (rng) => {
      const s = uniformSetup(rng);
      return {
        prompt: String.raw`${s.text} จงหาความต่างศักย์ $V_A-V_B$`,
        units: U.volt,
        answer: -s.dV,
        scale: 1,
        mistakes: [],
        hints: [
          String.raw`$V_B-V_A=-\vec E\cdot\vec S$ โดย $\vec S=\vec r_B-\vec r_A$`,
          String.raw`โจทย์ถาม $V_A-V_B$ ซึ่งเป็นค่าลบของ $V_B-V_A$`,
        ],
        solution: [...s.work, String.raw`โจทย์ถาม $V_A-V_B=${-s.dV}\ \mathrm V$`],
      };
    },
  },
  {
    id: 'uniform-VB-VA',
    skill: 'uniform',
    title: 'สนามสม่ำเสมอ: V_B − V_A',
    make: (rng) => {
      const s = uniformSetup(rng);
      return {
        prompt: String.raw`${s.text} จงหาความต่างศักย์ $V_B-V_A$`,
        units: U.volt,
        answer: s.dV,
        scale: 1,
        mistakes: [],
        hints: [String.raw`$V_B-V_A=-\vec E\cdot\vec S$ โดย $\vec S=\vec r_B-\vec r_A$`, 'อย่าลืมเครื่องหมายลบหน้า dot product'],
        solution: s.work,
      };
    },
  },
  {
    id: 'uniform-Wext',
    skill: 'uniform',
    title: 'สนามสม่ำเสมอ: งานของแรงภายนอก',
    make: (rng) => {
      const s = uniformSetup(rng);
      const q = nonzero(rng, -5, 5);
      const ans = P.externalWork(q * uC, s.dV);
      return {
        prompt: String.raw`${s.text} จงหางานของแรงภายนอกในการนำจุดประจุ $${s1(q)}\ \mu\mathrm C$ จาก A ไป B ด้วยความเร็วคงที่`,
        units: U.energy,
        answer: ans,
        scale: Math.abs(ans),
        mistakes: [],
        hints: [
          String.raw`หา $\Delta V=V_B-V_A=-\vec E\cdot\vec S$ ก่อน`,
          String.raw`$W_{ext}=q\,\Delta V$ เก็บเครื่องหมายของ $q$ ไว้ด้วย`,
        ],
        solution: [
          ...s.work,
          String.raw`$W_{ext}=q\,(V_B-V_A)=(${s1(q)}\times10^{-6})(${s.dV})=${tex(ans)}\ \mathrm J$`,
        ],
      };
    },
  },

  // ---- Q24: conducting sphere, symbols
  {
    id: 'condV-ratio-out',
    skill: 'condV',
    title: 'ตัวนำทรงกลม: V ข้างนอกเทียบ V₀',
    make: (rng) => {
      const n = int(rng, 2, 8);
      const m = int(rng, 2, 5);
      const [R, V0] = [0.2, 100];
      const Q = P.chargeFromSpherePotential(V0, R);
      const ans = P.spherePotential('conductor', Q, R, n * R)! / V0;
      return {
        prompt: String.raw`ตัวนำทรงกลมตันรัศมี $R$ มีประจุสุทธิเป็นบวก ที่ระยะ $r=R/${m}$ วัดศักย์ไฟฟ้าได้ $V_0$ ศักย์ไฟฟ้าที่ $r=${n}R$ เป็นกี่เท่าของ $V_0$ (ตอบเป็นทศนิยมหรือเศษส่วน เช่น 1/6)`,
        units: U.timesV0,
        answer: ans,
        scale: 1,
        mistakes: [{ id: 'inverse-r2', value: 1 / (n * n) }],
        hints: [
          String.raw`$R/${m}$ อยู่ในเนื้อตัวนำ ศักย์ตรงนั้นเท่ากับที่ผิว: $V_0=kQ/R$`,
          String.raw`ข้างนอก $V=kQ/r$ และ $kQ=RV_0$`,
        ],
        solution: [
          String.raw`ในตัวนำศักย์เท่ากันทั้งก้อน: $V_0=kQ/R\ \Rightarrow\ kQ=RV_0$`,
          String.raw`$V(${n}R)=\dfrac{kQ}{${n}R}=\dfrac{RV_0}{${n}R}=\dfrac{V_0}{${n}}=${tex(ans)}\,V_0$`,
        ],
      };
    },
  },
  {
    id: 'condV-charge',
    skill: 'condV',
    title: 'ตัวนำทรงกลม: หาประจุจาก V₀',
    make: (rng) => {
      const Rcm = pick(rng, [5, 10, 15, 20, 30]);
      const V0 = pick(rng, [90, 180, 300, 450, 900]);
      const m = int(rng, 2, 4);
      const ans = P.chargeFromSpherePotential(V0, Rcm / 100);
      return {
        prompt: String.raw`ตัวนำทรงกลมตันรัศมี ${Rcm}.0 cm มีประจุสุทธิเป็นบวก ที่ระยะ $r=R/${m}$ จากจุดศูนย์กลางวัดศักย์ไฟฟ้าได้ ${V0} V จงหาประจุสุทธิของทรงกลม`,
        units: U.chargeN,
        answer: ans,
        scale: ans,
        mistakes: [{ id: 'used-r-inside', value: P.chargeFromSpherePotential(V0, Rcm / 100 / m) }],
        hints: [
          String.raw`$R/${m}$ อยู่ในเนื้อตัวนำ ศักย์ที่นั่นเท่ากับศักย์ที่ผิว`,
          String.raw`$V_0=kQ/R\ \Rightarrow\ Q=RV_0/k$`,
        ],
        solution: [
          String.raw`ศักย์ในตัวนำเท่ากับที่ผิว: $V_0=kQ/R$ (ใช้ $R$ ไม่ใช่ $R/${m}$)`,
          String.raw`$Q=\dfrac{RV_0}{k}=\dfrac{(${(Rcm / 100).toFixed(2)})(${V0})}{${K_TEX}}=${tex(ans)}\ \mathrm C$`,
        ],
      };
    },
  },

  // ---- Q25: conducting sphere, numbers
  {
    id: 'cond-E-out',
    skill: 'sphere',
    title: 'ตัวนำทรงกลม: E ข้างนอก',
    make: (rng) => {
      const s = condSetup(rng, true);
      const r = s.rOut / 100;
      const ans = Math.abs(P.sphereField('conductor', s.Qsi, s.R, r));
      return {
        prompt: `${s.text} จงหาขนาดของสนามไฟฟ้าที่ระยะ ${s.rOut.toFixed(1)} cm จากจุดศูนย์กลาง`,
        units: U.field,
        answer: ans,
        scale: ans,
        mistakes: [
          { id: 'inverse-r', value: Math.abs(P.pointPotential(s.Qsi, r)) },
          { id: 'used-R', value: P.pointFieldMagnitude(s.Qsi, s.R) },
        ],
        hints: [REGION_FIRST, 'ข้างนอกตัวนำทรงกลม คิดเหมือนจุดประจุที่จุดศูนย์กลาง', String.raw`$E=k|Q|/r^{2}$ แปลง cm เป็น m ก่อน`],
        solution: [
          `${s.rOut.toFixed(1)} cm > ${s.Rcm.toFixed(1)} cm จุดนี้อยู่ข้างนอก คิดเหมือนจุดประจุ`,
          String.raw`$E=\dfrac{k|Q|}{r^{2}}=\dfrac{(${K_TEX})(${Math.abs(s.Q).toFixed(1)}\times10^{-6})}{(${r.toFixed(2)})^{2}}=${tex(ans)}\ \mathrm{N/C}$`,
        ],
      };
    },
  },
  {
    id: 'cond-V-out',
    skill: 'condV',
    title: 'ตัวนำทรงกลม: V ข้างนอก',
    make: (rng) => {
      const s = condSetup(rng, true);
      const r = s.rOut / 100;
      const ans = P.spherePotential('conductor', s.Qsi, s.R, r)!;
      return {
        prompt: `${s.text} จงหาศักย์ไฟฟ้าที่ระยะ ${s.rOut.toFixed(1)} cm จากจุดศูนย์กลาง`,
        units: U.volt,
        answer: ans,
        scale: Math.abs(ans),
        mistakes: [
          { id: 'inverse-r2', value: (P.K * s.Qsi) / (r * r) },
          { id: 'used-R', value: P.pointPotential(s.Qsi, s.R) },
        ],
        hints: [REGION_FIRST, String.raw`ข้างนอก $V=kQ/r$ เก็บเครื่องหมายของ $Q$ ไว้`],
        solution: [
          `${s.rOut.toFixed(1)} cm อยู่ข้างนอก คิดเหมือนจุดประจุ`,
          String.raw`$V=\dfrac{kQ}{r}=\dfrac{(${K_TEX})(${s.Q.toFixed(1)}\times10^{-6})}{${r.toFixed(2)}}=${tex(ans)}\ \mathrm V$`,
        ],
      };
    },
  },
  {
    id: 'cond-E-in',
    skill: 'sphere',
    title: 'ตัวนำทรงกลม: E ข้างใน',
    make: (rng) => {
      const s = condSetup(rng, false);
      const r = s.rIn / 100;
      return {
        prompt: `${s.text} จงหาขนาดของสนามไฟฟ้าที่ระยะ ${s.rIn.toFixed(1)} cm จากจุดศูนย์กลาง`,
        units: U.field,
        answer: P.sphereField('conductor', s.Qsi, s.R, r),
        scale: P.pointFieldMagnitude(s.Qsi, r),
        mistakes: [{ id: 'point-inside', value: P.pointFieldMagnitude(s.Qsi, r) }],
        hints: [REGION_FIRST, `${s.rIn.toFixed(1)} cm < ${s.Rcm.toFixed(1)} cm จุดนี้อยู่ในเนื้อตัวนำ`],
        solution: [
          `${s.rIn.toFixed(1)} cm < ${s.Rcm.toFixed(1)} cm จุดนี้อยู่ **ในเนื้อตัวนำ**`,
          String.raw`ประจุทั้งหมดอยู่ที่ผิว ผิวเกาส์ข้างในไม่ล้อมประจุเลย: $E=0$`,
        ],
      };
    },
  },
  {
    id: 'cond-V-in',
    skill: 'condV',
    title: 'ตัวนำทรงกลม: V ข้างใน',
    make: (rng) => {
      const s = condSetup(rng, true);
      const r = s.rIn / 100;
      const ans = P.spherePotential('conductor', s.Qsi, s.R, r)!;
      return {
        prompt: `${s.text} จงหาศักย์ไฟฟ้าที่ระยะ ${s.rIn.toFixed(1)} cm จากจุดศูนย์กลาง`,
        units: U.volt,
        answer: ans,
        scale: Math.abs(ans),
        mistakes: [
          { id: 'used-r-inside', value: P.pointPotential(s.Qsi, r) },
          { id: 'zero-inside-V', value: 0 },
        ],
        hints: [REGION_FIRST, 'ในเนื้อตัวนำ E = 0 ศักย์จึงคงที่และเท่ากับค่าที่ผิว', String.raw`$V=kQ/R$ (ใช้รัศมีทรงกลม)`],
        solution: [
          `${s.rIn.toFixed(1)} cm อยู่ในเนื้อตัวนำ ศักย์เท่ากับที่ผิว จึงใช้ R = ${s.R.toFixed(2)} m`,
          String.raw`$V=\dfrac{kQ}{R}=\dfrac{(${K_TEX})(${s.Q.toFixed(1)}\times10^{-6})}{${s.R.toFixed(2)}}=${tex(ans)}\ \mathrm V$`,
        ],
      };
    },
  },

  // ---- flux and Gauss
  {
    id: 'flux-tilt',
    skill: 'flux',
    title: 'ฟลักซ์ผ่านแผ่นเอียง',
    make: (rng) => {
      const E = pick(rng, [200, 300, 400, 500, 800]);
      const [w, h] = pick(rng, [
        [0.2, 0.3],
        [0.4, 0.5],
        [0.1, 0.5],
        [0.3, 0.3],
      ] as const);
      const th = pick(rng, [0, 30, 60, 37, 53]);
      const A = w * h;
      const ans = P.fluxUniform(E, A, th);
      return {
        prompt: String.raw`สนามไฟฟ้าสม่ำเสมอขนาด ${E} N/C ชี้ตามแกน $+x$ จงหาฟลักซ์ไฟฟ้าผ่านแผ่นสี่เหลี่ยมเรียบขนาด ${w.toFixed(2)} m × ${h.toFixed(2)} m ที่เวกเตอร์พื้นที่ (เส้นตั้งฉากกับแผ่น) ทำมุม ${th}° กับสนาม`,
        units: U.flux,
        answer: ans,
        scale: E * A,
        mistakes: [
          { id: 'sin-cos', value: P.fluxUniform(E, A, 90 - th) },
          { id: 'no-angle', value: E * A },
        ],
        hints: [String.raw`$\Phi_E=EA\cos\theta$`, String.raw`$A=${w.toFixed(2)}\times${h.toFixed(2)}=${tex(A)}\ \mathrm{m^2}$`],
        solution: [
          String.raw`$A=${w.toFixed(2)}\times${h.toFixed(2)}=${tex(A)}\ \mathrm{m^2}$`,
          String.raw`$\Phi_E=EA\cos\theta=(${E})(${tex(A)})\cos${th}^\circ=${tex(ans)}\ \mathrm{N\,m^2/C}$`,
        ],
      };
    },
  },
  {
    id: 'flux-empty',
    skill: 'flux',
    title: 'ฟลักซ์สุทธิผ่านผิวปิดที่ว่าง',
    make: (rng) => {
      const E = pick(rng, [200, 300, 500, 800]);
      const L = pick(rng, [0.1, 0.2, 0.5]);
      return {
        prompt: `สนามไฟฟ้าสม่ำเสมอขนาด ${E} N/C วางลูกบาศก์ปิด (ผิวสมมติ) ยาวด้านละ ${L.toFixed(1)} m ไว้ในสนามนี้ โดยไม่มีประจุอยู่ข้างใน จงหาฟลักซ์ไฟฟ้าสุทธิผ่านลูกบาศก์`,
        units: U.flux,
        answer: P.netFlux(0),
        scale: E * L * L,
        mistakes: [
          { id: 'outside-field', value: E * L * L },
          { id: 'outside-field', value: 6 * E * L * L },
          { id: 'outside-field', value: 2 * E * L * L },
        ],
        hints: ['กฎของเกาส์: ฟลักซ์สุทธิขึ้นกับประจุภายในเท่านั้น', 'ข้างในไม่มีประจุ'],
        solution: [
          String.raw`$\Phi_E=q_{in}/\varepsilon_0$ และ $q_{in}=0$ จึงได้ $\Phi_E=0$`,
          'เส้นสนามที่เข้าทางหน้าหนึ่งก็ออกทางหน้าตรงข้ามทั้งหมด',
        ],
      };
    },
  },
  {
    id: 'flux-charge',
    skill: 'flux',
    title: 'ฟลักซ์สุทธิจากประจุภายใน',
    make: (rng) => {
      const q = nonzero(rng, -9, 9);
      const out = nonzero(rng, -9, 9);
      const ans = P.netFlux(q * nC);
      return {
        prompt: String.raw`ผิวปิดอันหนึ่งมีจุดประจุ $${s1(q)}$ nC อยู่ข้างใน และมีจุดประจุ $${s1(out)}$ nC อยู่ข้างนอกใกล้ ๆ ผิว จงหาฟลักซ์ไฟฟ้าสุทธิผ่านผิวปิดนี้ (ใช้ $\varepsilon_0=${E0_TEX}$)`,
        units: U.flux,
        answer: ans,
        scale: Math.abs(ans),
        mistakes: [
          { id: 'outside-charge', value: P.netFlux((q + out) * nC) },
          { id: 'used-k', value: P.K * q * nC },
        ],
        hints: ['นับเฉพาะประจุที่อยู่ข้างในผิวปิด', String.raw`$\Phi_E=q_{in}/\varepsilon_0$`],
        solution: [
          'ประจุข้างนอกไม่มีผลต่อฟลักซ์สุทธิ (เส้นสนามของมันเข้าแล้วก็ออก)',
          String.raw`$\Phi_E=\dfrac{q_{in}}{\varepsilon_0}=\dfrac{${s1(q)}\times10^{-9}}{${E0_TEX}}=${tex(ans)}\ \mathrm{N\,m^2/C}$`,
        ],
      };
    },
  },

  // ---- insulating sphere (lecture)
  {
    id: 'ins-out',
    skill: 'sphere',
    title: 'ฉนวนทรงกลม: E ข้างนอก',
    make: (rng) => {
      const a = pick(rng, [0.1, 0.2, 0.05]);
      const Q = pick(rng, [2, 4, 6, 8]);
      const r = a * pick(rng, [2, 3, 1.5]);
      const ans = P.sphereField('insulator', Q * uC, a, r);
      return {
        prompt: String.raw`ฉนวนทรงกลมตันรัศมี ${a.toFixed(2)} m มีประจุ $+${Q}.0\ \mu\mathrm C$ กระจายสม่ำเสมอทั่วปริมาตร จงหาขนาดของสนามไฟฟ้าที่ระยะ ${r.toFixed(3)} m จากจุดศูนย์กลาง`,
        units: U.field,
        answer: ans,
        scale: ans,
        mistakes: [
          { id: 'inverse-r', value: P.pointPotential(Q * uC, r) },
          { id: 'used-R', value: P.pointFieldMagnitude(Q * uC, a) },
        ],
        hints: [REGION_FIRST, 'ข้างนอกทรงกลม ผิวเกาส์ล้อมประจุทั้งหมด จึงเหมือนจุดประจุ'],
        solution: [
          `${r.toFixed(3)} m > ${a.toFixed(2)} m อยู่ข้างนอก ผิวเกาส์ล้อม Q ทั้งหมด`,
          String.raw`$E=\dfrac{kQ}{r^{2}}=\dfrac{(${K_TEX})(${Q}.0\times10^{-6})}{(${r.toFixed(3)})^{2}}=${tex(ans)}\ \mathrm{N/C}$`,
        ],
      };
    },
  },
  {
    id: 'ins-in',
    skill: 'sphere',
    title: 'ฉนวนทรงกลม: E ข้างใน',
    make: (rng) => {
      const a = pick(rng, [0.1, 0.2, 0.4]);
      const Q = pick(rng, [2, 4, 6, 8]);
      const frac = pick(rng, [0.5, 0.25, 0.75]);
      const r = a * frac;
      const ans = P.sphereField('insulator', Q * uC, a, r);
      const qin = P.sphereEnclosedCharge('insulator', Q * uC, a, r);
      return {
        prompt: String.raw`ฉนวนทรงกลมตันรัศมี ${a.toFixed(2)} m มีประจุ $+${Q}.0\ \mu\mathrm C$ กระจายสม่ำเสมอทั่วปริมาตร จงหาขนาดของสนามไฟฟ้าที่ระยะ ${r.toFixed(3)} m จากจุดศูนย์กลาง`,
        units: U.field,
        answer: ans,
        scale: ans,
        mistakes: [
          { id: 'point-inside', value: P.pointFieldMagnitude(Q * uC, r) },
          { id: 'conductor-inside', value: 0 },
        ],
        hints: [
          REGION_FIRST,
          String.raw`ข้างในฉนวน ผิวเกาส์ล้อมประจุแค่สัดส่วนของปริมาตร: $q_{in}=Q\,r^{3}/a^{3}$`,
          String.raw`$E=kq_{in}/r^{2}=kQr/a^{3}$`,
        ],
        solution: [
          `${r.toFixed(3)} m < ${a.toFixed(2)} m อยู่ในเนื้อฉนวน`,
          String.raw`$q_{in}=Q\dfrac{r^{3}}{a^{3}}=${tex(qin)}\ \mathrm C$`,
          String.raw`$E=\dfrac{kQr}{a^{3}}=\dfrac{(${K_TEX})(${Q}.0\times10^{-6})(${r.toFixed(3)})}{(${a.toFixed(2)})^{3}}=${tex(ans)}\ \mathrm{N/C}$`,
        ],
      };
    },
  },
  {
    id: 'ballshell-outer',
    skill: 'shell',
    title: 'ฉนวนในเปลือกตัวนำ: ประจุผิวนอก',
    make: (rng) => {
      const n = pick(rng, [-3, -2, 2, 3, 4]);
      const w = P.shellSurfaceCharges(1, n);
      return {
        prompt: String.raw`ฉนวนทรงกลมรัศมี $a$ มีประจุ $+Q$ กระจายสม่ำเสมอ อยู่ตรงกลางตัวนำทรงกลมกลวง (รัศมีภายใน $b$ ภายนอก $c$) ที่มีประจุสุทธิ $${n > 0 ? '+' : '-'}${Math.abs(n)}Q$ ประจุที่ **ผิวด้านนอก** ของตัวนำเป็นกี่เท่าของ $Q$ (ใส่เครื่องหมายด้วย)`,
        units: U.timesQ,
        answer: w.outer,
        scale: 1,
        mistakes: [
          { id: 'forgot-cavity', value: n },
          { id: 'outer-sign', value: n - 1 },
        ],
        hints: [
          String.raw`ผิวเกาส์ในเนื้อโลหะต้องล้อมประจุรวมเป็นศูนย์ ผิวในจึงมี $-Q$`,
          'ผิวนอก = ประจุสุทธิของเปลือก − ประจุที่ผิวใน',
        ],
        solution: [
          String.raw`ในเนื้อโลหะ $E=0\Rightarrow q_{in}=0$: ผิวในมี $-Q$`,
          String.raw`ผิวนอก $=${n}Q-(-Q)=${w.outer}Q$`,
        ],
      };
    },
  },
  {
    id: 'ballshell-E-out',
    skill: 'shell',
    title: 'ฉนวนในเปลือกตัวนำ: สนามข้างนอก',
    make: (rng) => {
      const n = pick(rng, [-3, -2, 1, 2]);
      const Q = pick(rng, [1, 2, 3]);
      const [a, b, c] = [0.05, 0.1, 0.15];
      const r = pick(rng, [0.2, 0.3, 0.5]);
      const ans = Math.abs(P.ballInShellField(Q * uC, a, n * Q * uC, b, c, r));
      const tot = (1 + n) * Q;
      return {
        prompt: String.raw`ฉนวนทรงกลมรัศมี 0.05 m มีประจุ $+${Q}.0\ \mu\mathrm C$ กระจายสม่ำเสมอ อยู่ตรงกลางตัวนำทรงกลมกลวง (รัศมีภายใน 0.10 m ภายนอก 0.15 m) ที่มีประจุสุทธิ $${s1(n * Q)}\ \mu\mathrm C$ จงหาขนาดของสนามไฟฟ้าที่ระยะ ${r.toFixed(2)} m จากจุดศูนย์กลาง`,
        units: U.field,
        answer: ans,
        scale: ans,
        mistakes: [
          { id: 'only-Q', value: P.pointFieldMagnitude(Q * uC, r) },
          { id: 'only-Q', value: P.pointFieldMagnitude(n * Q * uC, r) },
          { id: 'inverse-r', value: Math.abs(P.pointPotential(tot * uC, r)) },
        ],
        hints: [REGION_FIRST, 'ข้างนอกทั้งหมด ผิวเกาส์ล้อมประจุของฉนวนและของเปลือก', String.raw`$E=k|q_{in}|/r^{2}$`],
        solution: [
          String.raw`${r.toFixed(2)} m อยู่นอกเปลือก: $q_{in}=+${Q}.0${s1(n * Q)}=${s1(tot)}\ \mu\mathrm C$`,
          String.raw`$E=\dfrac{k|q_{in}|}{r^{2}}=\dfrac{(${K_TEX})(${Math.abs(tot).toFixed(1)}\times10^{-6})}{(${r.toFixed(2)})^{2}}=${tex(ans)}\ \mathrm{N/C}$ ชี้${tot > 0 ? 'ออก' : 'เข้า'}`,
        ],
      };
    },
  },

  // ---- point charges (lecture)
  {
    id: 'points-V',
    skill: 'points',
    title: 'ศักย์จากหลายจุดประจุ',
    make: (rng) => {
      const s = pointsSetup(rng);
      const ans = P.potentialAt(s.charges, s.Pt);
      const absSum = P.potentialAt(
        s.charges.map((c) => ({ ...c, q: Math.abs(c.q) })),
        s.Pt,
      );
      return {
        prompt: `${s.text} จงหาศักย์ไฟฟ้าที่จุด P = (${s.a}.0, ${s.b}.0) m`,
        units: U.volt,
        answer: ans,
        scale: absSum,
        mistakes: [{ id: 'abs-values', value: absSum }],
        hints: [
          String.raw`ระยะถึง P: จาก $q_1$ คือ $\sqrt{${s.a}^2+${s.b}^2}=${s.c}$ m, จาก $q_2$ คือ ${s.b} m, จาก $q_3$ คือ ${s.a} m`,
          String.raw`$V=k\sum q_i/r_i$ บวกเลขธรรมดาพร้อมเครื่องหมาย`,
        ],
        solution: [
          String.raw`ระยะถึง P: $r_1=${s.c}$ m, $r_2=${s.b}$ m, $r_3=${s.a}$ m`,
          String.raw`$V=(${K_TEX})\left(\dfrac{${s.q[0]}}{${s.c}}+\dfrac{${s.q[1]}}{${s.b}}+\dfrac{${s.q[2]}}{${s.a}}\right)\times10^{-6}=${tex(ans)}\ \mathrm V$`,
        ],
      };
    },
  },
  {
    id: 'points-W',
    skill: 'points',
    title: 'งานนำประจุมาจากที่ไกลมาก',
    make: (rng) => {
      const s = pointsSetup(rng);
      const q4 = nonzero(rng, -4, 4);
      const V = P.potentialAt(s.charges, s.Pt);
      const ans = P.externalWork(q4 * uC, V);
      return {
        prompt: String.raw`${s.text} จงหางานของแรงภายนอกในการนำจุดประจุ $${s1(q4)}\ \mu\mathrm C$ จากที่ไกลมากมาวางที่จุด P = (${s.a}.0, ${s.b}.0) m`,
        units: U.energy,
        answer: ans,
        scale: Math.abs(ans) || 1e-3,
        mistakes: [],
        hints: [
          String.raw`หา $V_P=k\sum q_i/r_i$ ก่อน (ระยะคือ ${s.c}, ${s.b}, ${s.a} m)`,
          String.raw`ที่ไกลมาก $V=0$ ดังนั้น $W_{ext}=q\,(V_P-0)$`,
        ],
        solution: [
          String.raw`$V_P=(${K_TEX})\left(\dfrac{${s.q[0]}}{${s.c}}+\dfrac{${s.q[1]}}{${s.b}}+\dfrac{${s.q[2]}}{${s.a}}\right)\times10^{-6}=${tex(V)}\ \mathrm V$`,
          String.raw`$W_{ext}=qV_P=(${s1(q4)}\times10^{-6})(${tex(V)})=${tex(ans)}\ \mathrm J$`,
        ],
      };
    },
  },
  {
    id: 'points-U',
    skill: 'points',
    title: 'พลังงานศักย์ของระบบ 3 ประจุ',
    make: (rng) => {
      const s = pointsSetup(rng);
      const ans = P.systemEnergy(s.charges);
      const [q1, q2, q3] = s.q;
      const u12 = P.pairEnergy(q1 * uC, q2 * uC, s.a);
      const u13 = P.pairEnergy(q1 * uC, q3 * uC, s.b);
      return {
        prompt: `${s.text} จงหาพลังงานศักย์ไฟฟ้าของระบบประจุทั้งสามนี้`,
        units: U.energy,
        answer: ans,
        scale: Math.abs(u12) + Math.abs(u13),
        mistakes: [{ id: 'missing-pair', value: u12 + u13 }],
        hints: [
          String.raw`มี 3 คู่: $r_{12}=${s.a}$ m, $r_{13}=${s.b}$ m, $r_{23}=${s.c}$ m`,
          String.raw`$U=k\left(\dfrac{q_1q_2}{r_{12}}+\dfrac{q_1q_3}{r_{13}}+\dfrac{q_2q_3}{r_{23}}\right)$`,
        ],
        solution: [
          String.raw`ระยะของแต่ละคู่: $r_{12}=${s.a}$, $r_{13}=${s.b}$, $r_{23}=${s.c}$ m`,
          String.raw`$U=(${K_TEX})\left(\dfrac{(${q1})(${q2})}{${s.a}}+\dfrac{(${q1})(${q3})}{${s.b}}+\dfrac{(${q2})(${q3})}{${s.c}}\right)\times10^{-12}=${tex(ans)}\ \mathrm J$`,
        ],
      };
    },
  },

  // ---- E from V, ring
  {
    id: 'efromv-Ex',
    skill: 'efromv',
    title: 'หา E_x จาก V(x, y)',
    make: (rng) => {
      const s = polySetup(rng);
      return {
        prompt: `${s.text} จงหาองค์ประกอบ $E_x$ ของสนามไฟฟ้าที่จุด (${s.x}.0, ${s.y}.0) m`,
        units: U.field,
        answer: s.E.x,
        scale: Math.abs(s.E.x),
        mistakes: [
          { id: 'other-component', value: s.E.y },
          { id: 'no-minus', value: -s.E.x },
        ],
        hints: [
          String.raw`$E_x=-\partial V/\partial x$ มอง $y$ เป็นค่าคงที่`,
          String.raw`$\partial V/\partial x=${2 * s.a}xy$`,
        ],
        solution: [
          String.raw`$E_x=-\dfrac{\partial V}{\partial x}=-${2 * s.a}xy$`,
          String.raw`ที่ (${s.x}, ${s.y}): $E_x=-${2 * s.a}(${s.x})(${s.y})=${tex(s.E.x)}\ \mathrm{V/m}$`,
        ],
      };
    },
  },
  {
    id: 'efromv-Ey',
    skill: 'efromv',
    title: 'หา E_y จาก V(x, y)',
    make: (rng) => {
      const s = polySetup(rng);
      return {
        prompt: `${s.text} จงหาองค์ประกอบ $E_y$ ของสนามไฟฟ้าที่จุด (${s.x}.0, ${s.y}.0) m`,
        units: U.field,
        answer: s.E.y,
        scale: Math.abs(s.E.y) || 1,
        mistakes: [
          { id: 'other-component', value: s.E.x },
          { id: 'no-minus', value: -s.E.y },
        ],
        hints: [
          String.raw`$E_y=-\partial V/\partial y$ มอง $x$ เป็นค่าคงที่`,
          String.raw`$\partial V/\partial y=${s.a}x^{2}-${s.b}$`,
        ],
        solution: [
          String.raw`$E_y=-\dfrac{\partial V}{\partial y}=-(${s.a}x^{2}-${s.b})$`,
          String.raw`ที่ (${s.x}, ${s.y}): $E_y=-(${s.a}(${s.x})^{2}-${s.b})=${tex(s.E.y)}\ \mathrm{V/m}$`,
        ],
      };
    },
  },
  {
    id: 'ring-V',
    skill: 'efromv',
    title: 'วงแหวน: V บนแกน',
    make: (rng) => {
      const s = ringSetup(rng);
      const ans = P.ringPotential(s.Qsi, s.a, s.x);
      return {
        prompt: `${s.text} จงหาศักย์ไฟฟ้าบนแกนของวงแหวน ที่ระยะ ${s.x.toFixed(2)} m จากจุดศูนย์กลาง`,
        units: U.volt,
        answer: ans,
        scale: ans,
        mistakes: [
          { id: 'ring-distance', value: P.pointPotential(s.Qsi, s.x) },
          { id: 'inverse-r2', value: (P.K * s.Qsi) / (s.d * s.d) },
        ],
        hints: [
          String.raw`ทุกชิ้นของวงแหวนห่างจากจุดนั้นเท่ากัน: $\sqrt{a^{2}+x^{2}}$`,
          String.raw`$V=kQ/\sqrt{a^{2}+x^{2}}$`,
        ],
        solution: [
          String.raw`ระยะจากทุกชิ้นของวงแหวน: $\sqrt{${s.a.toFixed(2)}^{2}+${s.x.toFixed(2)}^{2}}=${tex(s.d)}$ m`,
          String.raw`$V=\dfrac{kQ}{\sqrt{a^{2}+x^{2}}}=\dfrac{(${K_TEX})(${s.Q}.0\times10^{-9})}{${tex(s.d)}}=${tex(ans)}\ \mathrm V$`,
        ],
      };
    },
  },
  {
    id: 'ring-E',
    skill: 'efromv',
    title: 'วงแหวน: E บนแกน',
    make: (rng) => {
      const s = ringSetup(rng);
      const ans = P.ringField(s.Qsi, s.a, s.x);
      return {
        prompt: `${s.text} จงหาขนาดของสนามไฟฟ้าบนแกนของวงแหวน ที่ระยะ ${s.x.toFixed(2)} m จากจุดศูนย์กลาง`,
        units: U.field,
        answer: ans,
        scale: ans,
        mistakes: [
          { id: 'ring-as-point', value: (P.K * s.Qsi) / (s.d * s.d) },
          { id: 'ring-distance', value: P.pointFieldMagnitude(s.Qsi, s.x) },
        ],
        hints: [
          String.raw`$E_x=-dV/dx$ โดย $V=kQ/\sqrt{a^{2}+x^{2}}$`,
          String.raw`$E_x=\dfrac{kQx}{(a^{2}+x^{2})^{3/2}}$`,
        ],
        solution: [
          String.raw`$\sqrt{a^{2}+x^{2}}=${tex(s.d)}$ m`,
          String.raw`$E_x=\dfrac{kQx}{(a^{2}+x^{2})^{3/2}}=\dfrac{(${K_TEX})(${s.Q}.0\times10^{-9})(${s.x.toFixed(2)})}{(${tex(s.d)})^{3}}=${tex(ans)}\ \mathrm{N/C}$`,
        ],
      };
    },
  },
  {
    id: 'ring-centre',
    skill: 'efromv',
    title: 'วงแหวน: V ที่จุดศูนย์กลาง',
    make: (rng) => {
      const s = ringSetup(rng);
      const ans = P.ringPotential(s.Qsi, s.a, 0);
      return {
        prompt: `${s.text} จงหาศักย์ไฟฟ้าที่จุดศูนย์กลางของวงแหวน`,
        units: U.volt,
        answer: ans,
        scale: ans,
        mistakes: [{ id: 'zero-E-not-zero-V', value: 0 }],
        hints: ['ที่จุดศูนย์กลาง x = 0 สนามเป็นศูนย์ แต่ศักย์ไม่จำเป็นต้องเป็นศูนย์', String.raw`$V=kQ/a$`],
        solution: [
          String.raw`ที่ $x=0$ ทุกชิ้นของวงแหวนห่างเท่ากับ $a$`,
          String.raw`$V=\dfrac{kQ}{a}=\dfrac{(${K_TEX})(${s.Q}.0\times10^{-9})}{${s.a.toFixed(2)}}=${tex(ans)}\ \mathrm V$ (สนามเป็นศูนย์ แต่ศักย์ไม่เป็นศูนย์)`,
        ],
      };
    },
  },

  // ---- two spheres on a wire
  {
    id: 'two-q1',
    skill: 'twoSpheres',
    title: 'สองทรงกลม: ประจุบนลูกที่ 1',
    make: (rng) => {
      const s = twoSetup(rng);
      return {
        prompt: `${s.text} จงหาประจุบนทรงกลมลูกที่ 1`,
        units: U.chargeN,
        answer: s.res.q1,
        scale: s.res.q1,
        mistakes: [
          { id: 'ratio-inverted', value: s.res.q2 },
          { id: 'equal-split', value: (s.Q * nC) / 2 },
        ],
        hints: [
          String.raw`ศักย์เท่ากัน: $kq_1/r_1=kq_2/r_2$ จึงได้ $q_1/q_2=r_1/r_2$`,
          String.raw`$q_1=Q_{\text{รวม}}\cdot\dfrac{r_1}{r_1+r_2}$`,
        ],
        solution: [
          String.raw`ต่อลวดแล้วศักย์เท่ากัน: $q_1/q_2=r_1/r_2=${s.r1}/${s.r2}$`,
          String.raw`$q_1=${s.Q}\times\dfrac{${s.r1}}{${s.r1}+${s.r2}}=${tex(s.res.q1 / nC)}$ nC`,
        ],
      };
    },
  },
  {
    id: 'two-V',
    skill: 'twoSpheres',
    title: 'สองทรงกลม: ศักย์ร่วม',
    make: (rng) => {
      const s = twoSetup(rng);
      return {
        prompt: `${s.text} จงหาศักย์ไฟฟ้าของทรงกลมทั้งสอง (ซึ่งเท่ากัน)`,
        units: U.volt,
        answer: s.res.V,
        scale: s.res.V,
        mistakes: [{ id: 'inverse-r2', value: s.res.E1 }],
        hints: [
          String.raw`หา $q_1=Q_{\text{รวม}}\,r_1/(r_1+r_2)$ ก่อน`,
          String.raw`$V=kq_1/r_1$ (แปลง cm เป็น m)`,
        ],
        solution: [
          String.raw`$q_1=${tex(s.res.q1 / nC)}$ nC`,
          String.raw`$V=\dfrac{kq_1}{r_1}=\dfrac{(${K_TEX})(${tex(s.res.q1)})}{${(s.r1 / 100).toFixed(2)}}=${tex(s.res.V)}\ \mathrm V$`,
        ],
      };
    },
  },
  {
    id: 'two-ratio',
    skill: 'twoSpheres',
    title: 'สองทรงกลม: อัตราส่วนสนามที่ผิว',
    make: (rng) => {
      const s = twoSetup(rng);
      const ans = s.res.E1 / s.res.E2;
      return {
        prompt: String.raw`${s.text} จงหาอัตราส่วนของสนามไฟฟ้าที่ผิว $E_1/E_2$ (ตอบเป็นทศนิยมหรือเศษส่วน)`,
        units: U.ratio,
        answer: ans,
        scale: 1,
        mistakes: [{ id: 'ratio-inverted', value: 1 / ans }],
        hints: [String.raw`ที่ผิว $E=kq/r^{2}=V/r$`, String.raw`$V$ เท่ากัน จึงได้ $E_1/E_2=r_2/r_1$`],
        solution: [
          String.raw`$E=kq/r^{2}=V/r$ และ $V$ เท่ากันทั้งสองลูก`,
          String.raw`$\dfrac{E_1}{E_2}=\dfrac{r_2}{r_1}=\dfrac{${s.r2}}{${s.r1}}=${tex(ans)}$ ลูกเล็กมีสนามแรงกว่า`,
        ],
      };
    },
  },
];
