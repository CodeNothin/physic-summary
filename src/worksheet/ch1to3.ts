// =====================================================================
// Worksheet questions 21–27 (chapters 1–3), in the worksheet's own form.
//
// Each question: the worksheet's numbers (`original`), how to pick new
// numbers with the same structure (`random`), and `build`, which writes
// the prompt, answer boxes, hints and solution from those numbers.
// All physics comes from src/physics, never computed here by hand.
//
// Wording follows the worksheet as closely as possible; only numbers
// change. Where a random number could change the "situation" (Q21: the
// point could land outside the shell instead of in the metal), the
// solution handles both cases.
// =====================================================================
import { tex } from '../lib/format';
import * as P from '../physics';
import { K_TEX, U, int, nonzero, pick, uC } from '../practice/common';
import type { Rng } from '../practice/common';
import { defineQuestion } from './types';
import type { Question } from './types';

/** "5.0", "-20.0": one decimal, as the worksheet writes charges. */
const d1 = (x: number) => x.toFixed(1);
/** Same, but always with a sign: "+3.0". */
const sd1 = (x: number) => (x < 0 ? '' : '+') + x.toFixed(1);
/** "σ", "2σ" (coefficient 1 is not written). */
const nSigma = (n: number) => (n === 1 ? String.raw`\sigma` : String.raw`${n}\sigma`);

// ------------------------------------------------------------- Q21
// Hollow conducting sphere with a point charge inside the cavity.

interface Q21 {
  R1: number;
  R2: number;
  /** net charge of the conductor, μC */
  Q: number;
  /** point charge in the cavity, μC */
  q: number;
  /** how far q sits from the centre, m (does not change any answer) */
  d: number;
  /** where part ก asks for E, m */
  r: number;
}

