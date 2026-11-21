// =====================================================================
// The "สูตร" tab. The exam hands out an official formula sheet, so this
// page shows (1) its constants and (2) its formulas as printed, then
// (3) what the lessons use that is NOT on the sheet, (4) the traps that
// cost marks and (5) a Thai–English glossary.
// Formulas are plain text with $...$ math, so they are easy to edit here.
// =====================================================================
import { Li, M, T, Tex, r } from '../components/ui';

const glossary: [string, string][] = [
  ['สนามไฟฟ้า', 'electric field'],
  ['ศักย์ไฟฟ้า', 'electric potential'],
  ['ฟลักซ์ไฟฟ้า', 'electric flux'],
  ['ผิวเกาส์ / ผิวปิด', 'Gaussian surface / closed surface'],
  ['ประจุสุทธิ', 'net charge'],
  ['ความต่างศักย์', 'potential difference'],
  ['พลังงานศักย์ไฟฟ้า', 'electric potential energy'],
  ['ผิวสมศักย์', 'equipotential surface'],
  ['ตัวนำ', 'conductor'],
  ['ฉนวน', 'insulator'],
  ['ทรงกลมกลวง', 'hollow sphere'],
  ['ทรงกลมตัน', 'solid sphere'],
  ['ผิวด้านใน / ด้านนอก', 'inner / outer surface'],
  ['ความหนาแน่นประจุ', 'charge density'],
  ['แผ่นประจุขนาดใหญ่มาก', 'very large charged sheet'],
  ['ขนาด', 'magnitude'],
  ['งานของแรงภายนอก', 'work by external force'],
  ['สม่ำเสมอ', 'uniform'],
  ['จุดศูนย์กลาง', 'centre'],
  ['ความเร็วคงที่', 'constant speed'],
  // chapter 3
  ['สนามแม่เหล็ก', 'magnetic field'],
  ['แรงแม่เหล็ก', 'magnetic force'],
  ['ความซาบซึมได้ของสุญญากาศ', 'permeability of free space'],
  ['กระแสไฟฟ้า', 'electric current'],
  ['ความหนาแน่นกระแส', 'current density'],
  ['ลวดตัวนำ', 'conducting wire'],
  ['ขดลวด / โซลีนอยด์', 'coil / solenoid'],
  ['จำนวนรอบต่อความยาว', 'turns per unit length'],
  ['รัศมีความโค้ง', 'radius of curvature'],
  ['ตั้งฉาก / ขนาน', 'perpendicular / parallel'],
  ['พุ่งออกจาก / พุ่งเข้ากระดาษ', 'out of / into the page'],
  // chapter 4
  ['ฟลักซ์แม่เหล็ก', 'magnetic flux'],
  ['แรงเคลื่อนไฟฟ้าเหนี่ยวนำ', 'induced emf'],
  ['กระแสเหนี่ยวนำ', 'induced current'],
  ['ขดลวดเหนี่ยวนำ / ตัวเหนี่ยวนำ', 'inductor'],
  ['ความเหนี่ยวนำ', 'inductance'],
  ['การเหนี่ยวนำตัวเอง', 'self-induction'],
  ['ค่าคงที่เวลา', 'time constant'],
  ['ตัวต้านทาน', 'resistor'],
  ['สับสวิตช์', 'close the switch'],
  ['ต่ออนุกรม', 'connected in series'],
  ['ตามเข็ม / ทวนเข็มนาฬิกา', 'clockwise / counter-clockwise'],
  // chapter 5
  ['คลื่นแม่เหล็กไฟฟ้า', 'electromagnetic wave'],
  ['กระแสกระจัด', 'displacement current'],
  ['คลื่นตามขวาง', 'transverse wave'],
  ['แอมพลิจูด', 'amplitude'],
  ['ความยาวคลื่น / ความถี่', 'wavelength / frequency'],
  ['เลขคลื่น', 'wave number k'],
  ['ความเข้มของคลื่น', 'intensity'],
  ['เวกเตอร์พอยน์ติง', 'Poynting vector'],
  ['กำลังเฉลี่ย', 'average power'],
  ['ความดันรังสี', 'radiation pressure'],
  ['ดูดกลืน / สะท้อน', 'absorb / reflect'],
  ['ตกกระทบ', 'incident'],
  ['สุญญากาศ', 'vacuum'],
];

