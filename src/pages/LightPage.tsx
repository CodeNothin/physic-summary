// =====================================================================
// Chapter 6 page: light — refraction, interference, diffraction and
// polarization (slides 1–43) plus worksheet questions 31–33.
//
// How this file is built (same as EMWavePage):
//   <Section id=...>   one card; `id` is the progress key and the URL anchor
//   <P>{r`...`}</P>    a paragraph; $...$ inside is inline math, **...** is bold
//   <M>{r`...`}</M>    a display equation (KaTeX)
//   <W id="..." />     an interactive widget (see src/widgets/all.ts)
//   <Worked title=...> a fold-out worked example
// r`...` is String.raw, so backslashes in TeX need no escaping.
// =====================================================================
import { Analogy, M, Note, P, Section, Worked, r } from '../components/ui';
import { W } from '../widgets/registry';

/** Section list for the chips at the top of the page (order = order on the page). */
export const lightSections = [
  { id: 'l-speed', label: 'อัตราเร็วแสง' },
  { id: 'l-refraction', label: 'การหักเห' },
  { id: 'l-tir', label: 'สะท้อนกลับหมด' },
  { id: 'l-double', label: 'สลิตคู่' },
  { id: 'l-single', label: 'สลิตเดี่ยว' },
  { id: 'l-grating', label: 'เกรตติง' },
  { id: 'l-polar', label: 'โพลาไรเซชัน' },
];

