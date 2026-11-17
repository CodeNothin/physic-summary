// =====================================================================
// Practice mode.
//
// Three screens, chosen by `mode` in PracticePage at the bottom:
//   menu  — chapter filter, start buttons, accuracy per skill
//   drill — one question at a time (free practice or one skill),
//           with hints, the answer check and the worked solution
//   exam  — a timed set with no hints; results shown at the end
//
// Questions come from questions.ts; answers are checked by
// checkAnswer() in src/physics/answers.ts (2 % tolerance, plus sign /
// power-of-ten / known-mistake detection).
// =====================================================================
import { useEffect, useMemo, useRef, useState } from 'react';
import { readyChapters } from '../chapters';
import { T } from '../components/ui';
import { fmt } from '../lib/format';
import { recordAttempt, recordExam, useStore } from '../lib/store';
import type { State } from '../lib/store';
import { checkAnswer, parseNumber } from '../physics/answers';
import type { Verdict } from '../physics/answers';
import { mistakeText, skillChapter, skillNames } from './common';
import type { Problem, Skill } from './common';
import { examSets, generators, makeProblem, newSeed, skillsOf } from './questions';
import type { ExamSet } from './questions';

/** A checker verdict, or 'invalid' when the typed text is not a number. */
type Result = Verdict | { kind: 'invalid' };

/** Converts the typed number to SI with the chosen unit, then checks it. */
function evaluate(p: Problem, text: string, unitIdx: number): Result {
  const v = parseNumber(text);
  if (Number.isNaN(v)) return { kind: 'invalid' };
  return checkAnswer(v * p.units[unitIdx].factor, p.answer, p.mistakes, p.scale);
}

/** The Thai message shown under the answer box for each verdict. */
function feedback(r: Result): string {
  switch (r.kind) {
    case 'correct':
      return 'ถูกต้อง!';
    case 'invalid':
      return 'อ่านตัวเลขไม่ออก ลองพิมพ์แบบ 1.84e6 หรือ 1.84×10^6 หรือ -9 หรือ 1/6';
    case 'sign':
      return 'ขนาดถูกแล้ว แต่เครื่องหมายผิด เช็กลำดับ (ปลาย − ต้น) และเครื่องหมายของประจุ';
    case 'power10':
      return `ตัวเลขถูก แต่เลขยกกำลังสิบคลาดไป (คำตอบของคุณ${r.exponent > 0 ? 'มากไป' : 'น้อยไป'} 10^${Math.abs(r.exponent)} เท่า) เช็กการแปลงหน่วย μC, nC, cm และหน่วยที่เลือก`;
    case 'mistake':
      return mistakeText[r.id] ?? 'ยังไม่ถูก';
    case 'wrong':
      return 'ยังไม่ถูก ลองเปิดคำใบ้ทีละขั้น';
  }
}

const answerText = (p: Problem) => `${fmt(p.answer / p.units[0].factor)} ${p.units[0].label}`;

/** A new random problem from the given skills, avoiding a repeat of the last question type. */
function randomProblem(allowed: Skill[], avoid?: string): Problem {
  let pool = generators.filter((g) => allowed.includes(g.skill));
  if (pool.length > 1 && avoid) pool = pool.filter((g) => g.id !== avoid);
  return makeProblem(pool[Math.floor(Math.random() * pool.length)], newSeed());
}

function accuracy(s: State, skill: Skill): number | null {
  const st = s.skills[skill];
  return st && st.total > 0 ? st.correct / st.total : null;
}

/** The skill with the lowest accuracy among `list`; skills never tried come first. */
function weakestSkill(s: State, list: Skill[]): Skill {
  return [...list].sort((a, b) => (accuracy(s, a) ?? -1) - (accuracy(s, b) ?? -1))[0];
}

// ------------------------------------------------------------ answer box

function AnswerBox({
  p,
  text,
  unitIdx,
  onText,
  onUnit,
  onSubmit,
  disabled,
}: {
  p: Problem;
  text: string;
  unitIdx: number;
  onText: (t: string) => void;
  onUnit: (i: number) => void;
  onSubmit?: () => void;
  disabled?: boolean;
}) {
  const input = useRef<HTMLInputElement>(null);
  const insert = (s: string) => {
    onText(text + s);
    input.current?.focus();
  };
  return (
    <>
      <div className="answer-row">
        <input
          ref={input}
          value={text}
          disabled={disabled}
          onChange={(e) => onText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSubmit?.()}
          placeholder="คำตอบ เช่น 1.84e6"
          inputMode="text"
          autoCapitalize="off"
          autoComplete="off"
          aria-label="คำตอบ"
        />
        <select value={unitIdx} disabled={disabled} onChange={(e) => onUnit(Number(e.target.value))} aria-label="หน่วย">
          {p.units.map((u, i) => (
            <option key={u.label} value={i}>
              {u.label}
            </option>
          ))}
        </select>
      </div>
      {!disabled && (
        <div className="seg" style={{ marginBottom: 10 }}>
          <button onClick={() => insert('-')}>−</button>
          <button onClick={() => insert('×10^')}>×10^</button>
          <button onClick={() => insert('/')}>/</button>
          <button onClick={() => onText('')}>ล้าง</button>
        </div>
      )}
    </>
  );
}