const q21 = defineQuestion<Q21>({
  q: 21,
  chapter: 'gauss',
  title: 'ตัวนำกลวงที่มีจุดประจุในโพรง',
  idea: 'เช็กก่อนว่าจุดอยู่ในเนื้อโลหะหรือไม่ ($E=0$) แล้วใช้ผิวเกาส์ในเนื้อโลหะหาประจุที่ผิวใน',
  lesson: '#/gauss/conductors',
  sheet: [String.raw`\Phi_E=\oint\vec E\cdot d\vec A=\dfrac{q_{in}}{\varepsilon_0}`, String.raw`\vec E=k_e\dfrac{q}{r^2}\hat r`],
  notOnSheet: [
    'ในเนื้อตัวนำ $E=0$ (หลักการ ไม่ใช่สูตร)',
    'ประจุที่ผิวใน $=-q$ และผิวนอก $=Q-q_{\\text{ผิวใน}}$ (ได้จากกฎของเกาส์)',
  ],
  original: { R1: 0.1, R2: 0.14, Q: -20, q: 5, d: 0.05, r: 0.12 },
  random: (rng: Rng) => {
    const [R1, R2] = pick(rng, [
      [0.08, 0.12],
      [0.1, 0.14],
      [0.1, 0.16],
      [0.12, 0.18],
      [0.06, 0.1],
    ] as const);
    const q = nonzero(rng, -9, 9);
    let Q = nonzero(rng, -30, 30);
    while (Q + q === 0) Q = nonzero(rng, -30, 30);
    const d = Math.round(pick(rng, [0.3, 0.4, 0.5, 0.6]) * R1 * 100) / 100;
    // usually in the metal (like the worksheet), sometimes outside
    const r = rng() < 0.7 ? Math.round(((R1 + R2) / 2) * 1000) / 1000 : Math.round((R2 + pick(rng, [0.02, 0.04, 0.06, 0.1])) * 1000) / 1000;
    return { R1, R2, Q, q, d, r };
  },
  build: ({ R1, R2, Q, q, d, r }) => {
    const inMetal = r > R1 && r < R2;
    const E = Math.abs(P.shellField(q * uC, Q * uC, R1, R2, r));
    const walls = P.shellSurfaceCharges(q * uC, Q * uC);
    const field = (charge: number) => Math.abs(P.pointFieldMagnitude(charge * uC, r));
    return {
      prompt: String.raw`ตัวนำไฟฟ้าทรงกลมกลวงรัศมีภายใน $r_1=${R1.toFixed(3)}$ เมตร และรัศมีภายนอก $r_2=${R2.toFixed(3)}$ เมตร มีประจุสุทธิ $Q=${d1(Q)}$ ไมโครคูลอมบ์ ด้านในตัวนำกลวงมีจุดประจุ $q=${d1(q)}$ ไมโครคูลอมบ์ อยู่ห่างจุดศูนย์กลางทรงกลมกลวง (o) เท่ากับ ${d.toFixed(3)} เมตร ดังรูป`,
      figure: { id: 'q21', props: { R1, R2, d } },
      parts: [
        {
          label: 'ก',
          ask: `จงหาขนาดสนามไฟฟ้าที่ระยะห่างจากจุดศูนย์กลางทรงกลมกลวงเท่ากับ ${r.toFixed(3)} เมตร`,
          boxes: [
            {
              kind: 'number',
              label: String.raw`$E$ ที่ $r=${r.toFixed(3)}$ m`,
              units: U.field,
              answer: E,
              scale: field(Math.abs(q) + Math.abs(Q)),
              mistakes: inMetal
                ? [
                    { id: 'all-charge', value: field(q) },
                    { id: 'all-charge', value: field(q + Q) },
                  ]
                : [
                    { id: 'only-Q', value: field(Q) },
                    { id: 'only-Q', value: field(q) },
                    { id: 'inverse-r', value: Math.abs(P.pointPotential((q + Q) * uC, r)) },
                  ],
            },
          ],
        },
        {
          label: 'ข',
          ask: 'จงหาค่าประจุที่ผิวด้านในและที่ผิวด้านนอกตัวนำ',
          boxes: [
            { kind: 'number', label: 'ประจุที่ผิวด้านใน $q_1$', units: U.chargeU, answer: walls.inner, scale: 1e-6, mistakes: [{ id: 'forgot-cavity', value: Q * uC }] },
            {
              kind: 'number',
              label: 'ประจุที่ผิวด้านนอก $q_2$',
              units: U.chargeU,
              answer: walls.outer,
              scale: 1e-6,
              mistakes: [
                { id: 'forgot-cavity', value: Q * uC },
                { id: 'outer-sign', value: (Q - q) * uC },
              ],
            },
          ],
        },
      ],
      hints: [
        String.raw`ก. เทียบ $r$ กับ $r_1=${R1.toFixed(3)}$ และ $r_2=${R2.toFixed(3)}$ ก่อน: จุดนี้อยู่ในโพรง ในเนื้อโลหะ หรือข้างนอก?`,
        inMetal
          ? 'ก. ในเนื้อตัวนำ สนามไฟฟ้าเป็นศูนย์เสมอ'
          : String.raw`ก. ข้างนอก ผิวเกาส์ล้อมทั้ง $q$ และ $Q$: $E=k_e|q+Q|/r^2$`,
        String.raw`ข. สร้างผิวเกาส์ทรงกลมในเนื้อโลหะ ($r_1<r'<r_2$) ตรงนั้น $E=0$ จึงได้ $q_{in}=q_1+q=0$`,
        String.raw`ข. ประจุสุทธิของตัวนำเป็นผลรวมของสองผิว: $Q=q_1+q_2$`,
      ],
      solution: [
        inMetal
          ? String.raw`ก. $r_1<${r.toFixed(3)}<r_2$ จุดนี้อยู่ในเนื้อตัวนำ และสนามไฟฟ้าในตัวนำเป็น 0 จึงได้ $E=0$ N/C (ตำแหน่งของ $q$ ในโพรงไม่มีผล)`
          : String.raw`ก. $${r.toFixed(3)}>r_2$ อยู่นอกตัวนำ ผิวเกาส์ล้อมประจุ $q+Q=${d1(q + Q)}\ \mu\mathrm C$: $E=\dfrac{(${K_TEX})(${d1(Math.abs(q + Q))}\times10^{-6})}{(${r.toFixed(3)})^2}=${tex(E)}$ N/C`,
        String.raw`ข. ผิวเกาส์ทรงกลมรัศมี $r'$ ในเนื้อโลหะ: $\oint\vec E\cdot d\vec A=0=\dfrac{q_{in}}{\varepsilon_0}$ ดังนั้น $q_{in}=q_1+q=0$`,
        String.raw`$q_1=-q=${d1(-q)}\ \mu\mathrm C$`,
        String.raw`$Q=q_1+q_2\ \Rightarrow\ q_2=Q-q_1=${d1(Q)}-(${d1(-q)})=${d1(Q + q)}\ \mu\mathrm C$`,
      ],
    };
  },
});

// ------------------------------------------------------------- Q22
// Two very large parallel sheets, +nσ (left) and −mσ (right).

interface Q22 {
  /** left sheet is +nσ */
  n: number;
  /** right sheet is −mσ */
  m: number;
}