export function LightPage() {
  return (
    <>
      {/* ---------------------------------------------- slides 2–3 */}
      <Section id="l-speed" eyebrow="ตอนที่ 1 · แสงในตัวกลาง" title="อัตราเร็วแสงและหลักของฮอยเกนส์" en="speed of light, Huygens's principle">
        <P>{r`แสงคือคลื่นแม่เหล็กไฟฟ้าความยาวคลื่น 400 ถึง 700 nm ในสุญญากาศวิ่งด้วย $c=1/\sqrt{\mu_0\varepsilon_0}\approx3\times10^8$ m/s (บทที่ 5) ในสสาร $\varepsilon=K_e\varepsilon_0$ และ $\mu=K_m\mu_0$ จึงช้าลง`}</P>
        <M>{r`v=\frac{1}{\sqrt{\mu\varepsilon}}=\frac{c}{\sqrt{K_eK_m}}`}</M>
        <h3>หลักของฮอยเกนส์ (สไลด์ 3)</h3>
        <P>{r`ทุกจุดบนหน้าคลื่นเป็นแหล่งกำเนิดคลื่นวงกลมเล็ก ๆ (คลื่นทุติยภูมิ) ที่แผ่ออกด้วยอัตราเร็วเดิม เส้นที่สัมผัสคลื่นเล็ก ๆ ทั้งหมดคือหน้าคลื่นใหม่ หลักนี้อธิบายได้ทั้งการหักเห (คลื่นเล็กในตัวกลางช้ากว่าสั้นกว่า) และการเลี้ยวเบน (ที่ขอบช่อง คลื่นเล็กแผ่อ้อมไปได้)`}</P>
      </Section>

      {/* ---------------------------------------------- slides 4–9, Q33 */}
      <Section id="l-refraction" title="การสะท้อนและการหักเห" en="reflection and refraction">
        <P>{r`ทุกมุมวัดจาก **เส้นปกติ** (เส้นตั้งฉากกับผิว) ไม่ใช่จากผิว`}</P>
        <M>{r`\text{สะท้อน: }\theta_1=\theta_1'\qquad \text{สเนล: }\frac{\sin\theta_2}{\sin\theta_1}=\frac{n_1}{n_2}=\frac{v_2}{v_1}=\frac{\lambda_2}{\lambda_1}`}</M>
        <P>{r`**ดัชนีหักเห** $n=c/v$ ไม่มีหน่วยและมากกว่า 1 เสมอ (อากาศ $\approx1.000$, น้ำ 1.333, แก้ว 1.52, เพชร 2.419 จากตารางสไลด์ 6) เขียนสเนลแบบที่จำง่ายได้ว่า $n_1\sin\theta_1=n_2\sin\theta_2$`}</P>
        <h3>อะไรเปลี่ยน อะไรไม่เปลี่ยน (สไลด์ 8)</h3>
        <P>{r`ข้ามรอยต่อ **ความถี่ไม่เปลี่ยน** (ต้นกำเนิดสั่นเท่าเดิม) อัตราเร็วลด ความยาวคลื่นจึงลดตาม`}</P>
        <M>{r`v=\lambda f\qquad n=\frac{c}{v}=\frac{\lambda}{\lambda_n}\qquad\Rightarrow\qquad \lambda_n=\frac{\lambda}{n}`}</M>
        <P>{r`$n$ ขึ้นกับความยาวคลื่นเล็กน้อย (สไลด์ 5 กราฟขวาบน) แสงม่วงมี $n$ มากกว่าแสงแดง จึงหักเหมากกว่า แสงขาวผ่านปริซึมจึงแยกเป็นสี ผิวเรียบสะท้อนเป็นระเบียบ ผิวขรุขระสะท้อนกระจาย`}</P>
        <W id="snell" />

        <Worked title="ตัวอย่างในสไลด์ 9: ถังน้ำที่แสงอาทิตย์ส่องไม่ถึงก้น">
          <P>{r`ถังน้ำทรงกระบอกเส้นผ่านศูนย์กลาง 3 m บรรจุน้ำเต็มถัง ดวงอาทิตย์ทำมุม 28° เหนือขอบฟ้า แสงอาทิตย์ส่องไม่ถึงก้นถัง จงหาความลึกถังที่น้อยที่สุด ($n_{\text{น้ำ}}=1.333$)`}</P>
          <P>{r`**1. มุมตกกระทบวัดจากเส้นปกติ** ผิวน้ำแนวนอน เส้นปกติแนวตั้ง จึงได้ $\theta_1=90^\circ-28^\circ=62^\circ$`}</P>
          <M>{r`\sin\theta_2=\frac{\sin62^\circ}{1.333}=0.662\qquad\Rightarrow\qquad \theta_2=41.5^\circ`}</M>
          <P>{r`**2. รังสีที่เข้าที่ขอบถังด้านหนึ่งต้องไปไม่ถึงมุมก้นอีกด้าน** ที่ความลึกน้อยที่สุดมันชนมุมพอดี $\tan\theta_2=D/h$`}</P>
          <M>{r`h=\frac{D}{\tan\theta_2}=\frac{3}{\tan41.5^\circ}=3.39\ \mathrm m`}</M>
        </Worked>

        <Worked title="แบบฝึกหัดข้อ 33 ทีละขั้น">
          <P>{r`ยิงลำแสงผ่านแผ่นพลาสติกความหนาสม่ำเสมอ $d$ ด้วยมุมตกกระทบ $60^\circ$ ในอากาศ ลำแสงออกจากแผ่นที่ตำแหน่งห่างจากแนวที่ลำแสงตกกระทบ $x$ จงหาเวลาที่แสงเดินทางในแผ่นพลาสติก`}</P>
          <P>{r`**1. หาดัชนีหักเห** มุมหักเห $\theta$ ในแผ่น สเนล: $1\cdot\sin60^\circ=n\sin\theta$ จึงได้ $n=\sin60^\circ/\sin\theta$`}</P>
          <P>{r`**2. ระยะทางในแผ่น** สามเหลี่ยมมุมฉากที่มีด้าน $d$ (ความหนา) และ $x$: $L=\sqrt{d^2+x^2}$ และ $\sin\theta=x/L$`}</P>
          <P>{r`**3. เวลา** อัตราเร็วในแผ่น $v=c/n$`}</P>
          <M>{r`t=\frac{L}{v}=\frac{Ln}{c}=\frac{L\sin60^\circ}{c\sin\theta}=\frac{L^2(\sqrt3/2)}{cx}=\left(\frac{\sqrt3}{2}\right)\frac{d^2+x^2}{cx}`}</M>
        </Worked>
        <Note>{r`กับดัก: (1) มุมในสเนลวัดจากเส้นปกติ ถ้าโจทย์ให้มุมกับผิวหรือกับขอบฟ้า ใช้ $90^\circ-$ มุมนั้น (2) ในตัวกลาง แสงช้าลงเป็น $c/n$ อย่าใช้ $c$ หาเวลา (3) ความถี่ไม่เปลี่ยน ความยาวคลื่นเปลี่ยน`}</Note>
      </Section>

      {/* ---------------------------------------------- slide 7 */}
      <Section id="l-tir" title="การสะท้อนกลับหมดและมุมวิกฤต" en="total internal reflection">
        <P>{r`แสงจากตัวกลาง $n$ มาก ไปตัวกลาง $n$ น้อย (เช่น แก้วไปอากาศ) เบน **ออกจาก** เส้นปกติ $\theta_2>\theta_1$ เพิ่ม $\theta_1$ ไปเรื่อย ๆ จน $\theta_2=90^\circ$ มุมตกกระทบตอนนั้นคือ **มุมวิกฤต**`}</P>
        <M>{r`n_1\sin\theta_c=n_2\sin90^\circ\qquad\Rightarrow\qquad \sin\theta_c=\frac{n_2}{n_1}\qquad(n_2<n_1)`}</M>
        <P>{r`ถ้า $\theta_1>\theta_c$ ไม่มีรังสีหักเหเลย แสงสะท้อนกลับทั้งหมด ใช้ในเส้นใยนำแสง เกิดได้เฉพาะเมื่อแสงออกจากตัวกลางที่ $n$ มากกว่า ลองในวิดเจ็ตข้างบน: ตั้งด้านบนเป็นเพชร ด้านล่างเป็นอากาศ`}</P>
      </Section>

      {/* ---------------------------------------------- slides 10–16, Q31–32 */}
      <Section id="l-double" eyebrow="ตอนที่ 2 · การแทรกสอด" title="การทดลองสลิตคู่ของยัง" en="Young's double-slit experiment">
        <P>{r`แสงความถี่เดียวผ่านสลิตสองช่องห่างกัน $d$ ไปถึงจุด $P$ บนฉากที่ห่าง $L$ คลื่นจากสองช่องเดินทางไกลไม่เท่ากัน **ผลต่างระยะทาง** คือ`}</P>
        <M>{r`\delta=r_2-r_1=d\sin\theta`}</M>
        <P>{r`ต่างกันเป็นจำนวนเต็มเท่าของ $\lambda$ คลื่นมาถึงพร้อมกันยอดชนยอด เสริมกัน (แถบสว่าง) ต่างกันครึ่งคลื่น ยอดชนท้อง หักล้างกัน (แถบมืด)`}</P>
        <M>{r`d\sin\theta=\begin{cases}m\lambda & \text{สว่าง}\\(m+\tfrac12)\lambda & \text{มืด}\end{cases}\qquad m=0,\pm1,\pm2,\dots`}</M>
        <h3>ตำแหน่งบนฉาก (สไลด์ 11)</h3>
        <P>{r`ฉากไกลมาก $d\ll L$ มุมเล็ก $\sin\theta\approx\tan\theta=y/L$`}</P>
        <M>{r`y_{bright}=\frac{\lambda L}{d}m\qquad y_{dark}=\frac{\lambda L}{d}\left(m+\tfrac12\right)\qquad \Delta y=\frac{\lambda L}{d}`}</M>
        <P>{r`ระวังการนับ: แถบมืด **แรก** คือ $m=0$ อยู่ที่ $\tfrac12\lambda L/d$ (สไลด์ 11: "แถบมืดที่ $m+1$") แถบสว่างกลางคือ $m=0$ แถบสว่างที่ 2 คือ $m=2$`}</P>
        <h3>ความเข้ม (สไลด์ 12–13)</h3>
        <P>{r`ผลต่างเฟส $\phi/2\pi=\delta/\lambda$ จึงได้ $\phi=\frac{2\pi}{\lambda}d\sin\theta$ และ`}</P>
        <M>{r`I=I_{max}\cos^2\left(\frac{\phi}{2}\right)=I_{max}\cos^2\left(\frac{\pi d\sin\theta}{\lambda}\right)\approx I_{max}\cos^2\left(\frac{\pi dy}{\lambda L}\right)`}</M>
        <W id="doubleSlit" />

        <Worked title="แบบฝึกหัดข้อ 31 ทีละขั้น (ตอบเป็นตัวแปร)">
          <P>{r`แสงเอกรงค์ความยาวคลื่น $\lambda$ ผ่านสลิตคู่ห่างกัน $d$ ไปแทรกสอดบนฉากห่าง $L$ ($L\gg d$) $x$ คือระยะจากกึ่งกลางแถบสว่างกลางถึงกึ่งกลางแถบมืดแถบแรก`}</P>
          <P>{r`**ก.** แถบมืดแรก: $d\dfrac{x}{L}=\left(0+\tfrac12\right)\lambda$`}</P>
          <M>{r`x=\frac{\lambda L}{2d}`}</M>
          <P>{r`**ข.** เลื่อนฉากออกไปอีก $\Delta L$ แทน $L$ ด้วย $L+\Delta L$ แล้วลบค่าเดิม`}</P>
          <M>{r`x+\Delta x=\frac{\lambda(L+\Delta L)}{2d}=\frac{\lambda L}{2d}+\frac{\lambda\Delta L}{2d}\qquad\Rightarrow\qquad \Delta x=\frac{\lambda\Delta L}{2d}`}</M>
          <P>{r`**ค.** ให้ $x$ เท่าเดิมโดยเปลี่ยน $\lambda$: จากข้อ ก. $\lambda=2dx/L$ จึงได้ $\lambda_1=2dx/L$ และ $\lambda_2=2dx/(L+\Delta L)$`}</P>
          <M>{r`\frac{\lambda_2}{\lambda_1}=\frac{L}{L+\Delta L}=\left(1+\frac{\Delta L}{L}\right)^{-1}`}</M>
        </Worked>

        <Worked title="แบบฝึกหัดข้อ 32 ทีละขั้น">
          <P>{r`แสง 600 nm ผ่านสลิตคู่ห่างกัน $6.40\times10^{-4}$ m แถบสว่างที่ 2 อยู่ห่างจากกึ่งกลางแถบสว่างกลาง $3.60\times10^{-3}$ m ที่ตำแหน่ง $3.40\times10^{-3}$ m ความเข้มเป็นกี่เท่าของความเข้มสูงสุด`}</P>
          <P>{r`**1. หา $L$** ที่ยังไม่รู้ จากแถบสว่างที่ 2 ($m=2$): $d\,y_m/L=m\lambda$`}</P>
          <M>{r`L=\frac{d\,y_m}{m\lambda}=\frac{(6.40\times10^{-4})(3.60\times10^{-3})}{2(600\times10^{-9})}=1.92\ \mathrm m`}</M>
          <P>{r`**2. ความเข้ม** ที่ $y=3.40\times10^{-3}$ m`}</P>
          <M>{r`I=I_{max}\cos^2\left(\frac{\pi dy}{\lambda L}\right)=I_{max}\cos^2\left(\frac{\pi(6.40\times10^{-4})(3.40\times10^{-3})}{(600\times10^{-9})(1.92)}\right)`}</M>
          <M>{r`=I_{max}\cos^2(5.93\ \mathrm{rad})=I_{max}\cos^2(340^\circ)=0.883\,I_{max}`}</M>
          <P>{r`ทางลัด: แทน $L$ กลับเข้าไป $d$ กับ $\lambda$ ตัดกันหมด เหลือ $I/I_{max}=\cos^2(\pi m\,y/y_m)=\cos^2(\pi\cdot2\cdot3.40/3.60)$ ได้ค่าเดียวกัน (ใช้เช็กคำตอบได้)`}</P>
        </Worked>

        <Worked title="ตัวอย่างในสไลด์ 14: แถบมืดที่ 1 ตรงกับแถบสว่างที่ 1">
          <P>{r`แสง 600 nm ผ่านสลิตคู่ ฉากห่าง 3 m แถบสว่างที่ 1 อยู่ห่างกลาง 4.84 mm แสงความยาวคลื่นเท่าใดให้แถบมืดที่ 1 ณ ตำแหน่งเดียวกัน`}</P>
          <M>{r`y=\frac{(600\ \mathrm{nm})L}{d}(1)=\frac{\lambda' L}{d}\left(0+\tfrac12\right)\qquad\Rightarrow\qquad \lambda'=2\times600=1200\ \mathrm{nm}`}</M>
          <P>{r`$L$ และ $d$ ตัดกันหมด ตัวเลข 4.84 mm กับ 3 m ไม่จำเป็น (ใช้หา $d=3.72\times10^{-4}$ m ได้ถ้าต้องการ) คำตอบ 1200 nm อยู่ในช่วงอินฟราเรด`}</P>
        </Worked>

        <Worked title="ตัวอย่างในสไลด์ 15: ตำแหน่งที่ความเข้มเป็น 3/4 ของค่าสูงสุด">
          <P>{r`$\lambda=600$ nm, $d=2$ mm, $L=1$ m หาตำแหน่งที่ใกล้กลางที่สุดที่ $I=\tfrac34I_{max}$`}</P>
          <M>{r`\cos^2\left(\frac{\pi dy}{\lambda L}\right)=\frac34\ \Rightarrow\ \cos\left(\frac{\pi dy}{\lambda L}\right)=\frac{\sqrt3}{2}\ \Rightarrow\ \frac{\pi dy}{\lambda L}=\frac{\pi}{6}`}</M>
          <M>{r`y=\frac{\lambda L}{6d}=\frac{(600\times10^{-9})(1)}{6(2\times10^{-3})}=5.0\times10^{-5}\ \mathrm m=0.050\ \mathrm{mm}`}</M>
        </Worked>
        <Note>{r`กับดัก: (1) แถบมืดแรกคือ $m=0$ ใน $(m+\tfrac12)$ (2) ใน $\cos^2(\pi dy/\lambda L)$ มุมเป็น **เรเดียน** ตั้งเครื่องคิดเลขให้ถูก (3) ถามความเข้ม "กี่เท่า" ตอบ $I/I_{max}$ ไม่มีหน่วย`}</Note>
        <P>{r`การแทรกสอดเห็นได้รอบตัว (สไลด์ 16): ฟองสบู่ คราบน้ำมันบนถนน ปีกผีเสื้อ แผ่น CD`}</P>
      </Section>

      {/* ---------------------------------------------- slides 17–28 */}
      <Section id="l-single" eyebrow="ตอนที่ 3 · การเลี้ยวเบน" title="การเลี้ยวเบนผ่านสลิตเดี่ยว" en="single-slit diffraction">
        <P>{r`การเลี้ยวเบนแบบฟรอนโฮเฟอร์: แหล่งกำเนิดและฉากอยู่ไกลจากช่องมาก ลำแสงที่ออกจากช่องจึงขนานกัน ช่องกว้าง $a$ ให้แถบ **มืด** ที่`}</P>
        <M>{r`a\sin\theta_{dark}=m\lambda\qquad m=\pm1,\pm2,\pm3,\dots`}</M>
        <P>{r`สังเกตว่า $m$ **ไม่มี 0** ($\theta=0$ คือกลางแถบสว่างกลาง) และสูตรนี้หน้าตาเหมือน "สว่าง" ของสลิตคู่ แต่ให้ "มืด" อย่าสลับกัน บนฉากห่าง $D$: $y_m=m\lambda D/a$`}</P>
        <M>{r`I_\theta=I_m\left(\frac{\sin\alpha}{\alpha}\right)^2\qquad \alpha=\frac{\pi a}{\lambda}\sin\theta`}</M>
        <P>{r`**แถบสว่างกลางกว้าง $2\lambda D/a$** (จากแถบมืดแรกด้านหนึ่งถึงอีกด้าน) กว้างเป็นสองเท่าของแถบอื่น และ **สลิตยิ่งแคบ แถบกลางยิ่งกว้าง**`}</P>
        <W id="singleSlit" />
        <h3>สลิตคู่ที่ช่องมีความกว้าง (สไลด์ 21–24)</h3>
        <P>{r`ของจริงแต่ละช่องมีความกว้าง ความเข้มจึงเป็นผลคูณ ลายสลิตคู่ (ถี่) ถูกคุมด้วยเส้นห่อของสลิตเดี่ยว (ห่าง) ลองเปิด "รวมความกว้างสลิต" ในวิดเจ็ตสลิตคู่`}</P>
        <M>{r`I=I_{max}\cos^2\left(\frac{\pi d\sin\theta}{\lambda}\right)\left[\frac{\sin(\pi a\sin\theta/\lambda)}{\pi a\sin\theta/\lambda}\right]^2`}</M>
        <h3>กำลังแยก: เกณฑ์ของเรย์ลี (สไลด์ 27–28)</h3>
        <P>{r`ภาพของสองแหล่งกำเนิดที่ห่างกันเป็นมุม $\theta$ เริ่มแยกออกได้เมื่อกลางแถบสว่างของภาพหนึ่งทับแถบมืดแรกของอีกภาพพอดี`}</P>
        <M>{r`\text{สลิต: }\theta_{min}=\frac{\lambda}{a}\qquad \text{ช่องกลม เส้นผ่านศูนย์กลาง }D:\ \theta_R=\frac{1.22\lambda}{D}`}</M>

        {/* TODO(professor-method): "ริ้วมืดที่อยู่ถัดกัน 2 ริ้ว" is read as two neighbouring darks on the SAME side
            (λD/a apart). If the professor means the two darks either side of the centre (2λD/a), a doubles. README §10. */}
        <Worked title="ตัวอย่างในสไลด์ 25: หาความกว้างสลิต">
          <P>{r`แสง 600 nm ตกกระทบสลิตเดี่ยว ฉากห่าง 2.0 m ริ้วมืดที่อยู่ถัดกัน 2 ริ้วห่างกัน 4.0 mm จงหาความกว้างสลิต`}</P>
          <P>{r`ริ้วมืดถัดกันด้านเดียวกันห่างกัน $y_{m+1}-y_m=\lambda D/a$`}</P>
          <M>{r`a=\frac{\lambda D}{\Delta y}=\frac{(600\times10^{-9})(2.0)}{4.0\times10^{-3}}=3.0\times10^{-4}\ \mathrm m=0.30\ \mathrm{mm}`}</M>
        </Worked>
        <Worked title="ตัวอย่างในสไลด์ 26: แถบมืดลำดับที่ 1 และความกว้างแถบสว่างกลาง">
          <P>{r`แสง 580 nm ตกกระทบสลิตกว้าง 0.3 mm ฉากห่าง $D=2$ m`}</P>
          <M>{r`y_1=\frac{\lambda D}{a}=\frac{(580\times10^{-9})(2)}{0.3\times10^{-3}}=3.87\times10^{-3}\ \mathrm m`}</M>
          <M>{r`\text{ความกว้างแถบสว่างกลาง}=2y_1=7.73\times10^{-3}\ \mathrm m`}</M>
        </Worked>
      </Section>

      {/* ---------------------------------------------- slides 29–34 */}
      <Section id="l-grating" title="เกรตติงเลี้ยวเบน" en="diffraction grating">
        <P>{r`เกรตติงคือสลิตจำนวนมาก $N$ ช่อง ห่างกันเท่า ๆ กัน $d$ ตำแหน่งแถบสว่างเหมือนสลิตคู่ แต่ยิ่ง $N$ มาก แถบสว่างยิ่งแคบและคม จนเป็นเส้น (สไลด์ 29)`}</P>
        <M>{r`d\sin\theta_{bright}=m\lambda\qquad m=0,\pm1,\pm2,\dots`}</M>
        <P>{r`$d$ = ระยะห่างระหว่างช่อง ได้จาก **ความยาวหารจำนวนเส้น** เช่น 500 เส้นต่อ mm ให้ $d=1\ \mathrm{mm}/500=2\ \mu\mathrm m$ ที่ลำดับเดียวกัน มุมแปรตาม $\lambda$ แสงแดงจึงเบนมากกว่าแสงน้ำเงิน เกรตติงจึงแยกแสงสีต่าง ๆ ได้ ($m=0$ ยังเป็นสีขาว)`}</P>
        <P>{r`ลำดับสูงสุดที่เห็น: $\sin\theta\le1$ จึงได้ $m\le d/\lambda$`}</P>
        <W id="grating" />
        <Worked title="ตัวอย่างในสไลด์ 34: มุมของลำดับที่ 1">
          <P>{r`เกรตติงมี $1.26\times10^4$ เส้นต่อ 25.4 mm รับแสง 589.00 nm จงหามุมของความเข้มสูงสุดอันดับ 1`}</P>
          <M>{r`d=\frac{25.4\times10^{-3}}{1.26\times10^4}=2.016\times10^{-6}\ \mathrm m`}</M>
          <M>{r`\sin\theta=\frac{\lambda}{d}=\frac{589\times10^{-9}}{2.016\times10^{-6}}=0.2922\qquad\Rightarrow\qquad\theta=17.0^\circ`}</M>
        </Worked>
      </Section>

      {/* ---------------------------------------------- slides 35–43 */}
      <Section id="l-polar" eyebrow="ตอนที่ 4 · โพลาไรเซชัน" title="โพลาไรเซชันของแสง" en="polarization">
        <P>{r`โพลาไรเซชันเกิดได้เฉพาะคลื่นตามขวาง แสง **ไม่โพลาไรซ์** มีสนามไฟฟ้าทุกทิศ (สุ่ม) แสง **โพลาไรซ์** มีสนามไฟฟ้าในทิศเดียว แผ่นโพลารอยด์ให้ผ่านเฉพาะส่วนของ $\vec E$ ที่ขนานกับแกนของมัน`}</P>
        <h3>กฎของมาลุส (สไลด์ 36)</h3>
        <P>{r`แสงโพลาไรซ์ผ่านแผ่นที่แกนทำมุม $\theta$ กับทิศสนาม: สนามที่ผ่านคือ $E_0\cos\theta$ ความเข้มเป็นกำลังสองของสนาม`}</P>
        <M>{r`I=I_{max}\cos^2\theta`}</M>
        <P>{r`แสง **ไม่โพลาไรซ์** ผ่านแผ่นแรก เหลือ $\tfrac12$ เสมอ (ค่าเฉลี่ยของ $\cos^2$ ทุกทิศ) ไม่ว่าแกนจะหันทางไหน ข้อนี้ไม่อยู่ในชีท`}</P>
        <W id="polarizers" />
        <Worked title="ตัวอย่างในสไลด์ 38–39: แผ่นโพลารอยด์ 3 แผ่น">
          <P>{r`แสงโพลาไรซ์แนวตั้งความเข้ม $I_i$ ผ่านแผ่นที่แกนทำมุม $\theta_1,\theta_2,\theta_3$ กับแนวตั้ง`}</P>
          <P>{r`**แผ่นแรก** สนามแนวตั้ง แกนทำมุม $\theta_1$: $I_1=I_i\cos^2\theta_1$`}</P>
          <P>{r`**แผ่นที่สอง** ตอนนี้สนามอยู่แนวแกนแผ่นแรก มุมระหว่างกันคือ $\theta_2-\theta_1$: $I_2=I_1\cos^2(\theta_2-\theta_1)$`}</P>
          <P>{r`**แผ่นที่สาม** $I_f=I_2\cos^2(\theta_3-\theta_2)$ รวมเป็น`}</P>
          <M>{r`I_f=I_i\cos^2\theta_1\cos^2(\theta_2-\theta_1)\cos^2(\theta_3-\theta_2)`}</M>
        </Worked>
        <h3>โพลาไรเซชันจากการสะท้อน: กฎของบริวสเตอร์ (สไลด์ 40–43)</h3>
        <P>{r`แสงสะท้อนจากผิวมักโพลาไรซ์บางส่วน ที่มุมตกกระทบค่าหนึ่ง แสงสะท้อนโพลาไรซ์สมบูรณ์ (สนามขนานผิว) และ **รังสีสะท้อนตั้งฉากกับรังสีหักเห** $\theta_2=90^\circ-\theta_p$ แทนในสเนล ($n_1=1$):`}</P>
        <M>{r`\sin\theta_p=n\sin(90^\circ-\theta_p)=n\cos\theta_p\qquad\Rightarrow\qquad n=\tan\theta_p`}</M>
        <P>{r`$\theta_p$ คือ **มุมบริวสเตอร์** หรือมุมโพลาไรซ์ น้ำ $n=1.333$ ได้ $\theta_p\approx53^\circ$ แว่นกันแดดโพลารอยด์จึงตัดแสงสะท้อนจากผิวน้ำได้ดี`}</P>
        <Analogy tag="นึกภาพ">
          <P>{r`แผ่นโพลารอยด์เหมือนรั้วซี่ตั้ง เชือกที่สะบัดขึ้นลงลอดได้ เชือกที่สะบัดซ้ายขวาติดรั้ว สะบัดเฉียงลอดได้แค่ส่วนที่ขึ้นลง สองรั้วที่ซี่ตั้งฉากกันกั้นได้หมด`}</P>
        </Analogy>
        <Note>{r`กับดัก: (1) แสงไม่โพลาไรซ์ผ่านแผ่นแรกเหลือ $\tfrac12$ ไม่ใช่ $\cos^2$ (2) มุมในมาลุสคือมุม **ระหว่างแผ่นนี้กับแผ่นก่อนหน้า** ไม่ใช่กับแนวตั้ง (3) $\cos^2$ ไม่ใช่ $\cos$`}</Note>
      </Section>
    </>
  );
}
