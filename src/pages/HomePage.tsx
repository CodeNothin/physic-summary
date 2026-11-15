import { Tex, r } from '../components/ui';
import { resetProgress, useStore } from '../lib/store';
import { gaussSections } from './GaussPage';
import { potentialSections } from './PotentialPage';

const examMap: { q: string; situation: string; idea: React.ReactNode; to: string }[] = [
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
        <Tex>V</Tex> เท่ากันทั้งก้อน และเท่ากับ <Tex>{r`kQ/R`}</Tex>
      </>
    ),
    to: '#/potential/condV',
  },
  {
    q: 'ข้อ 25',
    situation: 'ตัวนำทรงกลม (ตัวเลข)',
    idea: (
      <>
        ข้างนอกเหมือนจุดประจุ ข้างใน <Tex>E=0</Tex>, <Tex>{r`V=kQ/R`}</Tex>
      </>
    ),
    to: '#/potential/condV',
  },
];

export function HomePage() {
  const s = useStore();
  const all = [...gaussSections, ...potentialSections];
  const done = all.filter((x) => s.done[x.id]).length;
  const attempts = Object.values(s.skills).reduce((a, b) => a + b.total, 0);
  const correct = Object.values(s.skills).reduce((a, b) => a + b.correct, 0);

  return (
    <>
      <section className="card">
        <p className="eyebrow">2304121 · ไฟฟ้า ตอนที่ 1</p>
        <h1>กฎของเกาส์ และ ศักย์ไฟฟ้า</h1>
        <p>
          สรุปจากสไลด์ 2 ชุดและแบบฝึกหัดข้อ 21–25 ทุกแนวคิดมีของให้ลากและปรับเล่น แล้วไปฝึกทำโจทย์ที่สุ่มตัวเลขใหม่ทุกครั้ง
        </p>
        <div className="skill-row">
          <span>อ่านแล้ว</span>
          <b>
            {done}/{all.length} หัวข้อ
          </b>
          <div className="bar">
            <i style={{ width: `${(100 * done) / all.length}%` }} />
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
        <a className="home-link" href="#/gauss">
          <div className="card">
            <b>⚡ ตอนที่ 1 · กฎของเกาส์</b>
            <div className="small">ฟลักซ์ · ผิวเกาส์ · ทรงกลม · แผ่นประจุ · ตัวนำ</div>
          </div>
        </a>
        <a className="home-link" href="#/potential">
          <div className="card">
            <b>⛰️ ตอนที่ 2 · ศักย์ไฟฟ้า</b>
            <div className="small">ความต่างศักย์ · จุดประจุ · หา E จาก V · ตัวนำ</div>
          </div>
        </a>
        <a className="home-link" href="#/practice">
          <div className="card">
            <b>✏️ ฝึกทำโจทย์</b>
            <div className="small">สุ่มตัวเลขใหม่ทุกครั้ง · ใบ้ทีละขั้น · ชุดจับเวลา</div>
          </div>
        </a>
      </div>

      <section className="card" style={{ marginTop: 14 }}>
        <h2>ข้อสอบถามอะไร</h2>
        <p>แบบฝึกหัด 5 ข้อของเรื่องนี้ใช้แค่ 5 ทักษะ ถ้าทำ 5 อย่างนี้ได้ ก็ทำข้อสอบได้</p>
        <div className="scroll">
          <table>
            <thead>
              <tr>
                <th>ข้อ</th>
                <th>สถานการณ์</th>
                <th>แนวคิดเดียวที่ใช้แก้</th>
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
          แปลง μC เป็น <Tex>{r`10^{-6}`}</Tex> C และ cm เป็น m ก่อนแทนค่าเสมอ
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
