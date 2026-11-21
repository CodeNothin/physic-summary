// =====================================================================
// #/support — feedback form and donations ("donationware": the site is
// free and stays free; donating is optional and any amount is fine).
//
//   #/support            → this page
//   (the feedback link in SupportLine goes straight to the Google Form)
//
// The PromptPay QR is the image the bank app generated, saved as
// public/promptpay-qr.png (Vite copies public/ as-is into the build).
// It is a static QR, so the donor types any amount in their bank app.
//
// SupportLine is the one quiet line shown at the end of every chapter,
// on the home page and on the สูตร tab, linking here.
// =====================================================================
import { useState } from 'react';

/** Google Form for bug reports and suggestions. */
export const FEEDBACK_URL = 'https://forms.gle/Tx9SYmsEeTuDcJAg9';

/** Relative to index.html (base './'), so it works under any GitHub Pages sub-path. */
const QR_SRC = './promptpay-qr.png';

/** One small line: report a problem, or buy the author a snack. Like 👎 / 👍. */
export function SupportLine() {
  return (
    <p className="small support-line">
      พบปัญหา?{' '}
      <a href={FEEDBACK_URL} target="_blank" rel="noreferrer">
        ส่ง Feedback
      </a>{' '}
      · ชอบสรุปนี้? <a href="#/support">เลี้ยงขนมหน่อย❤️</a> (เท่าไหร่ก็ได้)
    </p>
  );
}

export function SupportPage() {
  // hide the QR block if the image file has not been added yet
  const [qrMissing, setQrMissing] = useState(false);

  return (
    <>
      <section className="card">
        <p className="eyebrow">สนับสนุน</p>
        <h1>เลี้ยงหนมคนทำ</h1>
        <p>
          เว็บนี้<b>ฟรี และจะฟรีตลอด</b> ไม่มีส่วนไหนที่ต้องจ่ายเงินถึงจะดูได้ ทำโดยเด็ก Math จนๆ คนนึง
        </p>
        <p>ทั้งหมดนี้ทำคนเดียว ร่วมกับผู้ช่วยตัวส้มๆ แต่ค่าตัวเขาแพงมาก</p>
        <p>ถ้าเว็บนี้ช่วยให้เข้าใจขึ้นหรือสอบได้ดีขึ้น จะเลี้ยงขนมสักหน่อยก็ได้ เท่าไหร่ก็ได้ ไม่โอนก็ไม่เป็นไร :3</p>

        {qrMissing ? (
          <p className="note">ยังไม่มีรูป QR PromptPay</p>
        ) : (
          <div className="qr-box">
            <img src={QR_SRC} alt="QR PromptPay สำหรับโอนเงิน" onError={() => setQrMissing(true)} />
            <div className="btn-row" style={{ justifyContent: 'center' }}>
              <a className="btn" href={QR_SRC} download="promptpay-qr.png">
                บันทึกรูป QR
              </a>
            </div>
          </div>
        )}

        {!qrMissing && (
          <>
            <h3>โอนจากมือถือเครื่องนี้</h3>
            <ol>
              <li>กด “บันทึกรูป QR” (หรือกดค้างที่รูปแล้วเลือกบันทึก)</li>
              <li>เปิดแอปธนาคาร → สแกน → เลือกรูปจากอัลบั้ม</li>
              <li>ใส่จำนวนเงินเท่าไหร่ก็ได้</li>
            </ol>
          </>
        )}
      </section>

      <section className="card" id="sec-feedback">
        <h2>💬 ส่ง Feedback</h2>
        <p>เจอสูตรผิด เฉลยผิด หน้าเว็บแสดงผลเพี้ยน หรืออยากให้เพิ่มอะไร บอกได้ที่ฟอร์มนี้ ช่วยได้มากกว่าที่คิด</p>
        <div className="btn-row">
          <a className="btn ghost" href={FEEDBACK_URL} target="_blank" rel="noreferrer">
            เปิดฟอร์ม Feedback
          </a>
        </div>
      </section>
    </>
  );
}