/**
 * The official exam sheet ("ค่าคงที่และสูตรทางคณิตศาสตร์ ปลายภาค"), copied
 * as printed. Only the chapters that have lessons are listed; add the
 * next block from the sheet when a chapter is built.
 */
const sheetBlocks: { title: string; formulas: string[] }[] = [
  {
    title: "Electric Field and Gauss's Law",
    formulas: [
      r`\vec F_{12}=k_e\dfrac{q_1q_2}{r^2}\hat r_{12}\qquad \vec F=q\vec E`,
      r`\vec E=k_e\dfrac{q}{r^2}\hat r\qquad \vec E=k_e\int\dfrac{dq}{r^2}\hat r`,
      r`\Phi_E=\oint\vec E\cdot d\vec A=\dfrac{q_{in}}{\varepsilon_0}`,
    ],
  },
  {
    title: 'Electric Potential',
    formulas: [
      r`\Delta U=-q_0\int_A^B\vec E\cdot d\vec s\qquad \Delta V=\dfrac{\Delta U}{q_0}=-\int_A^B\vec E\cdot d\vec s`,
      r`W_{ext}=q\Delta V`,
      r`V=k_e\dfrac{q}{r}\qquad V=k_e\int\dfrac{dq}{r}\qquad U=k_e\dfrac{q_1q_2}{r_{12}}`,
      r`\vec E=-\left(\hat i\dfrac{\partial V}{\partial x}+\hat j\dfrac{\partial V}{\partial y}+\hat k\dfrac{\partial V}{\partial z}\right)`,
    ],
  },
  {
    title: 'Magnetic Field',
    formulas: [
      r`\vec F_B=q\vec v\times\vec B\qquad d\vec F_B=I\,d\vec s\times\vec B\qquad \vec F_B=I\vec\ell\times\vec B`,
      r`\vec B=\dfrac{\mu_0I}{4\pi}\int\dfrac{d\vec s\times\hat r}{r^2}\qquad \oint\vec B\cdot d\vec s=\mu_0I_{\text{enclosed}}`,
      r`\text{ลวดตรงยาวมาก: }B=\dfrac{\mu_0I}{2\pi a}\qquad \text{Solenoid: }B_{in}=\mu_0nI,\ B_{out}\approx0`,
    ],
  },
  {
    title: "Faraday's Law and Inductance",
    formulas: [
      r`\Phi_B=\int\vec B\cdot d\vec A\qquad \varepsilon=-\dfrac{d\Phi_B}{dt}\qquad |\varepsilon|=B\ell v`,
      r`\varepsilon_L=-L\dfrac{dI}{dt}\qquad \tau=\dfrac{L}{R}`,
      r`I(t)=\dfrac{\varepsilon}{R}\left(1-e^{-t/\tau}\right)\qquad I(t)=\dfrac{\varepsilon}{R}e^{-t/\tau}`,
    ],
  },
  {
    title: 'Electromagnetic waves',
    formulas: [
      r`\dfrac{E_m}{B_m}=\dfrac{|\vec E|}{|\vec B|}=c\qquad c=\dfrac{1}{\sqrt{\mu_0\varepsilon_0}}\qquad \vec S=\dfrac{1}{\mu_0}\vec E\times\vec B`,
      r`S=\varepsilon_0cE^2=\dfrac{cB^2}{\mu_0}\qquad S=\dfrac1A\dfrac{dU}{dt}=\dfrac{\text{Power}}{A}`,
      r`I=\dfrac{E_m^2}{2\mu_0c}\qquad S_{av}=I=\dfrac{(\text{Power})_{av}}{A}`,
      r`P=\dfrac{S}{c}\qquad P=\dfrac{2S}{c}\qquad P=\dfrac{(1+f)S}{c}`,
      r`p=\dfrac{U}{c}\qquad p=\dfrac{2U}{c}\qquad p=\dfrac{(1+f)U}{c}\qquad p=\dfrac{(1+f)U}{c}\cos\theta`,
    ],
  },
  {
    title: 'คณิตศาสตร์ที่ให้ (ใช้กับลวดยาวจำกัด วงแหวน ฯลฯ)',
    formulas: [
      r`\int\dfrac{dx}{x^2+a^2}=\dfrac1a\tan^{-1}\!\left(\dfrac xa\right)\qquad \int\dfrac{x\,dx}{x^2+a^2}=\dfrac12\ln(x^2+a^2)`,
      r`\int\dfrac{dx}{\sqrt{x^2+a^2}}=\ln\!\left(x+\sqrt{x^2+a^2}\right)\qquad \int\dfrac{x\,dx}{\sqrt{x^2+a^2}}=\sqrt{x^2+a^2}`,
      r`\int\dfrac{dx}{(x^2+a^2)^{3/2}}=\dfrac{x}{a^2\sqrt{x^2+a^2}}\qquad \int\dfrac{x\,dx}{(x^2+a^2)^{3/2}}=\dfrac{-1}{\sqrt{x^2+a^2}}`,
      r`\int\sin(ax)\,dx=-\dfrac1a\cos(ax)\qquad \int\cos(ax)\,dx=\dfrac1a\sin(ax)`,
      r`\int\dfrac{dx}{a+bx}=\dfrac1b\ln(a+bx)\qquad \int\dfrac{dx}{x}=\ln|x|\qquad \int x^n\,dx=\dfrac{x^{n+1}}{n+1}`,
    ],
  },
];

