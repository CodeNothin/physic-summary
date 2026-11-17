// =====================================================================
// Shared pieces of the practice question bank.
//
// The bank is split into files:
//   common.ts         (this file) types, skill list, feedback texts, helpers
//   bankElectric.ts   question generators for chapters 1–2
//   bankMagnetism.ts  question generators for chapter 3
//   questions.ts      joins them, and defines the timed exam sets
//
// A "generator" is a recipe that, given a random-number source, makes
// one problem with fresh numbers: the prompt, the correct answer (always
// computed by src/physics), hints, and a worked solution.
// =====================================================================
import type { KnownMistake } from '../physics/answers';

// ----------------------------------------------------------- skills

/**
 * Every skill tracked in "ความแม่นยำรายทักษะ". Each generator belongs to one.
 * To add a skill: add its id here, then its name and chapter in the two maps below.
 */
export type Skill =
  // chapter 1
  | 'flux'
  | 'sphere'
  | 'sheets'
  | 'shell'
  // chapter 2
  | 'uniform'
  | 'points'
  | 'condV'
  | 'efromv'
  | 'twoSpheres'
  // chapter 3
  | 'magCharge'
  | 'wireForce'
  | 'biotSavart'
  | 'ampere'
  | 'superpose';

export const skillNames: Record<Skill, string> = {
  flux: 'ฟลักซ์และกฎของเกาส์',
  sphere: 'ทรงกลมฉนวน / ตัวนำ (สนาม)',
  sheets: 'แผ่นประจุ (ข้อ 22)',
  shell: 'ตัวนำกลวง (ข้อ 21)',
  uniform: 'สนามสม่ำเสมอ ΔV และงาน (ข้อ 23)',
  points: 'ศักย์และพลังงานของจุดประจุ',
  condV: 'ศักย์ของตัวนำทรงกลม (ข้อ 24–25)',
  efromv: 'หา E จาก V · วงแหวน',
  twoSpheres: 'ทรงกลมสองลูกต่อลวด',
  magCharge: 'แรงบนประจุ · รัศมีวงโคจร (ข้อ 26)',
  wireForce: 'แรงบนลวด · ลวดครึ่งวงกลม',
  biotSavart: 'บิโอต์–ซาวาร์ต · ลวดตรง',
  ampere: 'กฎของแอมแปร์ · ลวดหนา · โซลีนอยด์',
  superpose: 'รวมสนามจากลวดหลายเส้น (ข้อ 27)',
};

/** Which chapter (by id in src/chapters.ts) each skill belongs to. */
export const skillChapter: Record<Skill, string> = {
  flux: 'gauss',
  sphere: 'gauss',
  sheets: 'gauss',
  shell: 'gauss',
  uniform: 'potential',
  points: 'potential',
  condV: 'potential',
  efromv: 'potential',
  twoSpheres: 'potential',
  magCharge: 'magnetism',
  wireForce: 'magnetism',
  biotSavart: 'magnetism',
  ampere: 'magnetism',
  superpose: 'magnetism',
};

// ------------------------------------------------------------ types

/** One choice in the unit drop-down next to the answer box. */
export interface UnitOpt {
  label: string;
  /** multiply the typed number by this to get SI */
  factor: number;
}

/** One concrete question with its numbers already chosen. */
export interface Problem {
  genId: string;
  skill: Skill;
  title: string;
  /** Thai text; $...$ is math, **...** is bold */
  prompt: string;
  /** the first unit is the one used when showing the answer */
  units: UnitOpt[];
  /** correct answer, in SI */
  answer: number;
  /** typical size, used only when the answer is exactly 0 */
  scale: number;
  /** wrong values a typical slip would give, with an id into `mistakeText` */
  mistakes: KnownMistake[];
  /** revealed one at a time by the "คำใบ้" button */
  hints: string[];
  /** worked solution lines, using this problem's numbers */
  solution: string[];
}

export interface Generator {
  /** unique id; the exam sets refer to generators by this id */
  id: string;
  skill: Skill;
  title: string;
  make: (rng: Rng) => Omit<Problem, 'genId' | 'skill' | 'title'>;
}

// --------------------------------------------------- feedback texts