const q22 = defineQuestion<Q22>({
  q: 22,
  chapter: 'gauss',
  title: 'แผ่นประจุใหญ่มาก 2 แผ่น',
  idea: 'แต่ละแผ่นสร้าง $\\sigma/2\\varepsilon_0$ (ชี้ออกจากแผ่นบวก ชี้เข้าแผ่นลบ) แล้วรวมกันแบบเวกเตอร์',
  lesson: '#/gauss/sheets',
  sheet: [String.raw`\Phi_E=\oint\vec E\cdot d\vec A=\dfrac{q_{in}}{\varepsilon_0}`],
  notOnSheet: ['สนามของแผ่นเดียว $E=\\dfrac{\\sigma}{2\\varepsilon_0}$ ต้องหาเองด้วยผิวเกาส์ทรงกระบอก (ไม่อยู่ในชีท)'],
  original: { n: 1, m: 2 },
  random: (rng) => {
    const n = int(rng, 1, 4);
    let m = int(rng, 1, 4);
    while (m === n) m = int(rng, 1, 4);
    return { n, m };
  },
  build: ({ n, m }) => {
    // physics in units of σ/ε0: put σ = ε0 so twoSheets returns multiples of σ/ε0
    const res = P.twoSheets(n * P.EPS0, -m * P.EPS0);
    const ans = Math.abs(res.middle.net);
    return {
      prompt: String.raw`แผ่นประจุขนาดใหญ่มาก 2 แผ่น มีความหนาแน่นประจุ $+${nSigma(n)}$ และ $-${nSigma(m)}$ ตามลำดับ วางขนานกันดังรูป จงหาขนาดของสนามไฟฟ้าที่ตำแหน่งใด ๆ ระหว่างแผ่นประจุทั้งสอง`,
      figure: { id: 'q22', props: { n, m } },
      parts: [
        {
          label: '',
          ask: '',
          boxes: [
            {
              kind: 'number',
              label: 'ขนาดสนามระหว่างแผ่น (ตอบเป็นจำนวนเท่าของ $\\sigma/\\varepsilon_0$ เช่น 3/2)',
              units: U.timesSigma,
              answer: ans,
              scale: 1,
              mistakes: [
                { id: 'no-half', value: n + m },
                { id: 'wrong-direction', value: Math.abs(n - m) / 2 },
              ],
            },
          ],
        },
      ],
      hints: [
        String.raw`สนามของแผ่นเดียวหาจากผิวเกาส์ทรงกระบอกที่ทะลุแผ่น: $EA+0+EA=\sigma A/\varepsilon_0$ ได้ $E=\sigma/2\varepsilon_0$`,
        'ทิศ: ชี้ออกจากแผ่นบวก ชี้เข้าหาแผ่นลบ วาดลูกศรของแต่ละแผ่นในช่องระหว่างแผ่น',
        'ระหว่างแผ่น ลูกศรจากแผ่นบวก (ซ้าย) ชี้ไปทางขวา ลูกศรจากแผ่นลบ (ขวา) ก็ชี้ไปทางขวา จึงบวกกัน',
      ],
      solution: [
        String.raw`ผิวเกาส์ทรงกระบอกหน้าตัด $A$ ทะลุแผ่นซ้าย: $EA+0+EA=\dfrac{${nSigma(n)}\,A}{\varepsilon_0}$ ได้ $E_+=\dfrac{${nSigma(n)}}{2\varepsilon_0}$ ชี้ออกจากแผ่น`,
        String.raw`ในทำนองเดียวกัน แผ่นขวา: $E_-=\dfrac{${nSigma(m)}}{2\varepsilon_0}$ ชี้เข้าหาแผ่นลบ`,
        String.raw`ระหว่างแผ่น ทั้งสองชี้ไปทางขวา: $E=\dfrac{${nSigma(n)}}{2\varepsilon_0}+\dfrac{${nSigma(m)}}{2\varepsilon_0}=\dfrac{${n + m}\sigma}{2\varepsilon_0}=${tex(ans)}\,\dfrac{\sigma}{\varepsilon_0}$`,
      ],
    };
  },
});

// ------------------------------------------------------------- Q23
// Uniform field E = Ex î + Ey ĵ; V_A − V_B, then the external work A → B.

interface Q23 {
  Ex: number;
  Ey: number;
  A: { x: number; y: number };
  B: { x: number; y: number };
  /** charge carried from A to B, μC */
  q: number;
}

