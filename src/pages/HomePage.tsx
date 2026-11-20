// =====================================================================
// Home page: overall progress, one card per chapter, and a card that
// points to the ตัวอย่างข้อสอบ tab (worksheet questions 21–40).
// The chapter cards come from src/chapters.ts, so a new chapter
// appears here automatically once it is registered there.
// =====================================================================
import { chapters, readyChapters } from '../chapters';
import { Tex, r } from '../components/ui';
import { resetProgress, useStore } from '../lib/store';
import { allQuestions, built } from '../worksheet';

export function HomePage() {
  const s = useStore();
  // every section of every ready chapter counts towards "อ่านแล้ว"
  const allSections = readyChapters.flatMap((c) => c.sections);
  const done = allSections.filter((x) => s.done[x.id]).length;
  const attempts = Object.values(s.skills).reduce((a, b) => a + b.total, 0);
  const correct = Object.values(s.skills).reduce((a, b) => a + b.correct, 0);
  // worksheet questions solved cleanly at least twice (same rule as the ตัวอย่างข้อสอบ tab)
  const wsReady = built.filter((q) => (s.ws[q.q]?.clean ?? 0) >= 2).length;

  return (
    <>
      <section className="card">
        <p className="eyebrow">2304121</p>
        <h1>สรุปฟิสิกส์แบบลองเล่นได้</h1>
        <p>
          สรุปจากสไลด์และแบบฝึกหัด ทุกแนวคิดมีของให้ลากและปรับเล่น แล้วไปฝึกทำโจทย์ที่สุ่มตัวเลขใหม่ทุกครั้ง
        </p>
        <div className="skill-row">
          <span>อ่านแล้ว</span>
          <b>
            {done}/{allSections.length} หัวข้อ
          </b>
          <div className="bar">
            <i style={{ width: `${(100 * done) / allSections.length}%` }} />
          </div>
        </div>
        <div className="skill-row">
          <span>ทำโจทย์ถูก</span>
          <b>
            {correct}/{attempts} ข้อ
          </b>
          <div className="bar">
            <i style={{ width: attempts ? `${(100 * correct) / attempts}%` : 0 }} />
          </div>
        </div>
      </section>

      <div className="home-links">
        {chapters.map((c) => {
          const n = c.sections.filter((x) => s.done[x.id]).length;
          const inner = (
            <div className={`card chapter-card${c.status === 'soon' ? ' soon' : ''}`}>
              <span className="ico">{c.icon}</span>
              <b>
                บทที่ {c.num} · {c.title}
              </b>
              <span className="small">{c.status === 'soon' ? 'เร็ว ๆ นี้' : c.blurb}</span>
              {c.status === 'ready' && (
                <div className="bar" title={`อ่านแล้ว ${n}/${c.sections.length}`}>
                  <i style={{ width: `${(100 * n) / c.sections.length}%` }} />
                </div>
              )}
            </div>
          );
          return c.status === 'ready' ? (
            <a key={c.id} className="home-link" href={`#/${c.id}`}>
              {inner}
            </a>
          ) : (
            <div key={c.id}>{inner}</div>
          );
        })}
        <a className="home-link" href="#/practice">
          <div className="card">
            <b>✏️ ฝึกโจทย์สั้น</b>
            <div className="small">ทีละขั้น · สุ่มตัวเลขใหม่ทุกครั้ง · ใบ้ทีละขั้น · ชุดจับเวลา</div>
          </div>
        </a>
      </div>

      <section className="card" style={{ marginTop: 14 }}>
        <h2>📝 ตัวอย่างข้อสอบ</h2>
        <p>
          ข้อสอบมี 6 ข้อจากแบบฝึกหัดข้อ 21–40 (เปลี่ยนตัวเลข) คิดเป็น 30% ของคะแนน ฝึกครบทุกส่วนของแต่ละข้อ หรือจำลองสอบ 6 ข้อได้ในแท็บ
          ตัวอย่างข้อสอบ
        </p>
        <div className="skill-row">
          <span>พร้อมสอบ</span>
          <b>
            {wsReady}/{allQuestions.length} ข้อ (มีให้ฝึกแล้ว {built.length} ข้อ)
          </b>
          <div className="bar">
            <i style={{ width: `${(100 * wsReady) / allQuestions.length}%` }} />
          </div>
        </div>
        <div className="btn-row">
          <a className="btn" href="#/exam">
            ไปที่ตัวอย่างข้อสอบ
          </a>
        </div>
        <p className="note">
          แปลง μC เป็น <Tex>{r`10^{-6}`}</Tex> C, cm เป็น m และ MeV เป็น J (<Tex>{r`	imes1.60	imes10^{-19}	imes10^{6}`}</Tex>)
          ก่อนแทนค่าเสมอ
        </p>
      </section>

      <p className="small" style={{ textAlign: 'center' }}>
        ความคืบหน้าเก็บไว้ในเครื่องนี้เท่านั้น ·{' '}
        <button
          className="reset-btn"
          onClick={() => {
            if (confirm('ล้างความคืบหน้าทั้งหมดในเครื่องนี้?')) resetProgress();
          }}
        >
          ล้างความคืบหน้า
        </button>
      </p>
    </>
  );
}