/** Thai feedback shown when an answer matches one of a problem's known mistakes. */
export const mistakeText: Record<string, string> = {
  // chapters 1–2
  'inverse-r': 'ดูเหมือนใช้ 1/r ทั้งที่ต้องใช้ 1/r² — สนามคือ kQ/r² (ส่วน kQ/r เป็นสูตรของศักย์)',
  'inverse-r2': 'ดูเหมือนใช้ 1/r² ทั้งที่ต้องใช้ 1/r — ศักย์คือ kQ/r (ส่วน kQ/r² เป็นสูตรของสนาม)',
  'used-r-inside': 'ในเนื้อตัวนำ ศักย์เท่ากับที่ผิว ต้องแทนรัศมีทรงกลม R ไม่ใช่ระยะ r',
  'zero-inside-V': 'E = 0 ไม่ได้แปลว่า V = 0 ในตัวนำ V เท่ากับค่าที่ผิว',
  'point-inside': 'จุดนี้อยู่ข้างในวัตถุ ใช้สูตรจุดประจุ kQ/r² ตรง ๆ ไม่ได้ เช็กก่อนว่าผิวเกาส์ล้อมประจุเท่าไร',
  'conductor-inside': 'นี่คือฉนวน ไม่ใช่ตัวนำ ประจุกระจายทั่วเนื้อ ข้างในจึงมีสนาม (q_in = Q r³/a³)',
  'used-R': 'ต้องแทนระยะ r ของจุดที่ถาม ไม่ใช่รัศมีทรงกลม R',
  'forgot-cavity': 'ลืมหักประจุที่ผิวใน: q_ผิวนอก = Q_สุทธิ − q_ผิวใน',
  'outer-sign': 'ผิวในมีประจุ −q ดังนั้นผิวนอก = Q − (−q) = Q + q',
  'only-Q': 'ผิวเกาส์ข้างนอกล้อมทั้งประจุในโพรงและประจุของตัวนำ: q_in = q + Q',
  'all-charge': 'จุดนี้อยู่ในเนื้อโลหะ ผิวเกาส์ตรงนี้ล้อมประจุสุทธิเป็นศูนย์',
  'no-half': 'สนามของแผ่นเดียวคือ σ/2ε₀ (มีเลข 2) ไม่ใช่ σ/ε₀',
  'wrong-direction': 'ทิศของสนามในบริเวณนี้ผิด ลองวาดลูกศรของแต่ละแผ่นก่อน: ชี้ออกจากแผ่นบวก ชี้เข้าหาแผ่นลบ',
  'sin-cos': 'ใช้ sin แทน cos — θ คือมุมระหว่าง E กับเวกเตอร์พื้นที่ จึงใช้ cos θ',
  'no-angle': 'ลืมคูณ cos θ',
  'outside-field': 'ผิวปิดที่ไม่มีประจุข้างใน ฟลักซ์สุทธิเป็นศูนย์: เส้นสนามที่เข้าเท่ากับที่ออก',
  'used-k': 'กฎของเกาส์คือ q_in/ε₀ ไม่ใช่ k·q_in',
  'ratio-inverted': 'อัตราส่วนกลับหัว',
  'equal-split': 'ประจุไม่ได้แบ่งเท่ากัน แต่แบ่งตามสัดส่วนของรัศมี',
  'missing-pair': 'ต้องบวกครบทุกคู่ (3 ประจุมี 3 คู่)',
  'abs-values': 'ต้องเก็บเครื่องหมายของประจุไว้ตอนบวก',
  'other-component': 'นั่นคือองค์ประกอบอีกแกนหนึ่ง',
  'no-minus': 'ลืมเครื่องหมายลบ: E = −dV/dx',
  'ring-distance': 'ระยะที่ต้องใช้คือ √(a²+x²) จากชิ้นประจุบนวงแหวนถึงจุดนั้น ไม่ใช่ x',
  'ring-as-point': 'วงแหวนไม่ใช่จุดประจุ: ส่วนด้านข้างหักล้างกัน เหลือแต่ส่วนตามแกน E = kQx/(a²+x²)^(3/2)',
  // chapter 3
  'mev-not-converted': 'ลืมแปลง MeV เป็นจูล: 1 MeV = 10⁶ × 1.60×10⁻¹⁹ J',
  'no-factor-2': 'จาก E_K = ½mv² ได้ v = √(2E_K/m) อย่าลืมเลข 2',
  'sin-for-B': 'แรงแม่เหล็กใช้ sin θ (θ ระหว่าง v กับ B) ไม่ใช่ cos θ',
  'no-sin': 'ลืมคูณ sin θ (มุมระหว่างความเร็วหรือลวดกับ B)',
  'selector-inverted': 'จาก qE = qvB ได้ v = E/B ไม่ใช่ B/E',
  'arc-length': 'ส่วนโค้งไม่ได้ใช้ความยาวโค้ง πR ตรง ๆ: รวม ds × B แล้วเท่ากับลวดตรงที่ต่อปลายทั้งสอง ยาว 2R',
  'infinite-formula': 'ลวดนี้ยาวจำกัด ใช้ μ₀I/4πa (sin θ₁ + sin θ₂) ไม่ใช่สูตรลวดยาวมาก μ₀I/2πa',
  'cos-for-wire': 'มุม θ₁, θ₂ วัดจากเส้นตั้งฉาก จึงใช้ sin ไม่ใช่ cos',
  'no-2pi': 'สนามของลวดยาวคือ μ₀I/(2πr) ตัวหารมี 2π',
  'inverse-r2-wire': 'สนามของลวดยาวลดแบบ 1/r ไม่ใช่ 1/r² (ต่างจากจุดประจุ)',
  'thick-inside-as-outside': 'จุดนี้อยู่ในลวด กระแสที่ทะลุวงมีแค่ I r²/R² ใช้ B = μ₀Ir/(2πR²)',
  'thick-area-wrong': 'กระแสที่ทะลุวงเป็นสัดส่วนกับพื้นที่ (r²/R²) ไม่ใช่รัศมี (r/R)',
  'used-N-not-n': 'ต้องใช้ n = N/ℓ (รอบต่อเมตร) ไม่ใช่ N (จำนวนรอบทั้งหมด)',
  'cm-not-m': 'แปลงความยาวเป็นเมตรก่อน',
  'added-not-subtracted': 'สนามจากสองเส้นในบริเวณนี้ชี้สวนทางกัน ต้องลบกัน ไม่ใช่บวก',
  'subtracted-not-added': 'สนามจากสองเส้นในบริเวณนี้ชี้ทางเดียวกัน ต้องบวกกัน',
  'outside-current': 'กระแสที่อยู่นอกวงไม่นับ นับเฉพาะกระแสที่ทะลุวง',
  'current-sign': 'กระแสที่พุ่งเข้ากระดาษ (⊗) นับเป็นลบเมื่อเดินวงทวนเข็มนาฬิกา',
};