const q23 = defineQuestion<Q23>({
  q: 23,
  chapter: 'potential',
  title: 'สนามสม่ำเสมอ: ความต่างศักย์และงาน',
  idea: '$\\Delta V=-\\vec E\\cdot\\vec S$ แล้ว $W_{ext}=q\\,\\Delta V$ ระวังว่าโจทย์ถาม $V_A-V_B$',
  lesson: '#/potential/uniform',
  sheet: [String.raw`\Delta V=-\int_A^B\vec E\cdot d\vec s`, String.raw`W_{ext}=q\Delta V`],
  notOnSheet: ['สนามคงที่ ดึง $\\vec E$ ออกนอกอินทิกรัลได้: $\\Delta V=-\\vec E\\cdot(\\vec r_B-\\vec r_A)$'],
  original: { Ex: 3, Ey: -4, A: { x: 2, y: 2 }, B: { x: 3, y: 5 }, q: 3 },
  random: (rng) => {
    const Ex = nonzero(rng, -6, 6);
    const Ey = nonzero(rng, -6, 6);
    let A = { x: 0, y: 0 };
    let B = { x: 0, y: 0 };
    while (P.deltaVUniform({ x: Ex, y: Ey }, A, B) === 0) {
      A = { x: int(rng, 0, 6), y: int(rng, 0, 6) };
      B = { x: int(rng, 0, 6), y: int(rng, 0, 6) };
    }
    return { Ex, Ey, A, B, q: nonzero(rng, -5, 5) };
  },
  build: ({ Ex, Ey, A, B, q }) => {
    const dV = P.deltaVUniform({ x: Ex, y: Ey }, A, B); // V_B − V_A
    const W = P.externalWork(q * uC, dV);
    const S = { x: B.x - A.x, y: B.y - A.y };
    const pt = (p: { x: number; y: number }) => `(${d1(p.x)}, ${d1(p.y)})`;
    const vec = (x: number, y: number) => String.raw`${x}\,\hat i${y < 0 ? '-' : '+'}${Math.abs(y)}\,\hat j`;
    return {
      prompt: String.raw`พิจารณาบริเวณที่มีสนามไฟฟ้าคงตัวสม่ำเสมอ $\vec E=${d1(Ex)}\,\hat i${Ey < 0 ? '-' : '+'}${d1(Math.abs(Ey))}\,\hat j$ นิวตันต่อคูลอมบ์`,
      parts: [
        {
          label: 'ก',
          ask: `จงหาความต่างศักย์ $V_A-V_B$ เมื่อตำแหน่ง A อยู่ที่ ${pt(A)} เมตร และตำแหน่ง B อยู่ที่ ${pt(B)} เมตร`,
          boxes: [{ kind: 'number', label: '$V_A-V_B$', units: U.volt, answer: -dV, scale: 1, mistakes: [] }],
        },
        {
          label: 'ข',
          ask: `จงหางานของแรงภายนอก ในการนำจุดประจุ $${sd1(q)}$ ไมโครคูลอมบ์ จากตำแหน่ง A ไปตำแหน่ง B ด้วยความเร็วคงที่`,
          boxes: [{ kind: 'number', label: '$W_{ext}$', units: U.energy, answer: W, scale: Math.abs(W) || 1e-6, mistakes: [] }],
        },
      ],
      hints: [
        String.raw`$V_B-V_A=-\int_A^B\vec E\cdot d\vec s=-\vec E\cdot(\vec r_B-\vec r_A)$ เพราะ $\vec E$ คงที่`,
        String.raw`โจทย์ถาม $V_A-V_B$ ซึ่งเท่ากับ $+\vec E\cdot(\vec r_B-\vec r_A)$`,
        String.raw`ข. $W_{ext}=q\,(V_B-V_A)$ ระวังลำดับ: ปลาย ลบ ต้น`,
      ],
      solution: [
        String.raw`ก. $V_A-V_B=\vec E\cdot(\vec r_B-\vec r_A)=(${vec(Ex, Ey)})\cdot(${vec(S.x, S.y)})$`,
        String.raw`$=(${Ex})(${S.x})+(${Ey})(${S.y})=${-dV}$ V`,
        String.raw`ข. $W_{ext}=q(V_B-V_A)=(${d1(q)}\times10^{-6})(${dV})=${tex(W)}$ J`,
      ],
    };
  },
});

// ------------------------------------------------------------- Q24
// Solid conducting sphere, all symbols: V0 measured at r = R/m.

interface Q24 {
  /** V0 is measured at r = R/m (inside the metal) */
  m: number;
  /** part ข asks for V at r = nR */
  n: number;
}