function Solution({ p }: { p: Problem }) {
  return (
    <div className="worked" style={{ marginTop: 10 }}>
      <p className="tag">เฉลยด้วยตัวเลขของข้อนี้</p>
      <ol style={{ marginBottom: 6 }}>
        {p.solution.map((line, i) => (
          <li key={i}>
            <div style={{ overflowX: 'auto', overflowY: 'hidden' }}>
              <T>{line}</T>
            </div>
          </li>
        ))}
      </ol>
      <b>คำตอบ: {answerText(p)}</b>
    </div>
  );
}

// ----------------------------------------------------------------- drill

/** One question at a time, drawn from `pool` (a list of skills). */
function Drill({ pool, onExit, label }: { pool: Skill[]; onExit: () => void; label: string }) {
  const [p, setP] = useState(() => randomProblem(pool));
  const [text, setText] = useState('');
  const [unitIdx, setUnitIdx] = useState(0);
  const [result, setResult] = useState<Result | null>(null);
  const [hints, setHints] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const recorded = useRef(false);
  const [streak, setStreak] = useState(0);

  // only the first real attempt on each problem counts toward accuracy
  const record = (ok: boolean) => {
    if (recorded.current) return;
    recorded.current = true;
    recordAttempt(p.skill, ok);
    setStreak((s) => (ok ? s + 1 : 0));
  };

  const check = () => {
    const r = evaluate(p, text, unitIdx);
    setResult(r);
    if (r.kind === 'invalid') return;
    record(r.kind === 'correct');
    if (r.kind === 'correct') setShowSolution(true);
  };

  const next = () => {
    setP(randomProblem(pool, p.genId));
    setText('');
    setUnitIdx(0);
    setResult(null);
    setHints(0);
    setShowSolution(false);
    recorded.current = false;
  };

  const solved = result?.kind === 'correct';

  return (
    <section className="card">
      <div className="section-head">
        <span className="tag-pill">{label}</span>
        <button className="reset-btn" onClick={onExit}>
          ← กลับ
        </button>
      </div>
      <h3 style={{ marginTop: 10 }}>{p.title}</h3>
      <p className="small">
        {skillNames[p.skill]} · ทำถูกติดกัน {streak} ข้อ
      </p>
      <p>
        <T>{p.prompt}</T>
      </p>
      <AnswerBox p={p} text={text} unitIdx={unitIdx} onText={setText} onUnit={setUnitIdx} onSubmit={check} disabled={solved || showSolution} />
      {result && (
        <div className={`feedback ${solved ? 'good' : 'bad'}`} role="status">
          {feedback(result)}
        </div>
      )}
      {hints > 0 && (
        <ol className="hint-list">
          {p.hints.slice(0, hints).map((h, i) => (
            <li key={i}>
              <T>{h}</T>
            </li>
          ))}
        </ol>
      )}
      <div className="btn-row">
        {!solved && !showSolution && (
          <button className="btn" onClick={check} disabled={text.trim() === ''}>
            ตรวจคำตอบ
          </button>
        )}
        {!solved && !showSolution && hints < p.hints.length && (
          <button className="btn ghost" onClick={() => setHints(hints + 1)}>
            คำใบ้ ({hints}/{p.hints.length})
          </button>
        )}
        {!showSolution && (
          <button
            className="btn ghost"
            onClick={() => {
              record(false);
              setShowSolution(true);
            }}
          >
            ดูเฉลย
          </button>
        )}
        {(solved || showSolution) && (
          <button className="btn" onClick={next}>
            ข้อถัดไป →
          </button>
        )}
      </div>
      {showSolution && <Solution p={p} />}
    </section>
  );
}

// ------------------------------------------------------------------ exam

/** Picks one generator per slot of the exam set and makes a problem from it. */
function makeExam(set: ExamSet): Problem[] {
  return set.slots.map((ids) => {
    const id = ids[Math.floor(Math.random() * ids.length)];
    return makeProblem(generators.find((g) => g.id === id)!, newSeed());
  });
}

/** 125 → "2:05" */
const clock = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