// ------------------------------------------------------------- helpers

/** A source of random numbers in [0, 1). */
export type Rng = () => number;

/**
 * A tiny seeded random-number generator. The same seed always gives the
 * same numbers, so a problem can be re-created from its seed (and tested).
 */
export function mulberry32(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** One random item of a list. */
export const pick = <T,>(rng: Rng, xs: readonly T[]): T => xs[Math.floor(rng() * xs.length)];
/** Random whole number from lo to hi, both included. */
export const int = (rng: Rng, lo: number, hi: number) => lo + Math.floor(rng() * (hi - lo + 1));
/** Random whole number from lo to hi, never 0. */
export const nonzero = (rng: Rng, lo: number, hi: number) => {
  let v = 0;
  while (v === 0) v = int(rng, lo, hi);
  return v;
};
/** "+" or "-" (plain minus, for use inside TeX). */
export const sgn = (x: number) => (x < 0 ? '-' : '+');
/** Signed number with one decimal: "+5.0" / "-20.0". */
export const s1 = (x: number) => `${sgn(x)}${Math.abs(x).toFixed(1)}`;

/** Constants as the worksheet writes them, ready to paste into TeX. */
export const K_TEX = String.raw`9.0\times10^{9}`;
export const E0_TEX = String.raw`8.85\times10^{-12}`;
export const MU0_TEX = String.raw`4\pi\times10^{-7}`;
export const uC = 1e-6;
export const nC = 1e-9;

/** Unit drop-down lists. The first entry is the unit the answer is shown in. */
export const U = {
  field: [{ label: 'N/C', factor: 1 }],
  volt: [
    { label: 'V', factor: 1 },
    { label: 'kV', factor: 1e3 },
  ],
  chargeU: [
    { label: 'μC', factor: 1e-6 },
    { label: 'nC', factor: 1e-9 },
    { label: 'C', factor: 1 },
  ],
  chargeN: [
    { label: 'nC', factor: 1e-9 },
    { label: 'μC', factor: 1e-6 },
    { label: 'C', factor: 1 },
  ],
  energy: [
    { label: 'J', factor: 1 },
    { label: 'mJ', factor: 1e-3 },
    { label: 'μJ', factor: 1e-6 },
  ],
  flux: [{ label: 'N·m²/C', factor: 1 }],
  ratio: [{ label: 'ไม่มีหน่วย', factor: 1 }],
  timesSigma: [{ label: '× σ/ε₀', factor: 1 }],
  timesQ: [{ label: '× Q', factor: 1 }],
  timesV0: [{ label: '× V₀', factor: 1 }],
  // chapter 3
  tesla: [
    { label: 'T', factor: 1 },
    { label: 'mT', factor: 1e-3 },
    { label: 'μT', factor: 1e-6 },
  ],
  force: [
    { label: 'N', factor: 1 },
    { label: 'mN', factor: 1e-3 },
  ],
  length: [
    { label: 'm', factor: 1 },
    { label: 'cm', factor: 1e-2 },
  ],
  speed: [{ label: 'm/s', factor: 1 }],
  teslaMetre: [{ label: 'T·m', factor: 1 }],
  timesMu0I2pi: [{ label: '× μ₀I/2π', factor: 1 }],
} satisfies Record<string, UnitOpt[]>;
