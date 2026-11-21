// =====================================================================
// Practice question generators for chapter 5 (electromagnetic waves).
// Modelled on worksheet Q29–30 and the lecture examples (slides 6, 12,
// 15, 17–21).
//
// The direction of B (Q30 part ก) is practised in the "ebDir" widget
// (it has a guess-first mode) and in the ตัวอย่างข้อสอบ tab, because the
// practice checker takes numbers only.
// Every answer comes from src/physics/emwave.ts, with c = 3×10⁸ m/s.
// =====================================================================
import { fmt, tex } from '../lib/format';
import * as P from '../physics';
import { E0_TEX, MU0_TEX, U, int, pick } from './common';
import type { Generator, Rng } from './common';

/** "2.0\times10^{6}" — a mantissa with one decimal and a power of ten, for prompts. */
const sci = (m: number, e: number) =>
  // keep proper scientific form: 0.8×10⁷ is printed as 8.0×10⁶
  m < 1 ? String.raw`${(m * 10).toFixed(1)}\times10^{${e - 1}}` : String.raw`${m.toFixed(1)}\times10^{${e}}`;

/** A wave number k = m×10^e m⁻¹ that gives visible-ish light (λ between ~300 and ~900 nm). */
function pickK(rng: Rng) {
  const m = pick(rng, [0.8, 1.0, 1.2, 1.5, 2.0]);
  return { m, e: 7, k: m * 1e7 };
}

/** An electric amplitude m×10^e V/m with a random sign, as in Q30. */
function pickE(rng: Rng) {
  const m = pick(rng, [1.0, 1.5, 2.0, 2.5, 3.0, 4.5, 6.0]);
  const e = pick(rng, [2, 3, 4, 5, 6]);
  const sign = rng() < 0.5 ? -1 : 1;
  return { m, e, sign, E: m * 10 ** e };
}

/** The TeX of a Q30-style field: E = ±A sin(kx − ωt) ẑ (or ŷ). */
function waveTex(Ea: { m: number; e: number; sign: number }, k: { m: number; e: number }, axis: 'y' | 'z') {
  return String.raw`\vec E=${Ea.sign < 0 ? '-' : ''}${sci(Ea.m, Ea.e)}\sin(${sci(k.m, k.e)}\,x-\omega t)\,\hat ${axis}`;
}

const C_TEX = String.raw`3\times10^{8}`;

