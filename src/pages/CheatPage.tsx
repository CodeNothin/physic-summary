import { Li, T, Tex, r } from '../components/ui';

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
];

export function CheatPage() {
  return (
    <>
      <section className="card">
        <h2>สรุปสูตร</h2>
        <p className="small">
          ค่าคงที่ที่แบบฝึกหัดใช้: <Tex>{r`k=\dfrac{1}{4\pi\varepsilon_0}\approx 9.0\times10^{9}\ \mathrm{N\,m^2/C^2}`}</Tex> และ{' '}
          <Tex>{r`\varepsilon_0=8.85\times10^{-12}\ \mathrm{C^2/N\,m^2}`}</Tex>
        </p>
        <div className="grid2">
          <div>
            <h3 style={{ marginTop: 0 }}>กฎของเกาส์</h3>
            <ul>
              <Li>{r`ฟลักซ์: $\Phi_E=EA\cos\theta$`}</Li>
              <Li>{r`กฎ: $\oint\vec E\cdot d\vec A=q_{in}/\varepsilon_0$`}</Li>
              <Li>{r`จุดประจุ หรือนอกทรงกลมใด ๆ: $E=kQ/r^{2}$`}</Li>
              <Li>{r`ในฉนวนทรงกลมประจุสม่ำเสมอ: $E=kQr/a^{3}$`}</Li>
              <Li>{r`แผ่นประจุใหญ่มาก: $E=\sigma/2\varepsilon_0$`}</Li>
              <Li>{r`ในเนื้อโลหะ: $E=0$`}</Li>
              <Li>{r`โพรง: $q_{\text{ผิวใน}}=-q_{\text{โพรง}}$, $q_{\text{ผิวนอก}}=Q_{\text{สุทธิ}}-q_{\text{ผิวใน}}$`}</Li>
              <Li>{r`วงแหวนบนแกน: $E_x=kQx/(a^{2}+x^{2})^{3/2}$`}</Li>
            </ul>
          </div>
          <div>
            <h3 style={{ marginTop: 0 }}>ศักย์ไฟฟ้า</h3>
            <ul>
              <Li>{r`$\Delta V=-\int\vec E\cdot d\vec s$ ; สนามสม่ำเสมอ: $-\vec E\cdot\vec S$`}</Li>
              <Li>{r`$U=qV$, $W_{ext}=q\Delta V$, $W_{int}=-q\Delta V$`}</Li>
              <Li>{r`จุดประจุ: $V=kq/r$`}</Li>
              <Li>{r`พลังงานของคู่ประจุ: $U=kq_1q_2/r_{12}$ บวกทุกคู่`}</Li>
              <Li>{r`$E_x=-dV/dx$`}</Li>
              <Li>{r`วงแหวน: $V=kQ/\sqrt{a^{2}+x^{2}}$`}</Li>
              <Li>{r`จาน: $V=2\pi k\sigma[\sqrt{R^{2}+x^{2}}-x]$`}</Li>
              <Li>{r`ตัวนำทรงกลม: ข้างใน $V=kQ/R$ ข้างนอก $kQ/r$`}</Li>
              <Li>{r`สองทรงกลมต่อลวด: $q_1/q_2=r_1/r_2$, $E_1/E_2=r_2/r_1$`}</Li>
            </ul>
          </div>
        </div>
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
