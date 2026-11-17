// =====================================================================
// Chapter 3 page: Biot–Savart law and Ampère's law (slides 1–25)
// plus worksheet questions 26–27.
//
// How this file is built (same as GaussPage / PotentialPage):
//   <Section id=...>   one card; `id` is the progress key and the URL anchor
//   <P>{r`...`}</P>    a paragraph; $...$ inside is inline math, **...** is bold
//   <M>{r`...`}</M>    a display equation (KaTeX)
//   <W id="..." />     an interactive widget (see src/widgets/all.ts)
//   <Worked title=...> a fold-out worked example
// r`...` is String.raw, so backslashes in TeX need no escaping.
//
// Places marked "TODO(professor-method)" use a method the slides leave
// blank; swap them when the professor's method is known.
// =====================================================================
import { Analogy, Li, M, Note, P, Section, Tex, Worked, r } from '../components/ui';
import { W } from '../widgets/registry';

/** Section list for the chips at the top of the page (order = order on the page). */
export const magnetismSections = [
  { id: 'm-force', label: 'แรงบนประจุ' },
  { id: 'm-selector', label: 'ตัวเลือกความเร็ว' },
  { id: 'm-wire', label: 'แรงบนลวด' },
  { id: 'm-biot', label: 'บิโอต์–ซาวาร์ต' },
  { id: 'm-ampere', label: 'กฎของแอมแปร์' },
  { id: 'm-thick', label: 'ลวดหนา' },
  { id: 'm-wires', label: 'ลวดหลายเส้น' },
  { id: 'm-solenoid', label: 'โซลีนอยด์' },
];