/**
 * Results the lessons and worksheet use that are NOT printed on the exam
 * sheet, with where each comes from. Grouped by chapter.
 */
const notOnSheet: { chapter: string; items: string[] }[] = [
  {
    chapter: 'บทที่ 1 กฎของเกาส์',
    items: [
      r`ในเนื้อตัวนำ $E=0$ และประจุอยู่ที่ผิว (หลักการ)`,
      r`ตัวนำกลวง: $q_{\text{ผิวใน}}=-q_{\text{โพรง}}$, $q_{\text{ผิวนอก}}=Q_{\text{สุทธิ}}-q_{\text{ผิวใน}}$ (ผิวเกาส์ในเนื้อโลหะ)`,
      r`แผ่นประจุใหญ่มาก: $E=\sigma/2\varepsilon_0$ (ผิวเกาส์ทรงกระบอก) แล้วรวมหลายแผ่นแบบเวกเตอร์`,
      r`นอกทรงกลมใด ๆ: $E=k_eQ/r^2$ เหมือนจุดประจุ (ผิวเกาส์ทรงกลม)`,
      r`ในฉนวนทรงกลมประจุสม่ำเสมอ: $q_{in}=Qr^3/a^3$ จึงได้ $E=k_eQr/a^3$`,
      r`ฟลักซ์ผ่านพื้นที่เรียบในสนามสม่ำเสมอ: $\Phi_E=EA\cos\theta$`,
      r`วงแหวนบนแกน: $E_x=k_eQx/(a^2+x^2)^{3/2}$ (จาก $k_e\int dq/r^2$ ส่วนด้านข้างหักล้างกัน)`,
    ],
  },
  {
    chapter: 'บทที่ 2 ศักย์ไฟฟ้า',
    items: [
      r`สนามสม่ำเสมอ: $\Delta V=-\vec E\cdot(\vec r_B-\vec r_A)$ (ดึง $\vec E$ ออกนอกอินทิกรัล)`,
      r`งานของสนาม $W_{field}=-q\Delta V$ (ตรงข้ามกับ $W_{ext}$)`,
      r`ตัวนำทรงกลม: ข้างใน $V=k_eQ/R$ (เท่าที่ผิว) ข้างนอก $k_eQ/r$`,
      r`$k_e=\dfrac{1}{4\pi\varepsilon_0}$ (ชีทให้แค่ตัวเลข $9\times10^9$) ใช้ตอนตอบเป็นตัวแปร เช่น $Q=4\pi\varepsilon_0RV_0$`,
      r`ทรงกลมสองลูกต่อลวด: $V$ เท่ากัน จึงได้ $q_1/q_2=r_1/r_2$`,
      r`วงแหวน: $V=k_eQ/\sqrt{a^2+x^2}$ (จาก $k_e\int dq/r$)`,
    ],
  },
  {
    chapter: 'บทที่ 3 บิโอต์–ซาวาร์ต และแอมแปร์',
    items: [
      r`วงกลมในสนามแม่เหล็ก: $qvB=mv^2/r$ จึงได้ $r=mv/qB$ และ $E_K=\tfrac12mv^2$ (ฟิสิกส์ ม.ปลาย)`,
      r`ตัวเลือกความเร็ว: $qE=qvB$ จึงได้ $v=E/B$`,
      r`ขนาดของ cross product: $F=qvB\sin\theta$, $F=I\ell B\sin\theta$`,
      r`ลวดคดในสนามสม่ำเสมอ: แรงเท่ากับลวดตรงที่ต่อปลายถึงปลาย`,
      r`ลวดตรงยาวจำกัด: $B=\dfrac{\mu_0I}{4\pi a}(\sin\theta_1+\sin\theta_2)$ (บิโอต์–ซาวาร์ต กับอินทิกรัล $(x^2+a^2)^{-3/2}$ ในชีท)`,
      r`ลวดหนา (กระแสสม่ำเสมอ): ข้างใน $B=\mu_0Ir/2\pi R^2$ (จากแอมแปร์ $I_{in}=Ir^2/R^2$)`,
      r`โซลีนอยด์: $n=N/\ell$ คือรอบต่อเมตร`,
      r`ทิศของ $\vec B$ รอบลวด: กฎมือขวา (หรือ ทิศกระแส × ทิศจากลวดไปยังจุด)`,
    ],
  },
  {
    chapter: 'บทที่ 4 ฟาราเดย์และความเหนี่ยวนำ',
    items: [
      r`สนามสม่ำเสมอ วงแบน: $\Phi_B=BA\cos\theta$ โดย $\theta$ วัดจากเวกเตอร์พื้นที่ (ตั้งฉากกับระนาบ)`,
      r`กฎของเลนซ์: สนามเหนี่ยวนำต้าน **การเปลี่ยนแปลง** ของฟลักซ์ แล้วใช้กำมือขวาหาทิศกระแส`,
      r`แท่งบนราง: $I=B\ell v/R$ และแรงต้าน $F_B=I\ell B=B^2\ell^2v/R$`,
      r`ขดลวดผ่านบริเวณสนาม: มี emf เฉพาะตอนเข้าและออก ตอนอยู่ในสนามทั้งขด $\varepsilon=0$`,
      r`กระแสสูงสุดในวงจร RL: $I_{max}=\varepsilon/R$ (ตัวเหนี่ยวนำไม่มีผลเมื่อกระแสคงที่)`,
      r`ที่ $t=\tau$: ขาขึ้นได้ $0.63\,\varepsilon/R$ ขาลงเหลือ $0.37\,\varepsilon/R$`,
      r`แรงดันขาขึ้น: $\Delta V_R=IR$, $\Delta V_L=\varepsilon-IR=\varepsilon e^{-t/\tau}$`,
      r`หาเวลาจากกระแส: $t=-\tau\ln\left(1-I/I_{max}\right)$`,
    ],
  },
  {
    chapter: 'บทที่ 5 คลื่นแม่เหล็กไฟฟ้า',
    items: [
      r`สมการของแมกซ์เวลล์และกระแสกระจัด $I_d=\varepsilon_0\,d\Phi_E/dt$ (รู้ความหมาย)`,
      r`อ่านสมการคลื่น $E=E_{max}\sin(kx-\omega t)$: $k=2\pi/\lambda$ (หน้า $x$), $\omega=2\pi f$ (หน้า $t$)`,
      r`$c=f\lambda$ (ฟิสิกส์ ม.ปลาย) และวงจร LC $\omega=1/\sqrt{LC}$`,
      r`ทิศของ $\vec B$: $\vec E\times\vec B$ ชี้ทางที่คลื่นวิ่ง จึงได้ $\hat B=\hat k\times\hat E$`,
      r`พื้นที่ที่คลื่นแผ่ไป: ทุกทิศทาง $4\pi r^2$, เฉพาะเหนือพื้นโลก $2\pi r^2$`,
      r`พลังงานที่ตกบนพื้นที่: $U=IAt$`,
      r`แรงบนดาวเคราะห์: พื้นที่หน้าตัด $\pi R^2$ และ $F=PA$ (รัศมีดาวต้องให้ในโจทย์)`,
      r`ลำดับสเปกตรัม: วิทยุ → ไมโครเวฟ → อินฟราเรด → แสง (700–400 nm) → UV → เอกซ์ → แกมมา`,
    ],
  },
];