const q24 = defineQuestion<Q24>({
  q: 24,
  chapter: 'potential',
  title: 'ตัวนำทรงกลม (ตัวแปรล้วน)',
  idea: 'ในตัวนำ $V$ เท่ากันทั้งก้อน และเท่ากับที่ผิว $k_eQ/R$',
  lesson: '#/potential/condV',
  sheet: [String.raw`V=k_e\dfrac{q}{r}`],
  notOnSheet: [
    'ในตัวนำ $V$ เท่ากันทุกจุด และเท่ากับที่ผิว (หลักการ)',
    'ชีทให้ $k_e=9\\times10^9$ เป็นตัวเลข ส่วนความสัมพันธ์ $k_e=\\dfrac{1}{4\\pi\\varepsilon_0}$ ต้องรู้เอง',
  ],
  original: { m: 3, n: 6 },
  random: (rng) => ({ m: int(rng, 2, 5), n: int(rng, 2, 9) }),
  build: ({ m, n }) => {
    // the physics module checks the ratios with real numbers: R = 1 m, V0 = 1 V
    const Q = P.chargeFromSpherePotential(1, 1);
    const atR = P.spherePotential('conductor', Q, 1, 1)!; // in units of V0
    const atNR = P.spherePotential('conductor', Q, 1, n)!;
    return {
      prompt: String.raw`ตัวนำทรงกลมตันรัศมี $R$ มีประจุสุทธิเป็นบวก ที่ระยะห่างจากจุดศูนย์กลาง ($r$) เท่ากับ $\dfrac{R}{${m}}$ วัดค่าศักย์ไฟฟ้าภายในเนื้อตัวนำได้เป็น $V_0$ จงหา`,
      parts: [
        {
          label: 'ก',
          ask: 'ค่าประจุสุทธิ',
          boxes: [
            {
              kind: 'choice',
              label: 'ประจุสุทธิ $Q$',
              options: [
                { tex: String.raw`Q=4\pi\varepsilon_0RV_0` },
                { tex: String.raw`Q=4\pi\varepsilon_0\dfrac{R}{${m}}V_0`, mistake: 'used-r-inside' },
                { tex: String.raw`Q=4\pi\varepsilon_0R^{2}V_0`, mistake: 'used-field-formula' },
                { tex: String.raw`Q=\dfrac{RV_0}{4\pi\varepsilon_0}`, mistake: 'k-inverted' },
              ],
            },
          ],
        },
        {
          label: 'ข',
          ask: String.raw`ศักย์ไฟฟ้าที่ $r=R$ และ $r=${n}R$ ในรูปของตัวแปร $V_0$`,
          boxes: [
            { kind: 'number', label: '$V(r=R)$', units: U.timesV0, answer: atR, scale: 1, mistakes: [] },
            { kind: 'number', label: String.raw`$V(r=${n}R)$ (ตอบเป็นเศษส่วนได้ เช่น 1/${n})`, units: U.timesV0, answer: atNR, scale: 1, mistakes: [{ id: 'inverse-r2', value: 1 / (n * n) }] },
          ],
        },
      ],
      hints: [
        String.raw`$r=R/${m}$ อยู่ในเนื้อตัวนำ ศักย์ตรงนั้นเท่ากับศักย์ที่ผิว: $V_0=V(R)$`,
        String.raw`ที่ผิว $V(R)=k_e\dfrac{Q}{R}=\dfrac{1}{4\pi\varepsilon_0}\dfrac{Q}{R}$ แก้หา $Q$`,
        String.raw`ข้างนอก $V=k_eQ/r$ แทน $Q$ จากข้อ ก`,
      ],
      solution: [
        String.raw`ก. ศักย์ที่ผิวเท่ากับศักย์ในเนื้อตัวนำ: $V(r=R)=V(r=R/${m})=V_0$`,
        String.raw`$V_0=\dfrac{1}{4\pi\varepsilon_0}\dfrac{Q}{R}\ \Rightarrow\ Q=4\pi\varepsilon_0RV_0$`,
        String.raw`ข. $V(r=R)=V_0$ (ผิวตัวนำ)`,
        String.raw`$V(r=${n}R)=\dfrac{1}{4\pi\varepsilon_0}\dfrac{Q}{${n}R}=\dfrac{1}{4\pi\varepsilon_0}\dfrac{4\pi\varepsilon_0RV_0}{${n}R}=\dfrac{V_0}{${n}}$`,
      ],
    };
  },
});

// ------------------------------------------------------------- Q25
// Solid conducting sphere with numbers: E and V outside and inside.

interface Q25 {
  /** radius, cm */
  Rcm: number;
  /** charge, μC */
  Q: number;
  /** the point outside, cm */
  rOut: number;
  /** the point inside, cm */
  rIn: number;
}