export const emwaveGenerators: Generator[] = [
  // ------------------------------------------------ plane waves (Q30, slide 12)
  {
    id: 'q30-Bmax',
    skill: 'emWave',
    title: 'แอมพลิจูดของสนามแม่เหล็กจากสมการ E',
    make: (rng) => {
      const Ea = pickE(rng);
      const k = pickK(rng);
      const axis = pick(rng, ['y', 'z'] as const);
      const B = P.bFromE(Ea.E);
      return {
        prompt: String.raw`สนามไฟฟ้าของคลื่นแม่เหล็กไฟฟ้าที่เคลื่อนที่ไปในทิศ $+x$ ในสุญญากาศคือ $${waveTex(Ea, k, axis)}$ (หน่วย SI) จงหาแอมพลิจูดของสนามแม่เหล็ก`,
        units: U.tesla,
        answer: B,
        scale: B,
        mistakes: [{ id: 'b-times-c', value: Ea.E * P.C_LIGHT }],
        hints: [
          String.raw`แอมพลิจูดคือ **ขนาด** ตัวเลขหน้า $\sin$ ไม่เอาเครื่องหมาย: $E_{max}=${sci(Ea.m, Ea.e)}$ V/m`,
          String.raw`$\dfrac{E_{max}}{B_{max}}=c$`,
        ],
        solution: [String.raw`$B_{max}=\dfrac{E_{max}}{c}=\dfrac{${sci(Ea.m, Ea.e)}}{${C_TEX}}=${tex(B)}\ \mathrm T$`],
      };
    },
  },
  {
    id: 'q30-freq',
    skill: 'emWave',
    title: 'ความถี่ของคลื่นจากสมการ E',
    make: (rng) => {
      const Ea = pickE(rng);
      const k = pickK(rng);
      const lam = P.wavelengthFromK(k.k);
      const f = P.frequencyFromK(k.k);
      return {
        prompt: String.raw`สนามไฟฟ้าของคลื่นแม่เหล็กไฟฟ้าที่เคลื่อนที่ไปในทิศ $+x$ ในสุญญากาศคือ $${waveTex(Ea, k, 'z')}$ (หน่วย SI) จงหาความถี่ของคลื่น`,
        units: U.hertz,
        answer: f,
        scale: f,
        mistakes: [{ id: 'gave-omega', value: P.omegaFromK(k.k) }],
        hints: [
          String.raw`ตัวเลขหน้า $x$ คือเลขคลื่น $k=${sci(k.m, k.e)}\ \mathrm{m^{-1}}$ (ไม่เกี่ยวกับ $E_{max}$)`,
          String.raw`$k=\dfrac{2\pi}{\lambda}$ แล้ว $c=f\lambda$`,
        ],
        solution: [
          String.raw`$\lambda=\dfrac{2\pi}{k}=\dfrac{2\pi}{${sci(k.m, k.e)}}=${tex(lam)}\ \mathrm m$`,
          String.raw`$f=\dfrac{c}{\lambda}=\dfrac{${C_TEX}}{${tex(lam)}}=${tex(f)}\ \mathrm{Hz}$`,
        ],
      };
    },
  },
  {
    id: 'wave-lambda',
    skill: 'emWave',
    title: 'ความยาวคลื่นจากเลขคลื่น k',
    make: (rng) => {
      const Emax = pick(rng, [50, 100, 150, 200, 300]);
      const k = pickK(rng);
      const lam = P.wavelengthFromK(k.k);
      return {
        prompt: String.raw`สนามไฟฟ้าของคลื่นแม่เหล็กไฟฟ้าแสดงได้ดังนี้ (หน่วย SI) $E_y=${Emax}\sin(${sci(k.m, k.e)}\,x-\omega t)$ จงหาความยาวคลื่น`,
        units: U.wavelength,
        answer: lam,
        scale: lam,
        mistakes: [{ id: 'k-no-2pi', value: 1 / k.k }],
        hints: [String.raw`$\lambda=\dfrac{2\pi}{k}$ โดย $k$ คือตัวเลขหน้า $x$`],
        solution: [String.raw`$\lambda=\dfrac{2\pi}{${sci(k.m, k.e)}}=${tex(lam)}\ \mathrm m=${fmt(lam * 1e9)}$ nm`],
      };
    },
  },
  {
    id: 'wave-Emax-from-B',
    skill: 'emWave',
    title: 'แอมพลิจูดสนามไฟฟ้าจาก B',
    make: (rng) => {
      const m = pick(rng, [1.0, 2.0, 2.5, 4.0, 5.0]);
      const e = pick(rng, [-9, -8, -7, -6]);
      const B = m * 10 ** e;
      const E = P.eFromB(B);
      return {
        prompt: String.raw`คลื่นแม่เหล็กไฟฟ้าในสุญญากาศมีแอมพลิจูดของสนามแม่เหล็ก $${sci(m, e)}$ T จงหาแอมพลิจูดของสนามไฟฟ้า`,
        units: U.fieldE,
        answer: E,
        scale: E,
        mistakes: [{ id: 'e-over-c', value: B / P.C_LIGHT }],
        hints: [String.raw`$\dfrac{E_{max}}{B_{max}}=c$`],
        solution: [String.raw`$E_{max}=cB_{max}=(${C_TEX})(${sci(m, e)})=${tex(E)}$ V/m`],
      };
    },
  },
  {
    id: 'lc-wavelength',
    skill: 'emWave',
    title: 'ความยาวคลื่นจากวงจร LC',
    make: (rng) => {
      const LuH = pick(rng, [1, 2, 4, 5, 10, 20]); // μH
      const CpF = pick(rng, [1, 2, 5, 10, 20, 50]); // pF
      const L = LuH * 1e-6;
      const C = CpF * 1e-12;
      const f = P.lcFrequency(L, C);
      const lam = P.C_LIGHT / f;
      return {
        prompt: String.raw`วงจร LC ที่มี $L=${LuH}\ \mu\mathrm H$ และ $C=${CpF}$ pF ต่อกับสายอากาศ ส่งคลื่นแม่เหล็กไฟฟ้าที่มีความถี่เท่ากับความถี่ของวงจร จงหาความยาวคลื่นที่ส่งออกมา`,
        units: [
          { label: 'm', factor: 1 },
          { label: 'cm', factor: 1e-2 },
        ],
        answer: lam,
        scale: lam,
        mistakes: [{ id: 'lambda-from-omega', value: P.C_LIGHT / P.lcOmega(L, C) }],
        hints: [
          String.raw`$\omega=\dfrac{1}{\sqrt{LC}}$ เป็นความถี่ **เชิงมุม** (rad/s)`,
          String.raw`$f=\dfrac{\omega}{2\pi}$ แล้ว $\lambda=\dfrac{c}{f}$`,
        ],
        solution: [
          String.raw`$\omega=\dfrac{1}{\sqrt{(${LuH}\times10^{-6})(${CpF}\times10^{-12})}}=${tex(P.lcOmega(L, C))}$ rad/s`,
          String.raw`$f=\dfrac{\omega}{2\pi}=${tex(f)}$ Hz`,
          String.raw`$\lambda=\dfrac{c}{f}=${tex(lam)}$ m`,
        ],
      };
    },
  },
  {
    id: 'displacement-current',
    skill: 'emWave',
    title: 'กระแสกระจัดระหว่างแผ่นตัวเก็บประจุ',
    make: (rng) => {
      const Acm2 = pick(rng, [10, 20, 25, 50, 100]);
      const m = pick(rng, [1.0, 2.0, 3.0, 5.0]);
      const e = pick(rng, [10, 11, 12]);
      const dEdt = m * 10 ** e;
      const A = Acm2 * 1e-4;
      const Id = P.capacitorDisplacementCurrent(A, dEdt);
      return {
        prompt: String.raw`ตัวเก็บประจุแผ่นขนานมีพื้นที่แผ่น $${Acm2}\ \mathrm{cm^2}$ ขณะชาร์จ สนามไฟฟ้าระหว่างแผ่นเพิ่มขึ้นในอัตรา $${sci(m, e)}$ V/(m·s) จงหากระแสกระจัดระหว่างแผ่น`,
        units: U.current,
        answer: Id,
        scale: Id,
        mistakes: [{ id: 'area-cm2', value: P.capacitorDisplacementCurrent(Acm2, dEdt) }],
        hints: [
          String.raw`$I_d=\varepsilon_0\dfrac{d\Phi_E}{dt}$ และระหว่างแผ่น $\Phi_E=EA$`,
          String.raw`$A=${Acm2}\times10^{-4}\ \mathrm{m^2}$`,
        ],
        solution: [String.raw`$I_d=\varepsilon_0A\dfrac{dE}{dt}=(${E0_TEX})(${tex(A)})(${sci(m, e)})=${tex(Id)}$ A`],
      };
    },
  },

  // ------------------------------------------------ intensity and energy (Q29, slide 15)
  {
    id: 'q29-intensity',
    skill: 'emIntensity',
    title: 'ความเข้มที่ระยะ r จากแหล่งที่ส่งทุกทิศ',
    make: (rng) => {
      const PkW = pick(rng, [10, 20, 25, 40, 50, 80, 100]);
      const r = pick(rng, [50, 100, 150, 200, 250, 300, 500]);
      const I = P.intensityAtDistance(PkW * 1e3, r);
      return {
        prompt: String.raw`แหล่งกำเนิดคลื่นแม่เหล็กไฟฟ้ามีกำลังเฉลี่ย ${PkW} กิโลวัตต์ ส่งคลื่นอย่างสม่ำเสมอในทุกทิศทาง จงหาความเข้มของคลื่นแม่เหล็กไฟฟ้าที่พื้นผิวที่อยู่ห่างออกไป ${r} เมตร`,
        units: U.intensity,
        answer: I,
        scale: I,
        mistakes: [
          { id: 'hemisphere-for-sphere', value: P.intensityAtDistance(PkW * 1e3, r, 'hemisphere') },
          { id: 'pi-r2-area', value: (PkW * 1e3) / (Math.PI * r * r) },
          { id: 'kw-not-converted', value: P.intensityAtDistance(PkW, r) },
        ],
        hints: [
          String.raw`"ทุกทิศทาง" คลื่นแผ่ออกเป็นผิวทรงกลม $A=4\pi r^2$`,
          String.raw`$I=\dfrac{\text{Power}}{A}$ แปลง kW เป็น W ก่อน`,
        ],
        solution: [String.raw`$I=\dfrac{${PkW}\times10^{3}}{4\pi(${r})^2}=${tex(I)}\ \mathrm{W/m^2}$`],
      };
    },
  },
  {
    id: 'q29-energy',
    skill: 'emIntensity',
    title: 'พลังงานที่ตกบนพื้นที่ในเวลาหนึ่ง',
    make: (rng) => {
      const PkW = pick(rng, [10, 20, 25, 40, 50, 80, 100]);
      const r = pick(rng, [50, 100, 150, 200, 250, 300]);
      const A = pick(rng, [1.0, 2.0, 2.5, 4.0, 5.0, 6.0]);
      const tMin = int(rng, 1, 5);
      const I = P.intensityAtDistance(PkW * 1e3, r);
      const Uj = P.energyOnArea(I, A, tMin * 60);
      return {
        prompt: String.raw`แหล่งกำเนิดคลื่นแม่เหล็กไฟฟ้ามีกำลังเฉลี่ย ${PkW} กิโลวัตต์ ส่งคลื่นอย่างสม่ำเสมอในทุกทิศทาง จงหาพลังงานของคลื่นแม่เหล็กไฟฟ้าที่กระทบพื้นผิวขนาด ${A.toFixed(1)} ตารางเมตร ที่ระยะ ${r} เมตร เป็นเวลา ${tMin} นาที`,
        units: U.energy,
        answer: Uj,
        scale: Uj,
        mistakes: [
          { id: 'min-not-s', value: P.energyOnArea(I, A, tMin) },
          { id: 'forgot-time', value: I * A },
          { id: 'hemisphere-for-sphere', value: P.energyOnArea(2 * I, A, tMin * 60) },
        ],
        hints: [
          String.raw`หาความเข้มก่อน $I=\dfrac{\text{Power}}{4\pi r^2}$`,
          String.raw`$S_{avg}=I=\dfrac{1}{A'}\dfrac{dU}{dt}$ จึงได้ $U=IA't$ (เวลาเป็นวินาที)`,
        ],
        solution: [
          String.raw`$I=\dfrac{${PkW}\times10^{3}}{4\pi(${r})^2}=${tex(I)}\ \mathrm{W/m^2}$`,
          String.raw`$U=IA't=(${tex(I)})(${A.toFixed(1)})(${tMin * 60})=${tex(Uj)}$ J`,
        ],
      };
    },
  },
  {
    id: 'hemisphere-intensity',
    skill: 'emIntensity',
    title: 'สถานีวิทยุส่งคลื่นเหนือพื้นโลก (สไลด์ 15)',
    make: (rng) => {
      const PkW = pick(rng, [10, 20, 30, 50, 100]);
      const hKm = pick(rng, [5, 10, 20, 50, 100]);
      const r = hKm * 1e3;
      const I = P.intensityAtDistance(PkW * 1e3, r, 'hemisphere');
      return {
        prompt: String.raw`สถานีวิทยุส่งคลื่นวิทยุกำลังเฉลี่ยรวม ${PkW} kW กำหนดให้คลื่นถูกส่งออกมาเท่า ๆ กันในทุกทิศทางเหนือพื้นโลก จงหาอัตราการส่งผ่านพลังงานของคลื่น (ความเข้ม) ไปยังเครื่องรับที่อยู่สูงจากสถานี ${hKm} km`,
        units: U.intensity,
        answer: I,
        scale: I,
        mistakes: [
          { id: 'sphere-for-hemisphere', value: P.intensityAtDistance(PkW * 1e3, r, 'sphere') },
          { id: 'cm-not-m', value: P.intensityAtDistance(PkW * 1e3, hKm, 'hemisphere') },
        ],
        hints: [
          String.raw`ส่งเฉพาะ **เหนือพื้นโลก** คลื่นแผ่เป็นครึ่งทรงกลม $A=2\pi r^2$`,
          String.raw`แปลง km เป็น m: $r=${hKm}\times10^{3}$ m`,
        ],
        solution: [String.raw`$I=\dfrac{${PkW}\times10^{3}}{2\pi(${hKm}\times10^{3})^2}=${tex(I)}\ \mathrm{W/m^2}$`],
      };
    },
  },
  {
    id: 'intensity-from-E',
    skill: 'emIntensity',
    title: 'ความเข้มจากแอมพลิจูดของ E',
    make: (rng) => {
      const E = pick(rng, [50, 100, 200, 300, 500, 800, 1000]);
      const I = P.intensityFromEmax(E);
      return {
        prompt: String.raw`คลื่นแม่เหล็กไฟฟ้าในสุญญากาศมีแอมพลิจูดของสนามไฟฟ้า ${E} V/m จงหาความเข้มของคลื่น`,
        units: U.intensity,
        answer: I,
        scale: I,
        mistakes: [{ id: 'no-half-intensity', value: 2 * I }],
        hints: [String.raw`$I=\dfrac{E_{max}^2}{2\mu_0c}$ (ในชีท) โดย $\mu_0=${MU0_TEX}$`],
        solution: [String.raw`$I=\dfrac{(${E})^2}{2(${MU0_TEX})(${C_TEX})}=${tex(I)}\ \mathrm{W/m^2}$`],
      };
    },
  },
  {
    id: 'emax-from-intensity',
    skill: 'emIntensity',
    title: 'แอมพลิจูดของ E จากความเข้ม',
    make: (rng) => {
      const I = pick(rng, [100, 500, 1000, 1370, 2000, 5000]);
      const E = P.emaxFromIntensity(I);
      return {
        prompt: String.raw`ความเข้มของแสงที่ตกกระทบผิวหนึ่งคือ ${I} W/m² จงหาแอมพลิจูดของสนามไฟฟ้าของแสงนี้`,
        units: U.fieldE,
        answer: E,
        scale: E,
        mistakes: [{ id: 'no-half-intensity', value: Math.sqrt(4 * Math.PI * 1e-7 * P.C_LIGHT * I) }],
        hints: [String.raw`จาก $I=\dfrac{E_{max}^2}{2\mu_0c}$ ได้ $E_{max}=\sqrt{2\mu_0cI}$`],
        solution: [String.raw`$E_{max}=\sqrt{2(${MU0_TEX})(${C_TEX})(${I})}=${tex(E)}$ V/m`],
      };
    },
  },
  {
    id: 'emax-at-distance',
    skill: 'emIntensity',
    title: 'แอมพลิจูดของ E ที่ระยะ r จากแหล่งกำเนิด',
    make: (rng) => {
      const PW = pick(rng, [60, 100, 500, 1000, 5000]);
      const r = pick(rng, [1, 2, 5, 10, 20]);
      const I = P.intensityAtDistance(PW, r);
      const E = P.emaxFromIntensity(I);
      return {
        prompt: String.raw`หลอดไฟให้กำลังแสงเฉลี่ย ${PW} W ออกไปสม่ำเสมอในทุกทิศทาง จงหาแอมพลิจูดของสนามไฟฟ้าของแสงที่ระยะ ${r} m`,
        units: U.fieldE,
        answer: E,
        scale: E,
        mistakes: [{ id: 'no-half-intensity', value: E / Math.SQRT2 }],
        hints: [String.raw`ขั้นที่ 1: $I=\dfrac{\text{Power}}{4\pi r^2}$`, String.raw`ขั้นที่ 2: $E_{max}=\sqrt{2\mu_0cI}$`],
        solution: [
          String.raw`$I=\dfrac{${PW}}{4\pi(${r})^2}=${tex(I)}\ \mathrm{W/m^2}$`,
          String.raw`$E_{max}=\sqrt{2(${MU0_TEX})(${C_TEX})(${tex(I)})}=${tex(E)}$ V/m`,
        ],
      };
    },
  },

  // ------------------------------------------------ radiation pressure (slides 17–21)
  {
    id: 'pressure-absorb-reflect',
    skill: 'radPressure',
    title: 'ความดันรังสีบนผิวดูดกลืน / สะท้อน',
    make: (rng) => {
      const S = pick(rng, [300, 600, 900, 1370, 1500, 3000]);
      const reflect = rng() < 0.5;
      const f = reflect ? 1 : 0;
      const Pr = P.radiationPressure(S, f);
      return {
        prompt: String.raw`แสงความเข้ม ${S} W/m² ตกกระทบตั้งฉากกับผิวที่${reflect ? 'สะท้อนแสงได้สมบูรณ์' : 'ดูดกลืนแสงได้สมบูรณ์'} จงหาความดันรังสีบนผิวนั้น`,
        units: U.pressure,
        answer: Pr,
        scale: Pr,
        mistakes: [reflect ? { id: 'reflect-no-2', value: S / P.C_LIGHT } : { id: 'absorb-2', value: (2 * S) / P.C_LIGHT }],
        hints: [reflect ? String.raw`ผิวสะท้อนสมบูรณ์: $P=\dfrac{2S}{c}$` : String.raw`ผิวดูดกลืนสมบูรณ์: $P=\dfrac{S}{c}$`],
        solution: [String.raw`$P=\dfrac{${reflect ? '2' : ''}(${S})}{${C_TEX}}=${tex(Pr)}$ Pa`],
      };
    },
  },
  {
    id: 'pressure-partial',
    skill: 'radPressure',
    title: 'ความดันรังสีบนผิวที่สะท้อนบางส่วน',
    make: (rng) => {
      const S = pick(rng, [500, 1000, 1370, 2000]);
      const pct = pick(rng, [20, 25, 40, 50, 60, 75, 80]);
      const f = pct / 100;
      const Pr = P.radiationPressure(S, f);
      return {
        prompt: String.raw`แสงความเข้ม ${S} W/m² ตกกระทบตั้งฉากกับผิวซึ่งสะท้อนแสงได้ ${pct}% และดูดกลืนส่วนที่เหลือ จงหาความดันรังสีบนผิว`,
        units: U.pressure,
        answer: Pr,
        scale: Pr,
        mistakes: [
          { id: 'f-not-1pf', value: (f * S) / P.C_LIGHT },
          { id: 'reflect-no-2', value: S / P.C_LIGHT },
        ],
        hints: [String.raw`$P=(1+f)\dfrac{S}{c}$ โดย $f=${f}$ คือสัดส่วนที่สะท้อน`],
        solution: [String.raw`$P=(1+${f})\dfrac{${S}}{${C_TEX}}=${tex(Pr)}$ Pa`],
      };
    },
  },
  {
    id: 'power-from-pressure',
    skill: 'radPressure',
    title: 'หากำลังของแหล่งกำเนิดจากความดันรังสี (สไลด์ 20)',
    make: (rng) => {
      const r = pick(rng, [1, 2, 3, 5, 10]);
      const m = pick(rng, [2, 3, 4, 5, 6, 9]);
      const Pr = m * 1e-6;
      const S = P.intensityFromPressure(Pr);
      const Pw = S * P.spreadArea(r);
      return {
        prompt: String.raw`แหล่งกำเนิดขนาดเล็กมากชนิดหนึ่งให้คลื่นแม่เหล็กไฟฟ้าสม่ำเสมอทุกทิศทาง ที่ระยะ ${r} m พบว่าค่าความดันเฉลี่ยที่กระทำต่อพื้นผิวดูดกลืนสมบูรณ์เป็น $${m}\times10^{-6}$ Pa จงหากำลังเฉลี่ยของแหล่งกำเนิด`,
        units: U.power,
        answer: Pw,
        scale: Pw,
        mistakes: [
          { id: 'pi-r2-area', value: S * Math.PI * r * r },
          { id: 'pressure-is-intensity', value: Pr * P.spreadArea(r) },
        ],
        hints: [
          String.raw`ผิวดูดกลืน: $P=\dfrac{S}{c}$ จึงได้ $S=Pc$`,
          String.raw`ทุกทิศทาง: $\text{Power}=S\cdot4\pi r^2$`,
        ],
        solution: [
          String.raw`$S=Pc=(${m}\times10^{-6})(${C_TEX})=${tex(S)}\ \mathrm{W/m^2}$`,
          String.raw`$\text{Power}=S\cdot4\pi r^2=${tex(S)}\times4\pi(${r})^2=${tex(Pw)}$ W`,
        ],
      };
    },
  },
  {
    id: 'force-planet',
    skill: 'radPressure',
    title: 'แรงที่แสงอาทิตย์ดันดาวเคราะห์ (สไลด์ 21)',
    make: (rng) => {
      const planets = [
        { name: 'โลก', S: 1370, R: 6.37e6, Rt: String.raw`6.37\times10^{6}` },
        { name: 'ดาวอังคาร', S: 590, R: 3.39e6, Rt: String.raw`3.39\times10^{6}` },
        { name: 'ดาวศุกร์', S: 2600, R: 6.05e6, Rt: String.raw`6.05\times10^{6}` },
      ];
      const p = pick(rng, planets);
      const area = Math.PI * p.R * p.R;
      const F = P.radiationForce(p.S, area);
      return {
        prompt: String.raw`ความเข้มของแสงอาทิตย์ที่${p.name}คือ ${p.S} W/m² และ${p.name}มีรัศมี $${p.Rt}$ m จงหาแรงที่ดวงอาทิตย์กระทำต่อ${p.name}เนื่องจากความดันรังสี หาก${p.name}ดูดกลืนแสงที่ตกกระทบได้ทั้งหมด`,
        units: U.force,
        answer: F,
        scale: F,
        mistakes: [
          { id: 'full-sphere-area', value: 4 * F },
          { id: 'half-sphere-area', value: 2 * F },
        ],
        hints: [
          String.raw`ดูดกลืนทั้งหมด: $P=\dfrac{S}{c}$`,
          String.raw`แสงมาจากทางเดียว ดาวบังแสงเป็นวงกลม ใช้พื้นที่หน้าตัด $\pi R^2$`,
        ],
        solution: [
          String.raw`$P=\dfrac{${p.S}}{${C_TEX}}=${tex(p.S / P.C_LIGHT)}$ Pa`,
          String.raw`$F=P\,\pi R^2=${tex(p.S / P.C_LIGHT)}\times\pi(${p.Rt})^2=${tex(F)}$ N`,
        ],
      };
    },
  },
  {
    id: 'sail-force',
    skill: 'radPressure',
    title: 'แรงบนใบเรือสุริยะ',
    make: (rng) => {
      const S = pick(rng, [1000, 1370, 1500]);
      const A = pick(rng, [10, 50, 100, 200, 500]);
      const reflect = rng() < 0.6;
      const F = P.radiationForce(S, A, reflect ? 1 : 0);
      return {
        prompt: String.raw`ใบเรือสุริยะพื้นที่ ${A} m² หันตั้งฉากรับแสงอาทิตย์ความเข้ม ${S} W/m² ถ้าใบเรือ${reflect ? 'สะท้อนแสงได้สมบูรณ์' : 'ดูดกลืนแสงได้ทั้งหมด'} จงหาแรงที่แสงกระทำต่อใบเรือ`,
        units: U.forceSmall,
        answer: F,
        scale: F,
        mistakes: [reflect ? { id: 'reflect-no-2', value: F / 2 } : { id: 'absorb-2', value: F * 2 }],
        hints: [reflect ? String.raw`สะท้อนสมบูรณ์ $P=\dfrac{2S}{c}$` : String.raw`ดูดกลืน $P=\dfrac{S}{c}$`, String.raw`$F=PA$`],
        solution: [String.raw`$F=PA=\dfrac{${reflect ? '2' : ''}(${S})}{${C_TEX}}\times${A}=${tex(F)}$ N`],
      };
    },
  },
  {
    id: 'momentum-oblique',
    skill: 'radPressure',
    title: 'โมเมนตัมที่ส่งให้ผิวสะท้อนเมื่อตกกระทบเฉียง',
    make: (rng) => {
      const UJ = pick(rng, [3, 6, 9, 15, 30, 60]);
      const theta = pick(rng, [30, 37, 45, 53, 60]);
      const p = P.radiationMomentum(UJ, 1, theta);
      return {
        prompt: String.raw`คลื่นแม่เหล็กไฟฟ้าซึ่งมีพลังงานรวม ${UJ} J ตกกระทบผิวที่สะท้อนได้สมบูรณ์ โดยทำมุม ${theta}° กับเส้นตั้งฉากกับผิว จงหาขนาดของโมเมนตัมที่ถ่ายเทให้ผิว`,
        units: U.momentum,
        answer: p,
        scale: p,
        mistakes: [
          { id: 'no-angle', value: P.radiationMomentum(UJ, 1, 0) },
          { id: 'reflect-no-2', value: P.radiationMomentum(UJ, 0, theta) },
        ],
        hints: [
          String.raw`ผิวสะท้อนสมบูรณ์ตกกระทบเฉียง: $p=\dfrac{2U\cos\theta}{c}$ ($\theta$ วัดจากเส้นตั้งฉาก)`,
        ],
        solution: [String.raw`$p=\dfrac{2(${UJ})\cos${theta}^\circ}{${C_TEX}}=${tex(p)}\ \mathrm{kg\cdot m/s}$`],
      };
    },
  },
];
