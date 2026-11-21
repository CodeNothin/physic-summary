// =====================================================================
// Worksheet questions 29–30 (chapter 5: electromagnetic waves), in the
// same form as ch4.ts. The wording follows the worksheet; only the
// numbers change. c = 3×10⁸ m/s as on the exam sheet.
// =====================================================================
import { tex } from '../lib/format';
import * as P from '../physics';
import type { Vec3 } from '../physics';
import { U, int, pick } from '../practice/common';
import { defineQuestion } from './types';
import type { Question } from './types';

/** "2.0\times10^{6}" — mantissa with one decimal and a power of ten. */
const sci = (m: number, e: number) =>
  // keep proper scientific form: 0.8×10⁷ is printed as 8.0×10⁶
  m < 1 ? String.raw`${(m * 10).toFixed(1)}\times10^{${e - 1}}` : String.raw`${m.toFixed(1)}\times10^{${e}}`;

/** Unit vector → TeX with an explicit sign, e.g. (0,1,0) → "+\hat y". */
function hatTex(v: Vec3): string {
  if (v.x !== 0) return `${v.x > 0 ? '+' : '-'}\\hat x`;
  if (v.y !== 0) return `${v.y > 0 ? '+' : '-'}\\hat y`;
  return `${v.z > 0 ? '+' : '-'}\\hat z`;
}

// ------------------------------------------------------------- Q29
// A source of average power P sends waves equally in every direction.
// (ก) intensity at distance r; (ข) energy on area A in t minutes.

interface Q29 {
  /** average power, kW */
  PkW: number;
  /** distance, m */
  r: number;
  /** receiving area, m² */
  A: number;
  /** time, minutes */
  tMin: number;
}

const q29 = defineQuestion<Q29>({
  q: 29,
  chapter: 'emwave',
  title: 'แหล่งกำเนิดคลื่น EM: ความเข้มและพลังงาน',
  idea: 'ส่งทุกทิศทาง กำลังกระจายบนผิวทรงกลม $I=\\dfrac{\\text{Power}}{4\\pi r^2}$ แล้วพลังงานที่ตกบนพื้นที่ $U=IA\'t$',
  lesson: '#/emwave/em-energy',
  sheet: [String.raw`S_{av}=I=\dfrac{(\text{Power})_{av}}{A}`, String.raw`S=\dfrac{1}{A}\dfrac{dU}{dt}=\dfrac{\text{Power}}{A}`],
  notOnSheet: [
    'พื้นที่ผิวทรงกลม $4\\pi r^2$ (ส่ง "ทุกทิศทาง") หรือครึ่งทรงกลม $2\\pi r^2$ (ส่งเฉพาะ "เหนือพื้นโลก")',
    'พลังงานในเวลา $t$ ที่ความเข้มคงที่: $U=IA\'t$ (เวลาเป็นวินาที)',
  ],
  original: { PkW: 50, r: 200, A: 4.0, tMin: 1 },
  random: (rng) => ({
    PkW: pick(rng, [10, 20, 25, 40, 50, 60, 80, 100]),
    r: pick(rng, [50, 100, 150, 200, 250, 300, 400]),
    A: pick(rng, [1.0, 2.0, 2.5, 3.0, 4.0, 5.0, 6.0]),
    tMin: int(rng, 1, 5),
  }),
  build: ({ PkW, r, A, tMin }) => {
    const Pw = PkW * 1e3;
    const t = tMin * 60;
    const I = P.intensityAtDistance(Pw, r);
    const Uj = P.energyOnArea(I, A, t);
    return {
      prompt: String.raw`แหล่งกำเนิดคลื่นแม่เหล็กไฟฟ้ามีกำลังเฉลี่ย ${PkW} กิโลวัตต์ ส่งคลื่นอย่างสม่ำเสมอในทุกทิศทาง จงหา`,
      parts: [
        {
          label: 'ก',
          ask: `ความเข้มของคลื่นแม่เหล็กไฟฟ้าที่พื้นผิวที่อยู่ห่างออกไป ${r} เมตร`,
          boxes: [
            {
              kind: 'number',
              label: 'ความเข้ม $I$',
              units: U.intensity,
              answer: I,
              scale: I,
              mistakes: [
                { id: 'hemisphere-for-sphere', value: P.intensityAtDistance(Pw, r, 'hemisphere') },
                { id: 'pi-r2-area', value: Pw / (Math.PI * r * r) },
                { id: 'kw-not-converted', value: P.intensityAtDistance(PkW, r) },
              ],
            },
          ],
        },
        {
          label: 'ข',
          ask: `พลังงานของคลื่นแม่เหล็กไฟฟ้าที่กระทบพื้นผิวขนาด ${A.toFixed(1)} ตารางเมตร ที่ระยะดังข้อ ก. เป็นเวลา ${tMin} นาที`,
          boxes: [
            {
              kind: 'number',
              label: 'พลังงาน $U$',
              units: U.energy,
              answer: Uj,
              scale: Uj,
              mistakes: [
                { id: 'min-not-s', value: P.energyOnArea(I, A, tMin) },
                { id: 'forgot-time', value: I * A },
              ],
            },
          ],
        },
      ],
      hints: [
        'ส่ง "ทุกทิศทาง" คลื่นแผ่ออกเป็นผิวทรงกลมรัศมี $r$',
        String.raw`$I=\dfrac{\text{Power}}{4\pi r^2}$ แปลง kW เป็น W ก่อน`,
        String.raw`$S_{avg}=I=\dfrac{1}{A'}\dfrac{dU}{dt}$ จึงได้ $U=IA't$ แปลง ${tMin} นาทีเป็น ${t} s`,
      ],
      solution: [
        String.raw`ก. $I=\dfrac{\text{Power}}{4\pi r^2}=\dfrac{${PkW}\times10^{3}}{4\pi(${r}^2)}=${tex(I)}\ \mathrm{W/m^2}$`,
        String.raw`ข. $U=\int IA'\,dt=IA't=(${tex(I)})(${A.toFixed(1)})(${t})=${tex(Uj)}$ J`,
      ],
    };
  },
});