const q25 = defineQuestion<Q25>({
  q: 25,
  chapter: 'potential',
  title: 'ตัวนำทรงกลม (ตัวเลข)',
  idea: 'ข้างนอกเหมือนจุดประจุ ข้างใน $E=0$ และ $V=k_eQ/R$',
  lesson: '#/potential/condV',
  sheet: [String.raw`\vec E=k_e\dfrac{q}{r^2}\hat r`, String.raw`V=k_e\dfrac{q}{r}`],
  notOnSheet: ['ข้างในตัวนำ $E=0$ และ $V$ เท่ากับที่ผิว (แทน $R$ ไม่ใช่ $r$)'],
  original: { Rcm: 10, Q: 4, rOut: 14, rIn: 5 },
  random: (rng) => {
    const Rcm = pick(rng, [5, 8, 10, 12, 15, 20]);
    return {
      Rcm,
      Q: pick(rng, [1.5, 2, 3, 4, 5, 6, 8]),
      rOut: Rcm + pick(rng, [2, 4, 5, 6, 10]),
      rIn: Rcm - pick(rng, [1, 2, 3, 4].filter((x) => x < Rcm - 1)),
    };
  },
  build: ({ Rcm, Q, rOut, rIn }) => {
    const R = Rcm / 100;
    const Qsi = Q * uC;
    const ro = rOut / 100;
    const ri = rIn / 100;
    const Eo = P.sphereField('conductor', Qsi, R, ro);
    const Vo = P.spherePotential('conductor', Qsi, R, ro)!;
    const Ei = P.sphereField('conductor', Qsi, R, ri);
    const Vi = P.spherePotential('conductor', Qsi, R, ri)!;
    return {
      prompt: String.raw`ตัวนำไฟฟ้าทรงกลมตันมีรัศมี ${d1(Rcm)} เซนติเมตร และมีประจุขนาด ${d1(Q)} ไมโครคูลอมบ์ จงหาขนาดของสนามไฟฟ้าและศักย์ไฟฟ้า ณ ตำแหน่ง ${d1(rOut)} และ ${d1(rIn)} เซนติเมตร จากจุดศูนย์กลางของตัวนำไฟฟ้าทรงกลมดังกล่าว`,
      parts: [
        {
          label: '',
          ask: `ที่ ${d1(rOut)} cm`,
          boxes: [
            { kind: 'number', label: `$E$ ที่ ${d1(rOut)} cm`, units: U.field, answer: Eo, scale: Eo, mistakes: [{ id: 'inverse-r', value: Vo }, { id: 'used-R', value: P.pointFieldMagnitude(Qsi, R) }] },
            { kind: 'number', label: `$V$ ที่ ${d1(rOut)} cm`, units: U.volt, answer: Vo, scale: Vo, mistakes: [{ id: 'inverse-r2', value: Eo }, { id: 'used-R', value: P.pointPotential(Qsi, R) }] },
          ],
        },
        {
          label: '',
          ask: `ที่ ${d1(rIn)} cm`,
          boxes: [
            { kind: 'number', label: `$E$ ที่ ${d1(rIn)} cm`, units: U.field, answer: Ei, scale: Eo, mistakes: [{ id: 'point-inside', value: P.pointFieldMagnitude(Qsi, ri) }] },
            {
              kind: 'number',
              label: `$V$ ที่ ${d1(rIn)} cm`,
              units: U.volt,
              answer: Vi,
              scale: Vi,
              mistakes: [
                { id: 'used-r-inside', value: P.pointPotential(Qsi, ri) },
                { id: 'zero-inside-V', value: 0 },
              ],
            },
          ],
        },
      ],
      hints: [
        String.raw`${d1(rOut)} cm อยู่นอกทรงกลม: ใช้สูตรจุดประจุ $E=k_eQ/r^2$, $V=k_eQ/r$`,
        String.raw`${d1(rIn)} cm อยู่ในเนื้อตัวนำ: $E=0$`,
        String.raw`ในตัวนำ $V$ เท่ากับที่ผิว: แทน $r=R=${(R).toFixed(2)}$ m ไม่ใช่ $${(ri).toFixed(2)}$ m`,
      ],
      solution: [
        String.raw`ที่ ${d1(rOut)} cm: $E=k_e\dfrac{Q}{r^2}=9\times10^{9}\dfrac{${d1(Q)}\times10^{-6}}{(${ro.toFixed(2)})^2}=${tex(Eo)}$ N/C`,
        String.raw`$V=k_e\dfrac{Q}{r}=9\times10^{9}\dfrac{${d1(Q)}\times10^{-6}}{${ro.toFixed(2)}}=${tex(Vo)}$ V`,
        String.raw`ที่ ${d1(rIn)} cm: อยู่ในเนื้อตัวนำ สนามไฟฟ้าเป็น 0`,
        String.raw`ศักย์ในตัวนำเท่ากับที่ผิว ($r=${R.toFixed(2)}$ m): $V=9\times10^{9}\dfrac{${d1(Q)}\times10^{-6}}{${R.toFixed(2)}}=${tex(Vi)}$ V`,
      ],
    };
  },
});