export function CheatPage() {
  return (
    <>
      <section className="card">
        <h2>สูตร</h2>
        <p>
          ในห้องสอบมีชีท <b>“ค่าคงที่และสูตรทางคณิตศาสตร์”</b> ให้ จึงไม่ต้องท่องสูตรในชีท หน้านี้คัดสูตรในชีทมาตามที่พิมพ์จริง (เฉพาะบทที่มีบทเรียนแล้ว)
          แล้วตามด้วยสิ่งที่ <b>ไม่อยู่ในชีท</b> ซึ่งต้องหาเองหรือเข้าใจเอง
        </p>
        <p className="small">เว็บนี้เขียน <Tex>k</Tex> แทน <Tex>{r`k_e`}</Tex> ในชีทและสไลด์</p>
      </section>

      <section className="card">
        <h2>ค่าคงที่ (ตามชีท)</h2>
        <ul>
          <Li>{r`$k_e=9\times10^{9}\ \mathrm{N\,m^2/C^2}$`}</Li>
          <Li>{r`$\varepsilon_0=8.85\times10^{-12}\ \mathrm{C^2/(N\,m^2)}$`}</Li>
          <Li>{r`$\mu_0=4\pi\times10^{-7}\ \mathrm{T\,m/A}$`}</Li>
          <Li>{r`$e=1.60\times10^{-19}$ C และ $1\ \mathrm{eV}=1.6\times10^{-19}$ J`}</Li>
          <Li>{r`$m_p=1.67\times10^{-27}$ kg และ $m_e=9.1\times10^{-31}$ kg`}</Li>
          <Li>{r`$1\,\mathrm u=1.66054\times10^{-27}$ kg $=931.50\ \mathrm{MeV}/c^2$`}</Li>
          <Li>{r`$h=6.63\times10^{-34}$ J·s และ $c=3\times10^{8}$ m/s`}</Li>
          <Li>{r`$g=9.8\ \mathrm{m/s^2}$ และ $N_A=6.02\times10^{23}$ ต่อ mol`}</Li>
          <Li>{r`1 atm $=1.01\times10^{5}\ \mathrm{N/m^2}$, 1 fm $=10^{-15}$ m, 1 Ci $=3.70\times10^{10}$ Bq`}</Li>
        </ul>
        <p className="note">
          <T>{r`ถ้าโจทย์ให้ค่าเอง ให้ใช้ค่าในโจทย์ เช่น ข้อ 26 ให้มวลโปรตอน $1.66\times10^{-27}$ kg ไม่ใช่ $m_p=1.67\times10^{-27}$ ในชีท`}</T>
        </p>
      </section>

      <section className="card">
        <h2>สูตรในชีท บทที่ 1–5</h2>
        {sheetBlocks.map((b) => (
          <div key={b.title}>
            <h3>{b.title}</h3>
            {b.formulas.map((f) => (
              <M key={f}>{f}</M>
            ))}
          </div>
        ))}
      </section>

      <section className="card">
        <h2>ไม่อยู่ในชีท ต้องหาเองหรือเข้าใจเอง</h2>
        <p className="small">แต่ละข้อบอกว่าหามาจากอะไร ส่วนใหญ่ได้จากสูตรในชีทบวกผิวเกาส์หรือวงแอมแปร์ที่เลือกดี ๆ</p>
        {notOnSheet.map((g) => (
          <div key={g.chapter}>
            <h3>{g.chapter}</h3>
            <ul>
              {g.items.map((t) => (
                <Li key={t}>{t}</Li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <section className="card">
        <h2>กับดักที่ทำให้เสียคะแนน</h2>
        <ol>
          <Li>{r`**เช็กบริเวณก่อน** ก่อนหยิบสูตร ถามว่า: จุดนี้อยู่ในเนื้อโลหะ ในฉนวน หรือข้างนอก? ข้อ 21(ก) และครึ่งหนึ่งของข้อ 25 ตอบได้จากการเช็กนี้อย่างเดียว`}</Li>
          <Li>{r`**ข้างในตัวนำ vs ฉนวน** ตัวนำ: $E=0$ ฉนวนประจุสม่ำเสมอ: $E=kQr/a^{3}$ อ่านคำให้ดี: “ตัวนำ” กับ “ฉนวน”`}</Li>
          <Li>{r`**$E=0$ ไม่ใช่ $V=0$** ในตัวนำ $V$ เท่ากับค่าที่ผิว $kQ/R$`}</Li>
          <Li>{r`**$1/r^{2}$ สำหรับ $E$, $1/r$ สำหรับ $V$** สลับกันง่ายที่สุดตอนรีบ`}</Li>
          <Li>{r`**$V_A-V_B$ หรือ $V_B-V_A$?** $\Delta V$ คือ ปลาย ลบ ต้น ขีดเส้นใต้ว่าโจทย์ถามอันไหน`}</Li>
          <Li>{r`**เครื่องหมายของประจุ** เก็บเครื่องหมายของ $q$ ใน $V$, $U$ และ $W$ ส่วน “ขนาดของสนามไฟฟ้า” ให้ตัดเครื่องหมายแล้วบอกทิศเป็นคำพูด`}</Li>
          <Li>{r`**หน่วย** $\mu\mathrm C=10^{-6}$ C, nC $=10^{-9}$ C, cm $=10^{-2}$ m แปลงก่อนแทนค่าเสมอ`}</Li>
          <Li>{r`**แผ่นประจุบวกกันแบบเวกเตอร์** วาดลูกศรของแต่ละแผ่นในแต่ละบริเวณก่อนค่อยบวก`}</Li>
          <Li>{r`**ลวดยาว: $1/r$ ไม่ใช่ $1/r^{2}$** สนามของลวดยาวมาก $\mu_0I/2\pi r$ ลดช้ากว่าสนามของจุดประจุ`}</Li>
          <Li>{r`**MeV ต้องแปลงเป็นจูล** $1\ \mathrm{MeV}=10^{6}\times1.60\times10^{-19}$ J และอย่าลืมเลข 2 ใน $v=\sqrt{2E_K/m}$`}</Li>
          <Li>{r`**ประจุลบกลับทิศแรง** ใช้กฎมือขวากับ $\vec v\times\vec B$ ก่อน แล้วค่อยกลับทิศถ้า $q<0$`}</Li>
          <Li>{r`**โซลีนอยด์ใช้ $n$ ไม่ใช่ $N$** $n=N/\ell$ หน่วยรอบต่อเมตร`}</Li>
          <Li>{r`**ลวดหลายเส้นบวกแบบเวกเตอร์** หาทิศของแต่ละเส้นด้วยกฎกำมือขวาก่อน แล้วค่อยบวกหรือลบ`}</Li>
          <Li>{r`**เลนซ์ต้าน “การเปลี่ยนแปลง” ไม่ใช่ต้าน $B$** ฟลักซ์ลด สนามเหนี่ยวนำชี้ทางเดียวกับ $B$ เดิม`}</Li>
          <Li>{r`**$\tau=L/R$ ไม่ใช่ $R/L$** และแปลง mH, ms เป็น H, s ก่อนแทน`}</Li>
          <Li>{r`**กระแสขาขึ้นหรือขาลง?** ต่อแบตเตอรี่ใช้ $1-e^{-t/\tau}$ ตัดแบตเตอรี่ใช้ $e^{-t/\tau}$`}</Li>
          <Li>{r`**$B=E/c$ หาร ไม่ใช่คูณ** และ $\lambda=2\pi/k$ อย่าลืม $2\pi$ ถามความถี่ตอบ $f$ ไม่ใช่ $\omega$`}</Li>
          <Li>{r`**ทุกทิศทาง $4\pi r^2$ · เหนือพื้นโลก $2\pi r^2$** อ่านโจทย์ก่อนเลือกพื้นที่ และแปลง kW, นาที, km ก่อนแทน`}</Li>
          <Li>{r`**ดูดกลืน $S/c$ · สะท้อน $2S/c$** และความเข้มมี $\tfrac12$: $I=E_{max}^2/2\mu_0c$`}</Li>
        </ol>
      </section>

      <section className="card">
        <h2>ศัพท์ไทย–อังกฤษ</h2>
        <div className="scroll">
          <table>
            <tbody>
              {glossary.map(([th, en]) => (
                <tr key={th}>
                  <td>{th}</td>
                  <td>
                    <T>{en}</T>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
