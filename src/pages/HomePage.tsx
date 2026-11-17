// =====================================================================
// Home page: overall progress, one card per chapter, and the
// "what the exam asks" map (one row per worksheet question).
// The chapter cards come from src/chapters.ts, so a new chapter
// appears here automatically once it is registered there.
// =====================================================================
import type { ReactNode } from 'react';
import { chapters, readyChapters } from '../chapters';
import { Tex, r } from '../components/ui';
import { resetProgress, useStore } from '../lib/store';

/** One row of the exam map: worksheet question → the single idea that solves it. */
interface ExamRow {
  q: string;
  situation: string;
  idea: ReactNode;
  /** link to the section that teaches it (#/chapter/section) */
  to: string;
}

const examMap: ExamRow[] = [
  {
    q: 'ข้อ 21',
    situation: 'ตัวนำกลวงที่มีประจุในโพรง',
    idea: (
      <>
        <Tex>E=0</Tex> ในเนื้อโลหะ ผิวเกาส์ในโลหะจึงล้อมประจุสุทธิเป็นศูนย์
      </>
    ),
    to: '#/gauss/conductors',
  },
  {
    q: 'ข้อ 22',
    situation: 'แผ่นประจุใหญ่มาก 2 แผ่น',
    idea: (
      <>
        แต่ละแผ่นสร้าง <Tex>{r`\sigma/2\varepsilon_0`}</Tex> แล้วรวมกันโดยคิดทิศ
      </>
    ),
    to: '#/gauss/sheets',
  },
  {
    q: 'ข้อ 23',
    situation: 'สนามสม่ำเสมอ จุด A และ B',
    idea: (
      <>
        <Tex>{r`\Delta V=-\vec E\cdot\vec S`}</Tex> แล้ว <Tex>{r`W_{ext}=q\,\Delta V`}</Tex>
      </>
    ),
    to: '#/potential/uniform',
  },
  {
    q: 'ข้อ 24',
    situation: 'ตัวนำทรงกลม (ตัวแปรล้วน)',
    idea: (
      <>
        <Tex>V</Tex> เท่ากันทั้งก้อน และเท่ากับ <Tex>{r`k_eQ/R`}</Tex>
      </>
    ),
    to: '#/potential/condV',
  },
  {
    q: 'ข้อ 25',
    situation: 'ตัวนำทรงกลม (ตัวเลข)',
    idea: (
      <>
        ข้างนอกเหมือนจุดประจุ ข้างใน <Tex>E=0</Tex>, <Tex>{r`V=k_eQ/R`}</Tex>
      </>
    ),
    to: '#/potential/condV',
  },
  {
    q: 'ข้อ 26',
    situation: 'โปรตอนวิ่งตั้งฉากกับสนามแม่เหล็ก',
    idea: (
      <>
        แรงแม่เหล็กเป็นแรงสู่ศูนย์กลาง <Tex>{r`qvB=mv^2/r`}</Tex> และ <Tex>{r`v=\sqrt{2E_K/m}`}</Tex>
      </>
    ),
    to: '#/magnetism/m-force',
  },
  {
    q: 'ข้อ 27',
    situation: 'ลวดยาวมาก 2 เส้น หาสนามที่จุดหนึ่ง',
    idea: (
      <>
        แต่ละเส้นให้ <Tex>{r`\mu_0I/2\pi r`}</Tex> ทิศตามกฎมือขวา แล้วบวกแบบเวกเตอร์
      </>
    ),
    to: '#/magnetism/m-wires',
  },
];

export function HomePage() {
  const s = useStore();
  // every section of every ready chapter counts towards "อ่านแล้ว"
  const allSections = readyChapters.flatMap((c) => c.sections);
  const done = allSections.filter((x) => s.done[x.id]).length;
  const attempts = Object.values(s.skills).reduce((a, b) => a + b.total, 0);
  const correct = Object.values(s.skills).reduce((a, b) => a + b.correct, 0);

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
            <b>✏️ ฝึกทำโจทย์</b>
            <div className="small">สุ่มตัวเลขใหม่ทุกครั้ง · ใบ้ทีละขั้น · ชุดจับเวลา</div>
          </div>
        </a>
      </div>

      <section className="card" style={{ marginTop: 14 }}>
        <h2>แบบฝึกหัดถามอะไร</h2>
        <p>แต่ละข้อของแบบฝึกหัดใช้แนวคิดหลักแค่อย่างเดียว ถ้าจับได้ว่าเป็นแนวคิดไหน ก็ทำข้อนั้นได้</p>
        <div className="scroll">
          <table>
            <thead>
              <tr>
                <th>ข้อ</th>
                <th>สถานการณ์</th>
                <th>แนวคิดที่ใช้แก้</th>
              </tr>
            </thead>
            <tbody>
              {examMap.map((e) => (
                <tr key={e.q}>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <a href={e.to}>{e.q}</a>
                  </td>
                  <td>{e.situation}</td>
                  <td>{e.idea}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="note">
          แปลง μC เป็น <Tex>{r`10^{-6}`}</Tex> C, cm เป็น m และ MeV เป็น J (<Tex>{r`\times1.60\times10^{-19}\times10^{6}`}</Tex>)
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