export function MagnetismPage() {
  return (
    <>
      {/* ---------------------------------------------- slides 3–4 */}
      <Section id="m-force" eyebrow="ตอนที่ 1 · สนามแม่เหล็ก" title="แรงแม่เหล็กบนอนุภาคที่มีประจุ" en="magnetic force on a moving charge">
        <P>{r`อนุภาคประจุ $q$ ที่ **เคลื่อนที่** ด้วยความเร็ว $\vec v$ ในสนามแม่เหล็ก $\vec B$ ถูกแรงกระทำ`}</P>
        <M>{r`\vec F_B=q\,\vec v\times\vec B\qquad |\vec F_B|=|q|\,vB\sin\theta`}</M>
        <P>{r`$\theta$ คือมุมระหว่าง $\vec v$ กับ $\vec B$ ถ้าประจุอยู่นิ่ง หรือวิ่งขนานกับ $\vec B$ ($\theta=0^\circ$ หรือ $180^\circ$) จะไม่มีแรงเลย หน่วยของสนามแม่เหล็กคือ **เทสลา** (T)`}</P>
        <M>{r`1\ \mathrm T=1\ \frac{\mathrm N}{\mathrm{C\cdot m/s}}`}</M>
        <h3>ทิศของแรง: กฎมือขวาแบบ cross product</h3>
        <ol>
          <Li>{r`ชี้นิ้วทั้งสี่ไปตาม $\vec v$`}</Li>
          <Li>{r`งอนิ้วไปหา $\vec B$ (ทางมุมที่แคบกว่า $180^\circ$)`}</Li>
          <Li>{r`นิ้วโป้งชี้ทิศของ $\vec v\times\vec B$ ถ้า $q$ เป็นบวก แรงไปทางนิ้วโป้ง ถ้า $q$ เป็น **ลบ** แรงกลับทิศ`}</Li>
        </ol>
        <P>{r`ตัวช่วยจำแบบพีชคณิต: $\hat i\times\hat j=\hat k$, $\hat j\times\hat k=\hat i$, $\hat k\times\hat i=\hat j$ และสลับลำดับแล้วเครื่องหมายกลับ`}</P>
        <P>{r`ในรูปสองมิติ สนามที่พุ่ง **ออก** จากกระดาษเขียนเป็นจุด ⊙ (เหมือนเห็นหัวลูกศร) และสนามที่พุ่ง **เข้า** กระดาษเขียนเป็นกากบาท ⊗ (เหมือนเห็นหางลูกศร)`}</P>
        <W id="crossDir" />

        <h3>วิ่งตั้งฉากกับสนาม: เส้นทางเป็นวงกลม</h3>
        <P>{r`แรงแม่เหล็กตั้งฉากกับ $\vec v$ ตลอดเวลา มันจึงเปลี่ยนแค่ทิศ ไม่เปลี่ยนอัตราเร็ว ถ้า $\vec v\perp\vec B$ อนุภาควิ่งเป็นวงกลม โดยแรงแม่เหล็กทำหน้าที่เป็นแรงสู่ศูนย์กลาง`}</P>
        <M>{r`|q|vB=\frac{mv^{2}}{r}\qquad\Rightarrow\qquad r=\frac{mv}{|q|B}`}</M>
        <W id="chargeInB" />
        <Worked title="แบบฝึกหัดข้อ 26 ทีละขั้น">
          <P>{r`โปรตอนพลังงานจลน์ 5.0 MeV วิ่งเข้าไปในสนามแม่เหล็ก 0.33 T ที่ตั้งฉากกับระนาบการเคลื่อนที่ จงหารัศมีความโค้งของเส้นทาง ($m=1.66\times10^{-27}$ kg)`}</P>
          <P>{r`**1. แปลงพลังงานเป็นจูล** $1\ \mathrm{MeV}=10^{6}\times1.60\times10^{-19}$ J`}</P>
          <M>{r`E_K=5.0\times10^{6}\times1.60\times10^{-19}\qquad=8.0\times10^{-13}\ \mathrm J`}</M>
          <P>{r`**2. หาอัตราเร็ว** จาก $E_K=\tfrac12mv^2$ ได้ $v=\sqrt{2E_K/m}$`}</P>
          <P>{r`**3. แรงแม่เหล็ก = แรงสู่ศูนย์กลาง** $qvB=mv^2/r$`}</P>
          <M>{r`r=\frac{mv}{qB}=\frac{\sqrt{2mE_K}}{qB}\qquad=\frac{\sqrt{2(1.66\times10^{-27})(8.0\times10^{-13})}}{(1.60\times10^{-19})(0.33)}`}</M>
          <M>{r`r=0.98\ \mathrm m`}</M>
        </Worked>
      </Section>

      {/* ---------------------------------------------- slide 5 */}
      <Section id="m-selector" title="ตัวเลือกความเร็ว" en="velocity selector">
        <P>{r`ช่องระหว่างแผ่นประจุมีทั้งสนามไฟฟ้า $\vec E$ และสนามแม่เหล็ก $\vec B$ ที่ตั้งฉากกัน ประจุบวกที่วิ่งขึ้นถูกแรงไฟฟ้า $F_e=qE$ ผลักไปทางหนึ่ง และแรงแม่เหล็ก $F_B=qvB$ ผลักไปอีกทาง`}</P>
        <M>{r`F_e=F_B\qquad qE=qvB\qquad\Rightarrow\qquad v=\frac{E}{B}`}</M>
        <P>{r`อนุภาคที่ผ่านออกไปเป็นเส้นตรงมีอัตราเร็ว $v=E/B$ พอดี ช้ากว่านี้แรงไฟฟ้าชนะ เร็วกว่านี้แรงแม่เหล็กชนะ และสังเกตว่า $q$ ตัดกันหายไป: ใช้ได้กับทุกประจุ`}</P>
        <W id="selector" />
      </Section>

      {/* ---------------------------------------------- slides 6–11 */}
      <Section id="m-wire" title="แรงแม่เหล็กบนลวดที่มีกระแส" en="force on a current-carrying conductor">
        <P>{r`กระแสคือประจุที่กำลังวิ่ง ลวดที่มีกระแสในสนามแม่เหล็กจึงถูกแรงด้วย`}</P>
        <M>{r`\vec F_B=I\,\vec L\times\vec B\qquad |\vec F_B|=ILB\sin\theta`}</M>
        <P>{r`$\vec L$ ยาวเท่าลวดและชี้ **ตามทิศการไหลของกระแส** ในสไลด์ 7 สนามพุ่งเข้ากระดาษ กระแสขึ้นทำให้ลวดโก่งไปทางซ้าย กระแสลงทำให้ลวดโก่งไปทางขวา (ลองใช้กฎมือขวา: $\hat j\times(-\hat k)=-\hat i$)`}</P>
        <h3>ลวดที่ไม่เป็นเส้นตรง</h3>
        <P>{r`หั่นลวดเป็นชิ้นสั้น ๆ $d\vec s$ แต่ละชิ้นประมาณว่าเป็นเส้นตรง แล้วรวมแรงทั้งหมด`}</P>
        <M>{r`d\vec F_B=I\,d\vec s\times\vec B\qquad \vec F_B=I\int_i^f d\vec s\times\vec B`}</M>
        <P>{r`ถ้า $\vec B$ **คงที่** ดึง $\vec B$ ออกนอกอินทิเกรตได้ และ $\int_i^f d\vec s$ คือเวกเตอร์จากปลายต้นถึงปลายทาง จึงได้ทางลัด`}</P>
        <M>{r`\vec F_B=I\left(\int_i^f d\vec s\right)\times\vec B=I\,\vec L\times\vec B`}</M>
        <P>{r`โดย $\vec L$ คือเส้นตรงที่ลากจากปลายต้นไปปลายทาง ลวดจะคดแค่ไหนก็ได้แรงเท่ากับลวดตรงที่ต่อปลายเดียวกัน`}</P>
        <W id="semicircle" />
        {/* TODO(professor-method): the slides leave the curved-wire solution blank.
            The integral below follows the slide's figure (θ and dθ); the shortcut
            is shown only as a check. Swap the order if the professor uses the shortcut. */}
        <Worked title="ตัวอย่างในสไลด์: ลวดครึ่งวงกลมในสนามสม่ำเสมอ">
          <P>{r`ลวดครึ่งวงกลมรัศมี $R$ อยู่ในระนาบ $xy$ มีกระแส $I$ วางในสนามแม่เหล็กสม่ำเสมอ $\vec B=B\hat j$ กระแสไหลไปทาง $+x$ บนส่วนตรง และวนทวนเข็มนาฬิกาบนส่วนโค้ง`}</P>
          <P>{r`**ลวดเส้นตรง** ยาว $2R$ กระแสไปทาง $+x$: $\vec L=2R\,\hat i$`}</P>
          <M>{r`\vec F_1=I\vec L\times\vec B\qquad=I(2R\,\hat i)\times(B\hat j)=2IRB\,\hat k`}</M>
          <P>{r`ชี้ **ออก** จากกระดาษ`}</P>
          <P>{r`**ลวดเส้นโค้ง** ชิ้น $d\vec s$ ที่มุม $\theta$ ยาว $ds=R\,d\theta$ และทำมุม $\theta$ กับ $\vec B$ (ดูรูปในสไลด์) ขนาดของแรงบนชิ้นนี้คือ`}</P>
          <M>{r`dF=I\,ds\,B\sin\theta=IRB\sin\theta\,d\theta`}</M>
          <P>{r`ทุกชิ้นบนส่วนโค้งได้ $d\vec s\times\vec B$ ชี้ **เข้า** กระดาษ ($-\hat k$) เหมือนกันหมด จึงบวกขนาดได้ตรง ๆ`}</P>
          <M>{r`\vec F_2=-IRB\int_0^{\pi}\sin\theta\,d\theta\;\hat k\qquad=-IRB\big[-\cos\theta\big]_0^{\pi}\hat k\qquad=-2IRB\,\hat k`}</M>
          <P>{r`**เช็กด้วยทางลัด** ส่วนโค้งเริ่มที่ $(R,0)$ จบที่ $(-R,0)$: $\vec L=-2R\,\hat i$ จึงได้ $I(-2R\,\hat i)\times(B\hat j)=-2IRB\,\hat k$ ตรงกัน`}</P>
          <P>{r`แรงสองส่วนหักล้างกันพอดี แรงสุทธิบนวงปิดในสนามสม่ำเสมอเป็นศูนย์`}</P>
        </Worked>
      </Section>

      {/* ---------------------------------------------- slides 12–15 */}
      <Section id="m-biot" eyebrow="ตอนที่ 2 · แหล่งกำเนิดสนามแม่เหล็ก" title="กฎของบิโอต์–ซาวาร์ต" en="Biot–Savart law">
        <P>{r`กระแสทำให้เกิดสนามแม่เหล็ก สนามที่จุด P เนื่องจากกระแส $I$ บนชิ้นลวด $d\vec s$ คือ`}</P>
        <M>{r`d\vec B=\frac{\mu_0}{4\pi}\,\frac{I\,d\vec s\times\hat r}{r^{2}}\qquad \vec B=\frac{\mu_0I}{4\pi}\int\frac{d\vec s\times\hat r}{r^{2}}`}</M>
        <P>{r`$\hat r$ ชี้ **จาก $d\vec s$ ไปหาจุด P** และ $\mu_0$ คือค่าความซาบซึมได้ (permeability) ของสุญญากาศ`}</P>
        <M>{r`\mu_0=4\pi\times10^{-7}\ \mathrm{T\cdot m/A}`}</M>
        <Analogy tag="เทียบกับบทที่ 1">
          <P>{r`โครงสร้างเหมือน $d\vec E=k_e\,\dfrac{dq}{r^2}\hat r$ ทุกอย่าง: หั่นแหล่งกำเนิดเป็นชิ้น แล้วบวก ต่างกันตรงที่ชิ้นของสนามแม่เหล็กคือ $I\,d\vec s$ (มีทิศ) และใช้ **cross** กับ $\hat r$ ทำให้ $d\vec B$ ตั้งฉากทั้งกับลวดและกับ $\hat r$`}</P>
        </Analogy>
        <W id="finiteWire" />
        {/* TODO(professor-method): the slides leave this derivation blank, and the final
            formula can be written three ways (sinθ1 + sinθ2, sinθ2 − sinθ1 with signed
            angles, or cosθ1 − cosθ2). This uses sinθ1 + sinθ2 with both angles positive,
            matching finiteWireField() in src/physics/magnetism.ts. */}
        <Worked title="ตัวอย่างในสไลด์: ลวดตรงบางวางตามแกน x">
          <P>{r`ลวดวางตามแกน $x$ มีกระแส $I$ ไปทาง $+x$ จุด P อยู่บนแกน $y$ ห่างลวด $a$ ชิ้น $d\vec s$ อยู่ห่างจุด O เป็นระยะ $x$ และเส้นจากชิ้นนั้นไป P ทำมุม $\theta$ กับแนว PO`}</P>
          <P>{r`**ทิศ** $d\vec s$ ชี้ $+x$ และ $\hat r$ ชี้ขึ้นไปทาง P ทุกชิ้นได้ $d\vec s\times\hat r=|d\vec s\times\hat r|\,\hat k$ คือ **ออก** จากกระดาษ`}</P>
          <P>{r`**ขนาด** มุมระหว่าง $d\vec s$ กับ $\hat r$ คือ $90^\circ-\theta$ จึงได้ $|d\vec s\times\hat r|=dx\cos\theta$`}</P>
          <P>{r`**เปลี่ยนตัวแปรเป็น $\theta$** จากรูป $x=a\tan\theta$ และ $r=a/\cos\theta$ จึงได้ $dx=a\sec^{2}\theta\,d\theta$`}</P>
          <M>{r`dB=\frac{\mu_0I}{4\pi}\,\frac{dx\cos\theta}{r^{2}}\qquad=\frac{\mu_0I}{4\pi}\,\frac{a\sec^{2}\theta\,d\theta\,\cos\theta}{a^{2}\sec^{2}\theta}\qquad=\frac{\mu_0I}{4\pi a}\cos\theta\,d\theta`}</M>
          <P>{r`**อินทิเกรต** จากปลายซ้าย (มุม $\theta_1$ ไปทางซ้าย) ถึงปลายขวา (มุม $\theta_2$ ไปทางขวา)`}</P>
          <M>{r`B=\frac{\mu_0I}{4\pi a}\int_{-\theta_1}^{\theta_2}\cos\theta\,d\theta\qquad=\frac{\mu_0I}{4\pi a}\left(\sin\theta_1+\sin\theta_2\right)`}</M>
          <P>{r`**ลวดยาวมาก (อนันต์)** ปลายทั้งสองไปไกลมาก $\theta_1=\theta_2=90^\circ$`}</P>
          <M>{r`B=\frac{\mu_0I}{4\pi a}(1+1)=\frac{\mu_0I}{2\pi a}`}</M>
        </Worked>
      </Section>

      {/* ---------------------------------------------- slide 16 */}
      <Section id="m-ampere" title="กฎของแอมแปร์" en="Ampère's law">
        <M>{r`\oint\vec B\cdot d\vec s=\mu_0I`}</M>
        <P>{r`ไล่เดินรอบวงปิดใด ๆ (วงแอมแปร์) แล้วบวก $\vec B\cdot d\vec s$ ไปตลอดทาง ผลรวมเท่ากับ $\mu_0$ คูณกระแส **ที่ทะลุผ่านวงปิด** กระแสนอกวงไม่มีผล รูปร่างของวงก็ไม่มีผล`}</P>
        <Analogy tag="เทียบกับกฎของเกาส์">
          <div className="scroll">
            <table>
              <thead>
                <tr><th></th><th>กฎของเกาส์</th><th>กฎของแอมแปร์</th></tr>
              </thead>
              <tbody>
                <tr><td>วาดอะไร</td><td>ผิวปิด</td><td>เส้นวงปิด</td></tr>
                <tr><td>ฝั่งซ้าย</td><td><Tex>{r`\oint\vec E\cdot d\vec A`}</Tex></td><td><Tex>{r`\oint\vec B\cdot d\vec s`}</Tex></td></tr>
                <tr><td>ฝั่งขวา</td><td><Tex>{r`q_{in}/\varepsilon_0`}</Tex></td><td><Tex>{r`\mu_0 I_{in}`}</Tex></td></tr>
                <tr><td>ใช้หาสนามได้เมื่อ</td><td colSpan={2}>สมมาตรพอจะดึงขนาดสนามออกนอกอินทิเกรต</td></tr>
              </tbody>
            </table>
          </div>
        </Analogy>
        <h3>ลวดตรงยาวมาก</h3>
        <P>{r`ใช้วงแอมแปร์เป็นวงกลมรัศมี $a$ ล้อมลวด จากสมมาตร $B$ มีขนาดเท่ากันทั้งวง และชี้ไปตามวงพอดี ($\hat B=d\hat s$)`}</P>
        <M>{r`\oint\vec B\cdot d\vec s=B\oint ds=B(2\pi a)=\mu_0I\qquad\Rightarrow\qquad B=\frac{\mu_0I}{2\pi a}`}</M>
        <P>{r`ตรงกับที่ได้จากกฎของบิโอต์–ซาวาร์ต แต่ใช้แค่บรรทัดเดียว **ทิศ** ของ $\vec B$ ใช้กฎกำมือขวา: กำลวดให้นิ้วโป้งชี้ตามกระแส นิ้วที่งอรอบลวดคือทิศของ $\vec B$`}</P>
        <W id="ampereLoop" />
      </Section>

      {/* ---------------------------------------------- slides 17–19 */}
      <Section id="m-thick" title="ลวดหนา กระแสกระจายสม่ำเสมอ" en="thick wire">
        <P>{r`ลวดยาวรัศมี $R$ มีกระแส $I$ กระจายสม่ำเสมอ (ความหนาแน่นกระแสคงที่) จงหาขนาดสนามแม่เหล็กที่ระยะ $r$ จากแกนกลาง`}</P>
        <div className="grid2">
          <div>
            <p><b>ข้างนอก <Tex>{r`r\ge R`}</Tex></b></p>
            <M>{r`B(2\pi r)=\mu_0I\ \Rightarrow\ B=\frac{\mu_0I}{2\pi r}`}</M>
            <P>{r`เหมือนลวดเส้นบางที่แกนกลาง`}</P>
          </div>
          <div>
            <p><b>ข้างใน <Tex>{r`r<R`}</Tex></b></p>
            <P>{r`ความหนาแน่นกระแสคงที่ กระแสที่ทะลุวงจึงเป็นสัดส่วนของ **พื้นที่**`}</P>
            <M>{r`I_{in}=I\,\frac{\pi r^{2}}{\pi R^{2}}=I\,\frac{r^{2}}{R^{2}}`}</M>
            <M>{r`B(2\pi r)=\mu_0I\frac{r^{2}}{R^{2}}\ \Rightarrow\ B=\frac{\mu_0I}{2\pi R^{2}}\,r`}</M>
          </div>
        </div>
        <P>{r`ข้างใน $B\propto r$ ข้างนอก $B\propto 1/r$ สูงสุดที่ผิว $B=\mu_0I/2\pi R$ (รูปร่างกราฟคล้ายฉนวนทรงกลมในบทที่ 1 แต่ข้างนอกลดแบบ $1/r$ ไม่ใช่ $1/r^2$)`}</P>
        <W id="thickWire" />
      </Section>

      {/* ---------------------------------------------- slides 20–22 + Q27 */}
      <Section id="m-wires" title="ลวดยาวหลายเส้น: รวมสนามแบบเวกเตอร์" en="superposition">
        <P>{r`แต่ละเส้นให้ $B=\mu_0I/2\pi r$ ทิศตามกฎกำมือขวา แล้วรวมแบบเวกเตอร์ เหมือนรวมสนามไฟฟ้าจากหลายจุดประจุ`}</P>
        <W id="wiresInPage" />
        <Worked title="ตัวอย่างในสไลด์: ลวดขนาน 2 เส้น กระแสสวนทางกัน">
          <P>{r`ลวดยาวมาก 2 เส้นห่างกัน $L$ เส้นซ้ายมีกระแส $I$ ไหลลง เส้นขวามีกระแส $I$ ไหลขึ้น จุด P อยู่ทางขวาของเส้นขวาเป็นระยะ $L/2$ จงหาขนาดและทิศของสนามแม่เหล็กที่ P`}</P>
          <P>{r`**เส้นขวา** ห่าง P เป็น $L/2$ กระแสขึ้น จุดอยู่ทางขวา: กฎกำมือขวาได้ทิศ **เข้า** กระดาษ`}</P>
          <M>{r`B_{\text{ขวา}}=\frac{\mu_0I}{2\pi(L/2)}=\frac{\mu_0I}{\pi L}\quad(\otimes)`}</M>
          <P>{r`**เส้นซ้าย** ห่าง P เป็น $3L/2$ กระแสลง จุดอยู่ทางขวา: ทิศ **ออก** จากกระดาษ`}</P>
          <M>{r`B_{\text{ซ้าย}}=\frac{\mu_0I}{2\pi(3L/2)}=\frac{\mu_0I}{3\pi L}\quad(\odot)`}</M>
          <P>{r`ทิศตรงข้ามกัน จึงลบกัน และเส้นขวาซึ่งใกล้กว่าชนะ`}</P>
          <M>{r`B=\frac{\mu_0I}{\pi L}-\frac{\mu_0I}{3\pi L}=\frac{2\mu_0I}{3\pi L}\quad\text{เข้ากระดาษ}`}</M>
        </Worked>
        <W id="wiresEndOn" />
        <Worked title="แบบฝึกหัดข้อ 27 ทีละขั้น">
          <P>{r`ลวดยาวมาก 2 เส้นขนานกับแกน $z$ ลวด A ผ่านจุด $(0,a)$ มีกระแส $I$ ไปทาง $+\hat k$ ลวด B ผ่านจุด $(b,0)$ มีกระแส $2I$ ไปทาง $-\hat k$ โดย $a=3$ m และ $b=4$ m จงหาสนามแม่เหล็กที่จุดกำเนิด`}</P>
          <P>{r`**ลวด A** ห่างจุดกำเนิด 3 m กระแสพุ่งออก ($+\hat k$) จุดอยู่ใต้ลวด: กำมือขวาได้ทิศ $+\hat i$`}</P>
          <M>{r`\vec B_A=\frac{\mu_0 I}{2\pi(3)}\,\hat i`}</M>
          <P>{r`**ลวด B** ห่าง 4 m กระแสพุ่งเข้า ($-\hat k$) จุดอยู่ทางซ้ายของลวด: ทิศ $+\hat j$`}</P>
          <M>{r`\vec B_B=\frac{\mu_0(2I)}{2\pi(4)}\,\hat j`}</M>
          <M>{r`\vec B=\vec B_A+\vec B_B=\frac{\mu_0I}{2\pi}\left(\frac13\,\hat i+\frac12\,\hat j\right)`}</M>
          <P>{r`เช็กทิศด้วย cross product: ทิศของ $\vec B$ คือ (ทิศกระแส) × (ทิศจากลวดไปหาจุด) ลวด A: $\hat k\times(-\hat j)=+\hat i$ ลวด B: $(-\hat k)\times(-\hat i)=+\hat j$`}</P>
        </Worked>
      </Section>

      {/* ---------------------------------------------- slides 23–25 */}
      <Section id="m-solenoid" title="สนามแม่เหล็กของโซลีนอยด์" en="solenoid">
        <P>{r`ขดลวดวงเดียวที่มีกระแสสร้างเส้นสนามแม่เหล็กหน้าตาเหมือนแท่งแม่เหล็ก (มีขั้ว N และ S) เอาวงแบบนี้หลาย ๆ วงมาเรียงกันเป็นขดยาวเรียกว่า **โซลีนอยด์** สนามข้างในจะตรงและแรงขึ้น ส่วนข้างนอกอ่อนมาก`}</P>
        <P>{r`สำหรับโซลีนอยด์ที่พันแน่นมากและยาวมาก ใช้วงแอมแปร์เป็นสี่เหลี่ยมยาว $\ell$ ที่มีด้านหนึ่งอยู่ข้างใน`}</P>
        <ul>
          <Li>{r`ด้าน 1 (ข้างใน ขนานกับสนาม): ได้ $B\ell$`}</Li>
          <Li>{r`ด้าน 2 และ 4 (ตั้งฉากกับสนาม): $\vec B\cdot d\vec s=0$`}</Li>
          <Li>{r`ด้าน 3 (ข้างนอก): $B_{out}\approx0$`}</Li>
          <Li>{r`กระแสที่ทะลุวงคือ $N$ รอบ รอบละ $I$ รวม $NI$`}</Li>
        </ul>
        <M>{r`\oint\vec B\cdot d\vec s=B\ell=\mu_0NI\qquad\Rightarrow\qquad B_{in}=\mu_0nI`}</M>
        <P>{r`โดย $n=N/\ell$ คือ **จำนวนรอบต่อความยาว** และ $B_{out}\approx0$`}</P>
        <W id="solenoid" />
        <Note>{r`กับดัก: ใช้ $n$ (รอบต่อเมตร) ไม่ใช่ $N$ (จำนวนรอบทั้งหมด) ถ้าโจทย์ให้ 500 รอบ ยาว 25 cm ต้องได้ $n=500/0.25=2000$ รอบ/m`}</Note>
      </Section>
    </>
  );
}