// ------------------------------------------------------------- Q26
// Proton with kinetic energy K (MeV) in a perpendicular field B.

interface Q26 {
  /** kinetic energy, MeV */
  K: number;
  /** field, T */
  B: number;
}

/** The worksheet's proton mass for this question (the exam sheet says 1.67e-27; Q26 gives its own). */
const Q26_MASS = 1.66e-27;

const q26 = defineQuestion<Q26>({
  q: 26,
  chapter: 'magnetism',
  title: 'โปรตอนวิ่งในสนามแม่เหล็ก',
  idea: 'แรงแม่เหล็กเป็นแรงสู่ศูนย์กลาง $qvB=mv^2/r$ และ $E_K=\\tfrac12mv^2$',
  lesson: '#/magnetism/m-force',
  sheet: [String.raw`\vec F_B=q\vec v\times\vec B`, String.raw`1\ \mathrm{eV}=1.6\times10^{-19}\ \mathrm J`],
  notOnSheet: [
    'พลังงานจลน์ $E_K=\\tfrac12mv^2$ และแรงสู่ศูนย์กลาง $F=mv^2/r$ (ฟิสิกส์ ม.ปลาย ไม่อยู่ในชีท)',
    'ผลที่ได้ $r=\\dfrac{mv}{qB}=\\dfrac{\\sqrt{2mE_K}}{qB}$ ต้องหาเอง',
    'ใช้มวลที่โจทย์ให้ ($1.66\\times10^{-27}$ kg) ไม่ใช่ $m_p$ ในชีท',
  ],
  original: { K: 5, B: 0.33 },
  random: (rng) => ({ K: pick(rng, [1, 2, 3, 4, 5, 6, 8, 10]), B: pick(rng, [0.2, 0.25, 0.3, 0.33, 0.4, 0.5, 0.6]) }),
  build: ({ K, B }) => {
    const KJ = K * P.MEV;
    const v = P.speedFromKineticEnergy(Q26_MASS, KJ);
    const r = P.orbitRadius(Q26_MASS, v, P.E_CHARGE, B);
    return {
      prompt: String.raw`โปรตอนตัวหนึ่งมีพลังงานจลน์ ${d1(K)} เมกะอิเล็กตรอนโวลต์ เคลื่อนที่เข้าไปในบริเวณที่มีสนามแม่เหล็กขนาด ${B} เทสลา ตั้งฉากกับระนาบการเคลื่อนที่ของโปรตอน จงหารัศมีความโค้งของเส้นทางการเคลื่อนที่ของโปรตอน กำหนดให้มวลของโปรตอนเท่ากับ $1.66\times10^{-27}$ กิโลกรัม`,
      parts: [
        {
          label: '',
          ask: '',
          boxes: [
            {
              kind: 'number',
              label: 'รัศมีความโค้ง $r$',
              units: U.length,
              answer: r,
              scale: r,
              mistakes: [
                { id: 'mev-not-converted', value: P.orbitRadiusFromKineticEnergy(Q26_MASS, K * 1e6, P.E_CHARGE, B) },
                { id: 'no-factor-2', value: Math.sqrt(Q26_MASS * KJ) / (P.E_CHARGE * B) },
              ],
            },
          ],
        },
      ],
      hints: [
        String.raw`แปลงพลังงาน: $E_K=${d1(K)}\times10^{6}\times1.60\times10^{-19}$ J`,
        String.raw`แรงแม่เหล็กทำหน้าที่เป็นแรงสู่ศูนย์กลาง: $qvB=\dfrac{mv^2}{r}\ \Rightarrow\ r=\dfrac{mv}{qB}$`,
        String.raw`จาก $E_K=\tfrac12mv^2$ ได้ $mv=\sqrt{2mE_K}$`,
      ],
      solution: [
        String.raw`จาก $E_K=\tfrac12mv^2$ และ $qvB=\dfrac{mv^2}{r}$`,
        String.raw`$r=\dfrac{mv}{qB}=\dfrac{\sqrt{2mE_K}}{qB}=\dfrac{\sqrt{2(1.66\times10^{-27})(${d1(K)}\times10^{6})(1.60\times10^{-19})}}{(1.60\times10^{-19})(${B})}$`,
        String.raw`$r=${tex(r)}$ m`,
      ],
    };
  },
});

// ------------------------------------------------------------- Q27
// Two long wires parallel to z: A through (0, a) with I along +k̂,
// B through (b, 0) with nB·I along −k̂. Field at the origin.