function Exam({ set, onExit }: { set: ExamSet; onExit: () => void }) {
  const total = set.minutes * 60;
  const problems = useMemo(() => makeExam(set), [set]);
  // one answer (text + chosen unit) per question
  const [answers, setAnswers] = useState(() => problems.map(() => ({ text: '', unitIdx: 0 })));
  const [i, setI] = useState(0); // which question is on screen
  const [left, setLeft] = useState(total); // seconds left
  const [done, setDone] = useState(false);

  const results = useMemo(
    () => (done ? problems.map((p, k) => evaluate(p, answers[k].text, answers[k].unitIdx)) : []),
    [done, problems, answers],
  );

  /** Marks everything, saves the score and per-skill stats, and shows the results. */
  const finish = () => {
    if (done) return;
    const rs = problems.map((p, k) => evaluate(p, answers[k].text, answers[k].unitIdx));
    problems.forEach((p, k) => recordAttempt(p.skill, rs[k].kind === 'correct'));
    recordExam({
      at: Date.now(),
      score: rs.filter((r) => r.kind === 'correct').length,
      total: problems.length,
      seconds: total - left,
      set: set.id,
    });
    setDone(true);
    window.scrollTo(0, 0);
  };

  // the countdown: tick once a second; submit automatically at 0
  useEffect(() => {
    if (done) return;
    if (left <= 0) {
      finish();
      return;
    }
    const t = setTimeout(() => setLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [left, done]);

  /** Updates the answer of the question on screen. */
  const updateAnswer = (patch: Partial<{ text: string; unitIdx: number }>) =>
    setAnswers((as) => as.map((a, k) => (k === i ? { ...a, ...patch } : a)));

  if (done) {
    const score = results.filter((r) => r.kind === 'correct').length;
    return (
      <>
        <section className="card">
          <div className="section-head">
            <h2>
              ผลสอบ: {score}/{problems.length}
            </h2>
            <button className="reset-btn" onClick={onExit}>
              ← กลับ
            </button>
          </div>
          <p className="small">
            {set.label} · ใช้เวลา {clock(total - left)} นาที · ผลถูกบันทึกในสถิติรายทักษะแล้ว
          </p>
        </section>
        {problems.map((p, k) => {
          const ok = results[k].kind === 'correct';
          return (
            <section className="card" key={k}>
              <span className="tag-pill">
                ข้อ {k + 1} · {ok ? '✓ ถูก' : '✗ ผิด'}
              </span>
              <p style={{ marginTop: 8 }}>
                <T>{p.prompt}</T>
              </p>
              <div className={`feedback ${ok ? 'good' : 'bad'}`}>
                คำตอบของคุณ: {answers[k].text.trim() === '' ? '(ไม่ได้ตอบ)' : `${answers[k].text} ${p.units[answers[k].unitIdx].label}`}
                {!ok && answers[k].text.trim() !== '' && <div>{feedback(results[k])}</div>}
              </div>
              <Solution p={p} />
            </section>
          );
        })}
      </>
    );
  }

  const p = problems[i];
  return (
    <section className="card">
      <div className="section-head">
        <span className="tag-pill">
          {set.label} · ข้อ {i + 1}/{problems.length}
        </span>
        <span className="timer" style={{ color: left < 120 ? 'var(--bad)' : undefined }}>
          ⏱ {clock(left)}
        </span>
      </div>
      <div className="bar" style={{ margin: '10px 0' }}>
        <i style={{ width: `${(100 * left) / total}%` }} />
      </div>
      <p>
        <T>{p.prompt}</T>
      </p>
      <AnswerBox
        p={p}
        text={answers[i].text}
        unitIdx={answers[i].unitIdx}
        onText={(text) => updateAnswer({ text })}
        onUnit={(unitIdx) => updateAnswer({ unitIdx })}
      />
      <div className="btn-row">
        <button className="btn ghost" onClick={() => setI(i - 1)} disabled={i === 0}>
          ← ก่อนหน้า
        </button>
        {i < problems.length - 1 ? (
          <button className="btn" onClick={() => setI(i + 1)}>
            ถัดไป →
          </button>
        ) : (
          <button className="btn" onClick={finish}>
            ส่งคำตอบ
          </button>
        )}
      </div>
      <p className="small" style={{ marginTop: 10 }}>
        ตอบแล้ว {answers.filter((a) => a.text.trim() !== '').length}/{problems.length} ข้อ · ไม่มีคำใบ้ · เฉลยจะแสดงหลังส่ง ·{' '}
        <button
          className="reset-btn"
          onClick={() => {
            if (confirm('ออกจากชุดจับเวลา? คำตอบจะไม่ถูกบันทึก')) onExit();
          }}
        >
          ยกเลิก
        </button>
      </p>
    </section>
  );
}

// ------------------------------------------------------------------ menu

/** Which screen is showing. */
type Mode =
  | { kind: 'menu' }
  | { kind: 'drill'; pool: Skill[]; label: string }
  | { kind: 'exam'; set: ExamSet };

export function PracticePage() {
  const store = useStore();
  const [mode, setMode] = useState<Mode>({ kind: 'menu' });
  // chapter filter for the menu: 'all' or a chapter id from src/chapters.ts
  const [chapter, setChapter] = useState('all');

  if (mode.kind === 'drill') {
    return <Drill key={mode.label} pool={mode.pool} label={mode.label} onExit={() => setMode({ kind: 'menu' })} />;
  }
  if (mode.kind === 'exam') return <Exam set={mode.set} onExit={() => setMode({ kind: 'menu' })} />;

  const list = skillsOf(chapter);
  const weak = weakestSkill(store, list);
  const weakAcc = accuracy(store, weak);
  const lastExam = store.exams[store.exams.length - 1];
  const chapterLabel = chapter === 'all' ? 'ทุกบท' : `บทที่ ${readyChapters.find((c) => c.id === chapter)?.num}`;
  // timed sets for the current filter: all of them, or the ones that cover this chapter
  const sets = examSets.filter((e) => chapter === 'all' || e.chapters.includes(chapter));
  const chapterChips = [{ id: 'all', label: 'ทุกบท' }, ...readyChapters.map((c) => ({ id: c.id, label: `บท ${c.num}` }))];

  return (
    <>
      <section className="card">
        <h2>ฝึกทำโจทย์</h2>
        <p>
          โจทย์แนวเดียวกับแบบฝึกหัดข้อ 21–27 และตัวอย่างในสไลด์ ตัวเลขสุ่มใหม่ทุกครั้ง ใช้{' '}
          <T>{String.raw`$k=9.0\times10^{9}$, $\varepsilon_0=8.85\times10^{-12}$ และ $\mu_0=4\pi\times10^{-7}$`}</T> คำตอบคลาดได้ไม่เกิน 2%
        </p>
        <nav className="chips" aria-label="เลือกบท">
          {chapterChips.map((c) => (
            <button
              key={c.id}
              className={`chip${chapter === c.id ? ' done' : ''}`}
              onClick={() => setChapter(c.id)}
              aria-pressed={chapter === c.id}
            >
              {c.label}
            </button>
          ))}
        </nav>
        <div className="btn-row">
          <button className="btn" onClick={() => setMode({ kind: 'drill', pool: list, label: `สุ่ม · ${chapterLabel}` })}>
            สุ่มโจทย์ ({chapterLabel})
          </button>
          <button className="btn ghost" onClick={() => setMode({ kind: 'drill', pool: [weak], label: `จุดอ่อน: ${skillNames[weak]}` })}>
            ฝึกจุดอ่อน
          </button>
          {sets.map((e) => (
            <button key={e.id} className="btn ghost" onClick={() => setMode({ kind: 'exam', set: e })}>
              ⏱ {e.label} · {e.minutes} นาที
            </button>
          ))}
        </div>
        <p className="small" style={{ marginTop: 10 }}>
          จุดอ่อน ({chapterLabel}): <b>{skillNames[weak]}</b>{' '}
          {weakAcc === null ? '(ยังไม่เคยลอง)' : `(ถูก ${Math.round(weakAcc * 100)}%)`}
          {lastExam && ` · ชุดจับเวลาล่าสุด: ${lastExam.score}/${lastExam.total}`}
        </p>
      </section>

      <section className="card">
        <h2>ความแม่นยำรายทักษะ</h2>
        <p className="small">นับเฉพาะการตอบครั้งแรกของแต่ละข้อ · แตะทักษะเพื่อฝึกเฉพาะเรื่องนั้น</p>
        {readyChapters
          .filter((c) => chapter === 'all' || c.id === chapter)
          .map((c) => (
            <div key={c.id}>
              <h3 style={{ marginTop: 8 }}>
                บทที่ {c.num} · {c.title}
              </h3>
              {list
                .filter((sk) => skillChapter[sk] === c.id)
                .map((sk) => {
                  const st = store.skills[sk];
                  const acc = accuracy(store, sk);
                  return (
                    <button
                      key={sk}
                      className="skill-row"
                      style={{ width: '100%', background: 'none', border: 0, padding: 0, textAlign: 'left', cursor: 'pointer' }}
                      onClick={() => setMode({ kind: 'drill', pool: [sk], label: skillNames[sk] })}
                    >
                      <span>
                        {skillNames[sk]} {sk === weak && <span className="tag-pill">จุดอ่อน</span>}
                      </span>
                      <b>{st ? `${st.correct}/${st.total}` : '—'}</b>
                      <div className="bar">
                        <i style={{ width: `${(acc ?? 0) * 100}%` }} />
                      </div>
                    </button>
                  );
                })}
            </div>
          ))}
      </section>
    </>
  );
}