// ------------------------------------------------------------- Q30
// E = (±E0) sin(kx − ωt) n̂ travelling along +x.
// (ก) amplitude and direction of B; (ข) frequency.

interface Q30 {
  /** mantissa and power of ten of the E amplitude, V/m */
  Em: number;
  Ee: number;
  /** sign in front of the amplitude, as printed */
  sign: 1 | -1;
  /** axis of E: 'z' in the worksheet */
  axis: 'y' | 'z';
  /** mantissa of k, in units of 10⁷ m⁻¹ */
  km: number;
}

const q30 = defineQuestion<Q30>({
  q: 30,
  chapter: 'emwave',
  title: 'สมการสนามไฟฟ้าของคลื่น EM',
  idea: 'อ่าน $E_{max}$ (หน้า sin) และ $k$ (หน้า $x$) จากสมการ แล้ว $B_{max}=E_{max}/c$ ทิศจาก $\\hat E\\times\\hat B=$ ทิศคลื่น และ $f=c/\\lambda$ กับ $\\lambda=2\\pi/k$',
  lesson: '#/emwave/em-plane',
  sheet: [String.raw`\dfrac{E_m}{B_m}=\dfrac{|\vec E|}{|\vec B|}=c`, String.raw`\vec S=\dfrac{1}{\mu_0}\vec E\times\vec B`],
  notOnSheet: [
    'เลขคลื่น $k=2\\pi/\\lambda$ (ตัวเลขหน้า $x$) และ $c=f\\lambda$',
    'ทิศของ $\\vec B$: $\\vec S\\propto\\vec E\\times\\vec B$ ชี้ทางที่คลื่นวิ่ง จึงได้ $\\hat B=\\hat k\\times\\hat E$',
    'แอมพลิจูดคือขนาด ไม่เอาเครื่องหมายลบหน้า sin',
  ],
  original: { Em: 2.0, Ee: 6, sign: -1, axis: 'z', km: 1.2 },
  random: (rng) => ({
    Em: pick(rng, [1.0, 1.5, 2.0, 2.5, 3.0, 4.5, 6.0]),
    Ee: pick(rng, [3, 4, 5, 6]),
    sign: rng() < 0.5 ? -1 : 1,
    axis: pick(rng, ['y', 'z'] as const),
    km: pick(rng, [0.8, 1.0, 1.2, 1.5, 2.0]),
  }),
  build: ({ Em, Ee, sign, axis, km }) => {
    const E0 = Em * 10 ** Ee;
    const k = km * 1e7;
    const B0 = P.bFromE(E0);
    const lam = P.wavelengthFromK(k);
    const f = P.frequencyFromK(k);
    // direction of the E vector as printed (the sign in front times the axis)
    const eHat: Vec3 = axis === 'z' ? P.vec3(0, 0, sign) : P.vec3(0, sign, 0);
    const kHat = P.vec3(1, 0, 0);
    const bHat = P.bDirection(eHat, kHat);
    const neg = (v: Vec3): Vec3 => P.vec3(-v.x + 0, -v.y + 0, -v.z + 0);
    const eqTex = String.raw`\vec E=${sign < 0 ? '-' : ''}${sci(Em, Ee)}\sin(${sci(km, 7)}\,x-\omega t)\,\hat ${axis}`;
    return {
      prompt: String.raw`สมการสนามไฟฟ้าของคลื่นแม่เหล็กไฟฟ้าที่เคลื่อนที่ไปในทิศ $+x$ ในสุญญากาศ เขียนได้เป็น $${eqTex}$ โดยทุกปริมาณเป็นหน่วยเอสไอ จงหา`,
      parts: [
        {
          label: 'ก',
          ask: 'แอมพลิจูดและทิศทางของสนามแม่เหล็ก',
          boxes: [
            {
              kind: 'number',
              label: 'แอมพลิจูด $B_{max}$',
              units: U.tesla,
              answer: B0,
              scale: B0,
              mistakes: [{ id: 'b-times-c', value: E0 * P.C_LIGHT }],
            },
            {
              kind: 'choice',
              label: 'ทิศของ $\\vec B$',
              options: [
                { tex: String.raw`\hat B=${hatTex(bHat)}` },
                { tex: String.raw`\hat B=${hatTex(neg(bHat))}`, mistake: 'eb-cross-order' },
                { tex: String.raw`\hat B=${hatTex(eHat)}`, mistake: 'b-parallel-e' },
                { tex: String.raw`\hat B=+\hat x`, mistake: 'b-along-k' },
              ],
            },
          ],
        },
        {
          label: 'ข',
          ask: 'ความถี่ของคลื่นแม่เหล็กไฟฟ้า',
          boxes: [
            {
              kind: 'number',
              label: 'ความถี่ $f$',
              units: U.hertz,
              answer: f,
              scale: f,
              mistakes: [{ id: 'gave-omega', value: P.omegaFromK(k) }],
            },
          ],
        },
      ],
      hints: [
        String.raw`อ่านจากสมการ: $E_{max}=${sci(Em, Ee)}$ V/m (ขนาด ไม่เอาเครื่องหมาย) และ $k=${sci(km, 7)}\ \mathrm{m^{-1}}$`,
        String.raw`$\dfrac{E_{max}}{B_{max}}=c$ และ $\hat E\times\hat B$ ต้องชี้ $+\hat x$`,
        String.raw`$k=\dfrac{2\pi}{\lambda}$ แล้ว $c=f\lambda$`,
      ],
      solution: [
        String.raw`ก. $B_{max}=\dfrac{E_{max}}{c}=\dfrac{${sci(Em, Ee)}}{3.0\times10^{8}}=${tex(B0)}$ T`,
        String.raw`ทิศ: $\hat E=${hatTex(eHat)}$ และ $\hat E\times\hat B=\hat x$ จึงได้ $\hat B=\hat x\times\hat E=${hatTex(bHat)}$`,
        String.raw`ตรวจ: $(${hatTex(eHat)})\times(${hatTex(bHat)})=+\hat x$ ✓`,
        String.raw`ข. $\lambda=\dfrac{2\pi}{k}=\dfrac{2\pi}{${sci(km, 7)}}=${tex(lam)}$ m`,
        String.raw`$f=\dfrac{c}{\lambda}=\dfrac{3\times10^{8}}{${tex(lam)}}=${tex(f)}$ Hz`,
      ],
    };
  },
});

/** Chapter 5 worksheet questions. */
export const ch5Questions: Question[] = [q29, q30];