interface Q27 {
  a: number;
  b: number;
  /** wire A carries nA·I */
  nA: number;
  /** wire B carries nB·I */
  nB: number;
}

const q27 = defineQuestion<Q27>({
  q: 27,
  chapter: 'magnetism',
  title: 'ลวดยาวมาก 2 เส้นแนวแกน z',
  idea: 'แต่ละเส้นให้ $\\mu_0I/2\\pi r$ ทิศจากกฎมือขวา แล้วบวกแบบเวกเตอร์',
  lesson: '#/magnetism/m-wires',
  sheet: [String.raw`\text{ลวดตรงยาวมาก: }B=\dfrac{\mu_0I}{2\pi a}`, String.raw`\oint\vec B\cdot d\vec s=\mu_0I_{\text{enclosed}}`],
  notOnSheet: ['ทิศของ $\\vec B$: กำมือขวา นิ้วโป้งตามกระแส (หรือ ทิศกระแส × ทิศจากลวดไปยังจุด)'],
  original: { a: 3, b: 4, nA: 1, nB: 2 },
  random: (rng) => ({ a: int(rng, 2, 6), b: int(rng, 2, 6), nA: int(rng, 1, 3), nB: int(rng, 1, 3) }),
  build: ({ a, b, nA, nB }) => {
    const unit = P.MU0 / (2 * Math.PI); // μ0I/2π with I = 1 A
    const BA = P.lineCurrentsField([{ x: 0, y: a, I: nA }], { x: 0, y: 0 });
    const BB = P.lineCurrentsField([{ x: b, y: 0, I: -nB }], { x: 0, y: 0 });
    const Bx = (BA.x + BB.x) / unit;
    const By = (BA.y + BB.y) / unit;
    const nI = (n: number) => (n === 1 ? 'I' : `${n}I`);
    const frac = (n: number, d: number) => String.raw`\dfrac{${n}}{${d}}`;
    return {
      prompt: String.raw`เส้นลวดตรงยาวมาก 2 เส้นวางขนานกับแกน $z$ โดยลวด A มีกระแส $${nI(nA)}$ ไหลตามทิศ $+\hat k$ และเส้นลวด B มีกระแส $${nI(nB)}$ ไหลตามทิศ $-\hat k$ ดังรูป กำหนดให้ $a=${a}$ และ $b=${b}$ จงหาสนามแม่เหล็กที่ตำแหน่ง (0,0,0) เมตร`,
      figure: { id: 'q27', props: { a, b } },
      parts: [
        {
          label: '',
          ask: String.raw`ตอบในรูป $\vec B=\dfrac{\mu_0I}{2\pi}\left(\square\,\hat i+\square\,\hat j\right)$ (ใส่เศษส่วนได้ เช่น 1/3)`,
          boxes: [
            { kind: 'number', label: 'ตัวเลขหน้า $\\hat i$', units: U.timesMu0I2pi, answer: Bx, scale: 1, mistakes: [{ id: 'other-component', value: By }] },
            { kind: 'number', label: 'ตัวเลขหน้า $\\hat j$', units: U.timesMu0I2pi, answer: By, scale: 1, mistakes: [{ id: 'other-component', value: Bx }] },
          ],
        },
      ],
      hints: [
        String.raw`ลวด A ห่างจุดกำเนิด $a=${a}$ m ลวด B ห่าง $b=${b}$ m แต่ละเส้นให้ $B=\mu_0(\text{กระแส})/2\pi r$`,
        String.raw`ทิศ: (ทิศกระแส) × (ทิศจากลวดไปยังจุด) ลวด A: $\hat k\times(-\hat j)=+\hat i$`,
        String.raw`ลวด B: $(-\hat k)\times(-\hat i)=+\hat j$`,
      ],
      solution: [
        String.raw`ลวด A: $\vec B_A=\dfrac{\mu_0(${nI(nA)})}{2\pi(${a})}\,\hat i$`,
        String.raw`ลวด B: $\vec B_B=\dfrac{\mu_0(${nI(nB)})}{2\pi(${b})}\,\hat j$`,
        String.raw`$\vec B_{net}=\vec B_A+\vec B_B=\dfrac{\mu_0I}{2\pi}\left(${frac(nA, a)}\,\hat i+${frac(nB, b)}\,\hat j\right)=\dfrac{\mu_0I}{2\pi}\left(${tex(Bx)}\,\hat i+${tex(By)}\,\hat j\right)$`,
      ],
    };
  },
});

/** Q21–27 in order. */
export const ch1to3Questions: Question[] = [q21, q22, q23, q24, q25, q26, q27];

