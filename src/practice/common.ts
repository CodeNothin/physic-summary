// =====================================================================
// Shared pieces of the practice question bank.
//
// The bank is split into files:
//   common.ts         (this file) types, skill list, feedback texts, helpers
//   bankElectric.ts   question generators for chapters 1–2
//   bankMagnetism.ts  question generators for chapter 3
//   bankFaraday.ts    question generators for chapter 4
//   bankEmwave.ts     question generators for chapter 5
//   bankLight.ts      question generators for chapter 6
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
  | 'superpose'
  // chapter 4
  | 'faradayFlux'
  | 'motional'
  | 'rl'
  // chapter 5
  | 'emWave'
  | 'emIntensity'
  | 'radPressure'
  // chapter 6
  | 'refraction'
  | 'interference'
  | 'diffraction'
  | 'polarization';

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
  faradayFlux: 'ฟลักซ์แม่เหล็ก · กฎของฟาราเดย์',
  motional: 'emf จากการเคลื่อนที่ Bℓv · ขดลวดผ่านสนาม',
  rl: 'วงจร RL (ข้อ 28)',
  emWave: 'คลื่นระนาบ E/B = c · λ และ f (ข้อ 30)',
  emIntensity: 'ความเข้มและพลังงานของคลื่น (ข้อ 29)',
  radPressure: 'ความดันรังสีและโมเมนตัม',
  refraction: 'การหักเห · มุมวิกฤต · แผ่นพลาสติก (ข้อ 33)',
  interference: 'สลิตคู่: ตำแหน่งแถบและความเข้ม (ข้อ 31–32)',
  diffraction: 'สลิตเดี่ยว · เรย์ลี · เกรตติง',
  polarization: 'โพลาไรเซชัน · มาลุส · บริวสเตอร์',
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
  faradayFlux: 'faraday',
  motional: 'faraday',
  rl: 'faraday',
  emWave: 'emwave',
  emIntensity: 'emwave',
  radPressure: 'emwave',
  refraction: 'light',
  interference: 'light',
  diffraction: 'light',
  polarization: 'light',
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
  /** worksheet question (21–40) this is one piece of; set in questions.ts (`wsOf`) */
  ws?: number;
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
  'zero-E-not-zero-V': 'E = 0 ไม่ได้แปลว่า V = 0: ที่จุดนี้สนามจากแต่ละชิ้นหักล้างกัน แต่ศักย์เป็นสเกลาร์ บวกกันได้ kQ/a',
  'outside-charge': 'ประจุที่อยู่ข้างนอกผิวปิดไม่นับ: เส้นสนามของมันเข้าแล้วก็ออก ฟลักซ์สุทธิ = q_in/ε₀',
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
  'no-minus': 'ลืมเครื่องหมายลบ: Eₓ = −∂V/∂x และ E_y = −∂V/∂y',
  'ring-distance': 'ระยะที่ต้องใช้คือ √(a²+x²) จากชิ้นประจุบนวงแหวนถึงจุดนั้น ไม่ใช่ x',
  'ring-as-point': 'วงแหวนไม่ใช่จุดประจุ: ส่วนด้านข้างหักล้างกัน เหลือแต่ส่วนตามแกน E = kQx/(a²+x²)^(3/2)',
  // worksheet multiple choice (ตัวอย่างข้อสอบ)
  'used-field-formula': 'นั่นมาจากสูตรสนาม kQ/r² แต่โจทย์ให้ศักย์ ต้องใช้ V = kQ/r',
  'k-inverted': 'k_e = 1/(4πε₀) ดังนั้น Q = RV₀/k_e = 4πε₀RV₀ (4πε₀ อยู่ด้านบน)',
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
  // chapter 4
  'angle-to-plane': 'มุมที่ให้วัดจากระนาบของขด แต่ θ ใน Φ = BA cos θ วัดจากเวกเตอร์พื้นที่ (ตั้งฉากกับระนาบ) จึงต้องใช้ 90° − มุมนั้น',
  'flux-not-change': 'ε ขึ้นกับการเปลี่ยนแปลงของฟลักซ์ ΔΦ = Φ_หลัง − Φ_ก่อน ไม่ใช่ฟลักซ์ค่าสุดท้าย',
  'area-cm2': 'แปลงพื้นที่เป็น m² ก่อน: 1 cm² = 10⁻⁴ m²',
  'emf-while-inside': 'ตอนขดลวดอยู่ในสนามทั้งขด ฟลักซ์คงที่ จึงได้ ε = 0 (emf เกิดเฉพาะตอนเข้าหรือออก)',
  'gave-current': 'นั่นคือกระแส I = Bℓv/R ยังต้องคูณ ℓB เพื่อได้แรง F = IℓB',
  'rl-tau-inverted': 'ค่าคงที่เวลาคือ τ = L/R ไม่ใช่ R/L',
  'rl-decay-for-rise': 'กระแสกำลังเพิ่มขึ้นจาก 0 ต้องใช้ (ε/R)(1 − e^(−t/τ)) ไม่ใช่ (ε/R)e^(−t/τ)',
  'rl-rise-for-decay': 'กระแสกำลังลดลงจาก ε/R ต้องใช้ (ε/R)e^(−t/τ) ไม่ใช่ (ε/R)(1 − e^(−t/τ))',
  'rl-VR-for-VL': 'นั่นคือแรงดันคร่อม R (= IR) แรงดันคร่อม L คือ ε − IR = εe^(−t/τ)',
  'mH-not-converted': 'แปลง mH เป็น H ก่อน: 1 mH = 10⁻³ H',
  'rl-ln-sign': 'จาก f = 1 − e^(−t/τ) ได้ t = −τ ln(1 − f) ไม่ใช่ −τ ln f',
  // chapter 5
  'b-times-c': 'B_max = E_max / c (หารด้วย c) ไม่ใช่คูณ c',
  'e-over-c': 'E_max = c B_max (คูณด้วย c) ไม่ใช่หาร',
  'k-no-2pi': 'k = 2π/λ จึงได้ λ = 2π/k อย่าลืม 2π',
  'gave-omega': 'นั่นคือความถี่เชิงมุม ω = ck (rad/s) โจทย์ถามความถี่ f = ω/2π (Hz)',
  'lambda-from-omega': 'ใช้ ω แทน f: ต้องหาร 2π ก่อน f = ω/2π แล้วค่อย λ = c/f',
  'hemisphere-for-sphere': 'ส่ง “ทุกทิศทาง” คลื่นแผ่เต็มทรงกลม ใช้พื้นที่ 4πr² ไม่ใช่ครึ่งทรงกลม 2πr²',
  'sphere-for-hemisphere': 'ส่งเฉพาะ “เหนือพื้นโลก” คลื่นแผ่เป็นครึ่งทรงกลม ใช้พื้นที่ 2πr² ไม่ใช่ 4πr²',
  'pi-r2-area': 'พื้นที่ที่คลื่นแผ่ไปคือผิวทรงกลม 4πr² ไม่ใช่พื้นที่วงกลม πr²',
  'kw-not-converted': 'แปลง kW เป็น W ก่อน: 1 kW = 10³ W',
  'min-not-s': 'แปลงนาทีเป็นวินาทีก่อน: 1 นาที = 60 s',
  'forgot-time': 'นั่นคือกำลังที่ตกบนพื้นที่ (W) ต้องคูณเวลาด้วยจึงได้พลังงาน U = IAt',
  'no-half-intensity': 'ความเข้มคือค่าเฉลี่ย I = E²_max / 2μ₀c มีเลข 2 (ค่าเฉลี่ยของ cos² คือ ½)',
  'reflect-no-2': 'ผิวสะท้อนสมบูรณ์ได้สองเท่าของผิวดูดกลืน: p = 2U/c และ P = 2S/c (คลื่นกลับทิศ โมเมนตัมเปลี่ยนสองเท่า)',
  'ss-no-half': 'สลิตเดี่ยวไม่มี ½: แถบมืดอยู่ที่ a sinθ = mλ (m = ±1, ±2, …) ส่วน (m + ½) เป็นแถบมืดของสลิตคู่',
  'dark-spacing-double': 'ริ้วมืดถัดกันด้านเดียวกันห่างกัน λD/a (ส่วน 2λD/a คือระยะข้ามแถบสว่างกลาง)',
  'absorb-2': 'ผิวดูดกลืนได้ความดัน S/c ส่วน 2S/c เป็นของผิวสะท้อน',
  'f-not-1pf': 'ความดันคือ (1 + f)S/c: ส่วนที่ดูดกลืนให้ S/c แล้วส่วนที่สะท้อนให้เพิ่มอีก fS/c',
  'full-sphere-area': 'แสงมาจากทางเดียว ดาวเคราะห์บังแสงเป็นวงกลม พื้นที่ πR² ไม่ใช่ผิวทรงกลม 4πR²',
  'half-sphere-area': 'แสงมาจากทางเดียว ใช้พื้นที่หน้าตัด πR² ไม่ใช่ครึ่งผิวทรงกลม 2πR²',
  'eb-cross-order': 'ลำดับ cross product กลับกัน: ต้องให้ E × B ชี้ไปทางที่คลื่นวิ่ง จึงได้ B̂ = k̂ × Ê (สลับลำดับแล้วเครื่องหมายกลับ)',
  'b-parallel-e': 'B ต้องตั้งฉากกับ E เสมอ (คุณสมบัติข้อ 2)',
  'b-along-k': 'คลื่น EM เป็นคลื่นตามขวาง B ต้องตั้งฉากกับทิศที่คลื่นวิ่ง',
  'pressure-is-intensity': 'ความดันกับความเข้มต่างกัน: S = Pc (ผิวดูดกลืน) คูณ c ก่อน แล้วค่อยคูณพื้นที่',
  // chapter 6
  'angle-from-surface': 'มุมในกฎของสเนลวัดจากเส้นปกติ ถ้าโจทย์ให้มุมกับผิวหรือกับขอบฟ้า ต้องใช้ 90° − มุมนั้น',
  'snell-inverted': 'สลับ n₁ กับ n₂: n₁ sinθ₁ = n₂ sinθ₂ ดัชนีของตัวกลางที่แสงมาจากคู่กับมุมตกกระทบ',
  'n-times-speed': 'ในตัวกลาง แสงช้าลง v = c/n (หารด้วย n ไม่ใช่คูณ)',
  'lambda-n-times': 'ความยาวคลื่นในตัวกลางสั้นลง λₙ = λ/n (หารด้วย n)',
  'critical-inverted': 'sinθc = n₂/n₁ (ดัชนีตัวเล็กหารตัวใหญ่) ค่าต้องน้อยกว่า 1',
  'tank-tan-inverted': 'จากรูป tanθ₂ = D/h จึงได้ h = D/tanθ₂ ไม่ใช่ D·tanθ₂',
  'speed-c-in-medium': 'ในแผ่นพลาสติก แสงวิ่งด้วย v = c/n ไม่ใช่ c',
  'used-thickness': 'ระยะทางในแผ่นคือแนวเฉียง L = √(d² + x²) ไม่ใช่ความหนา d',
  'dark-as-bright': 'นั่นคือตำแหน่งแถบสว่าง แถบมืดอยู่ที่ (m + ½)λL/d',
  'bright-as-dark': 'นั่นคือตำแหน่งแถบมืด แถบสว่างอยู่ที่ mλL/d',
  'dark-off-by-one': 'แถบมืดแรกคือ m = 0 ใน (m + ½) แถบมืดที่ k จึงอยู่ที่ (k − ½)λL/d',
  'degrees-not-radians': 'มุม πdy/λL เป็นเรเดียน ตั้งเครื่องคิดเลขเป็นโหมด rad (หรือแปลงเป็นองศาก่อน)',
  'cos-not-squared': 'ความเข้มคือ cos² ไม่ใช่ cos',
  'used-phi-not-half': 'I = I_max cos²(φ/2): ในวงเล็บใช้ครึ่งหนึ่งของเฟส คือ πdy/λL ไม่ใช่ 2πdy/λL',
  'mm-not-converted': 'แปลง mm เป็น m ก่อน: 1 mm = 10⁻³ m',
  'gave-half-width': 'นั่นคือระยะถึงแถบมืดแรก ความกว้างแถบสว่างกลางคือสองเท่า 2λD/a',
  'gave-full-width': 'นั่นคือความกว้างทั้งแถบสว่างกลาง (2λD/a) ตำแหน่งแถบมืดแรกคือ λD/a',
  'no-1.22': 'ช่องกลมใช้ θ_R = 1.22λ/D (มี 1.22) ส่วน λ/a ใช้กับสลิต',
  'lines-as-d': 'd คือระยะห่างระหว่างเส้น = ความยาว ÷ จำนวนเส้น',
  'unpol-no-half': 'แสงไม่โพลาไรซ์ผ่านแผ่นแรกเหลือ ½ ก่อน แล้วค่อยใช้ cos² กับแผ่นถัดไป',
  'angle-from-vertical': 'มุมในกฎของมาลุสคือมุมระหว่างแกนแผ่นนี้กับแกนแผ่นก่อนหน้า ไม่ใช่มุมกับแนวตั้ง',
  'brewster-sin': 'กฎของบริวสเตอร์คือ n = tanθp (ใช้ tan ไม่ใช่ sin ซึ่งเป็นของมุมวิกฤต)',
  'tan-for-critical': 'มุมวิกฤตใช้ sinθc = n₂/n₁ (ส่วน tan ใช้กับมุมบริวสเตอร์)',
  'gave-new-x': 'นั่นคือระยะ x ใหม่ทั้งหมด โจทย์ถามว่า "เพิ่มขึ้น" เท่าใด ต้องลบค่าเดิมออก',
  'lambda-L-swapped': 'สลับ L กับ d: แถบห่างกันมากขึ้นเมื่อฉากไกลขึ้น ระยะบนฉากจึงเป็น λL/d',
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
  // chapter 4
  weber: [
    { label: 'Wb', factor: 1 },
    { label: 'mWb', factor: 1e-3 },
  ],
  emf: [
    { label: 'V', factor: 1 },
    { label: 'mV', factor: 1e-3 },
  ],
  current: [
    { label: 'A', factor: 1 },
    { label: 'mA', factor: 1e-3 },
  ],
  time: [
    { label: 's', factor: 1 },
    { label: 'ms', factor: 1e-3 },
    { label: 'μs', factor: 1e-6 },
  ],
  henry: [
    { label: 'H', factor: 1 },
    { label: 'mH', factor: 1e-3 },
  ],
  // chapter 5
  fieldE: [{ label: 'V/m', factor: 1 }],
  hertz: [
    { label: 'Hz', factor: 1 },
    { label: 'MHz', factor: 1e6 },
    { label: 'GHz', factor: 1e9 },
  ],
  wavelength: [
    { label: 'nm', factor: 1e-9 },
    { label: 'μm', factor: 1e-6 },
    { label: 'm', factor: 1 },
  ],
  intensity: [{ label: 'W/m²', factor: 1 }],
  power: [
    { label: 'W', factor: 1 },
    { label: 'kW', factor: 1e3 },
  ],
  pressure: [
    { label: 'Pa', factor: 1 },
    { label: 'μPa', factor: 1e-6 },
  ],
  forceSmall: [
    { label: 'N', factor: 1 },
    { label: 'mN', factor: 1e-3 },
    { label: 'μN', factor: 1e-6 },
  ],
  momentum: [{ label: 'kg·m/s', factor: 1 }],
  // chapter 6
  degree: [{ label: '°', factor: 1 }],
  lengthSmall: [
    { label: 'mm', factor: 1e-3 },
    { label: 'm', factor: 1 },
    { label: 'cm', factor: 1e-2 },
    { label: 'μm', factor: 1e-6 },
  ],
  timeShort: [
    { label: 'ps', factor: 1e-12 },
    { label: 'ns', factor: 1e-9 },
    { label: 's', factor: 1 },
  ],
  radian: [
    { label: 'rad', factor: 1 },
    { label: 'mrad', factor: 1e-3 },
    { label: 'μrad', factor: 1e-6 },
  ],
  timesImax: [{ label: '× I_max', factor: 1 }],
  timesI0: [{ label: '× I₀', factor: 1 }],
} satisfies Record<string, UnitOpt[]>;
