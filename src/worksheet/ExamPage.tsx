// =====================================================================
// The "ตัวอย่างข้อสอบ" tab: worksheet questions 21–40 in full form.
//
// Three screens, picked by the URL (see App.tsx):
//   #/exam        ExamList        the 20 questions with a status each,
//                                 and the button for a mock exam
//   #/exam/25     QuestionScreen  one question: all its parts, hints,
//                                 checking, worked solution, new numbers
//   #/exam/mock   Mock            6 random questions, no hints, timed
//                                 (counts up), marked per answer box
//
// Questions and answer checking come from ./index.ts; the feedback
// sentences are the same as in practice mode (PracticePage.tsx).
// =====================================================================
import { useEffect, useMemo, useRef, useState } from 'react';
import { chapterById } from '../chapters';
import { M, T, Tex } from '../components/ui';
import { fmt } from '../lib/format';
import { recordMock, recordWs, useStore } from '../lib/store';
import type { WsStat } from '../lib/store';
import { feedback } from '../practice/PracticePage';
import { generators } from '../practice/questions';
import { Figure } from './figures';
import { allQuestions, built, checkBox, emptyInput, isBuilt, questionByNumber } from './index';
import type { BoxInput, BoxResult } from './index';
import type { Part, Question, ShuffledBox, WsProblem } from './types';

/** How many worksheet questions the real exam takes. */
const EXAM_COUNT = 6;

const newSeed = () => (Math.random() * 2 ** 32) >>> 0;

/** Blank inputs shaped like the problem: one list per part, one entry per box. */
const blankInputs = (p: WsProblem): BoxInput[][] => p.parts.map((part) => part.boxes.map(emptyInput));

/** Checks every box of a problem. */
const checkAll = (p: WsProblem, inputs: BoxInput[][]): BoxResult[][] =>
  p.parts.map((part, i) => part.boxes.map((b, j) => checkBox(b, inputs[i][j])));

const allCorrect = (rs: BoxResult[][]) => rs.flat().every((r) => r.kind === 'correct');

/** Status text and colour class for the list, from the saved progress. */
function status(st: WsStat | undefined): { text: string; cls: string } {
  if (!st || st.tries === 0) return { text: 'ยังไม่ลอง', cls: '' };
  if (st.clean === 0) return { text: `ลองแล้ว ${st.tries} ครั้ง`, cls: 'warn' };
  if (st.clean === 1) return { text: '✓ ถูกครบ 1 ครั้ง', cls: 'ok' };
  return { text: '✓✓ พร้อมสอบ', cls: 'ok' };
}

/** "1.84×10⁶ N/C", or the correct option for a choice box. */
function answerOf(b: ShuffledBox) {
  if (b.kind === 'choice') return <Tex>{b.options[b.correctIndex!].tex}</Tex>;
  const u = b.units[0];
  return `${fmt(b.answer / u.factor)} ${u.label}`;
}

/** The sentence under a box after checking. */
function boxFeedback(r: BoxResult): string {
  if (r.kind === 'blank') return 'ยังไม่ได้ตอบ';
  return feedback(r);
}

// ------------------------------------------------------------ answer boxes

function NumberBox({
  box,
  value,
  onChange,
  disabled,
}: {
  box: Extract<ShuffledBox, { kind: 'number' }>;
  value: BoxInput;
  onChange: (v: BoxInput) => void;
  disabled: boolean;
}) {
  const input = useRef<HTMLInputElement>(null);
  const insert = (s: string) => {
    onChange({ ...value, text: value.text + s });
    input.current?.focus();
  };
  return (
    <>
      <div className="answer-row">
        <input
          ref={input}
          value={value.text}
          disabled={disabled}
          onChange={(e) => onChange({ ...value, text: e.target.value })}
          placeholder="เช่น 1.84e6 หรือ 1/3"
          autoCapitalize="off"
          autoComplete="off"
          aria-label={box.label.replace(/\$/g, '')}
        />
        <select value={value.unitIdx} disabled={disabled} onChange={(e) => onChange({ ...value, unitIdx: Number(e.target.value) })} aria-label="หน่วย">
          {box.units.map((u, i) => (
            <option key={u.label} value={i}>
              {u.label}
            </option>
          ))}
        </select>
      </div>
      {!disabled && (
        <div className="seg small-seg">
          <button onClick={() => insert('-')}>−</button>
          <button onClick={() => insert('×10^')}>×10^</button>
          <button onClick={() => insert('/')}>/</button>
          <button onClick={() => onChange({ ...value, text: '' })}>ล้าง</button>
        </div>
      )}
    </>
  );
}

function ChoiceBox({
  box,
  value,
  onChange,
  disabled,
}: {
  box: Extract<ShuffledBox, { kind: 'choice' }>;
  value: BoxInput;
  onChange: (v: BoxInput) => void;
  disabled: boolean;
}) {
  return (
    <div className="choice-list" role="radiogroup" aria-label={box.label.replace(/\$/g, '')}>
      {box.options.map((o, i) => (
        <button
          key={i}
          role="radio"
          aria-checked={value.choice === i}
          className={value.choice === i ? 'on' : ''}
          disabled={disabled}
          onClick={() => onChange({ ...value, choice: i })}
        >
          <Tex>{o.tex}</Tex>
        </button>
      ))}
    </div>
  );
}

/** One lettered part: its question line and its answer boxes, with feedback once checked. */
function PartView({
  part,
  inputs,
  results,
  onChange,
  disabled,
}: {
  part: Part;
  inputs: BoxInput[];
  results: BoxResult[] | null;
  onChange: (j: number, v: BoxInput) => void;
  disabled: boolean;
}) {
  return (
    <div className="ws-part">
      {(part.label || part.ask) && (
        <p>
          {part.label && <b>{part.label}. </b>}
          <T>{part.ask}</T>
        </p>
      )}
      {part.boxes.map((b, j) => {
        const r = results?.[j];
        const ok = r?.kind === 'correct';
        return (
          <div key={j} className="ws-box">
            <div className="small">
              <T>{b.label}</T>
            </div>
            {b.kind === 'number' ? (
              <NumberBox box={b} value={inputs[j]} onChange={(v) => onChange(j, v)} disabled={disabled || ok} />
            ) : (
              <ChoiceBox box={b} value={inputs[j]} onChange={(v) => onChange(j, v)} disabled={disabled || ok} />
            )}
            {r && (
              <div className={`feedback ${ok ? 'good' : 'bad'}`} role="status">
                {ok ? 'ถูกต้อง!' : boxFeedback(r)}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function Solution({ p }: { p: WsProblem }) {
  return (
    <div className="worked" style={{ marginTop: 10 }}>
      <p className="tag">เฉลยด้วยตัวเลขของข้อนี้</p>
      <ol style={{ marginBottom: 6 }}>
        {p.solution.map((line, i) => (
          <li key={i}>
            <div className="scroll-x">
              <T>{line}</T>
            </div>
          </li>
        ))}
      </ol>
      <p className="tag">คำตอบ</p>
      <ul>
        {p.parts.flatMap((part, i) =>
          part.boxes.map((b, j) => (
            <li key={`${i}-${j}`}>
              {part.label && `${part.label}. `}
              <T>{b.label}</T>: <b>{answerOf(b)}</b>
            </li>
          )),
        )}
      </ul>
    </div>
  );
}

/** "Which formulas from the exam sheet does this use?" fold-out. */
function SheetFormulas({ q }: { q: Question }) {
  return (
    <details className="worked" style={{ marginTop: 10 }}>
      <summary>แนวคิดหลัก และสูตรจากชีทที่ใช้</summary>
      <div style={{ marginTop: 8 }}>
        <p>
          <b>แนวคิดหลัก:</b> <T>{q.idea}</T>
        </p>
        <p className="tag">สูตรในชีทที่ใช้</p>
        {q.sheet.map((f) => (
          <M key={f}>{f}</M>
        ))}
        <p className="tag" style={{ marginTop: 8 }}>
          ไม่อยู่ในชีท ต้องรู้เอง
        </p>
        <ul>
          {q.notOnSheet.map((t) => (
            <li key={t}>
              <T>{t}</T>
            </li>
          ))}
        </ul>
      </div>
    </details>
  );
}

// ------------------------------------------------------------ one question

function QuestionScreen({ q }: { q: Question }) {
  // 'original' = the worksheet's own numbers; otherwise a random seed
  const [seed, setSeed] = useState<number | 'original'>('original');
  const p = useMemo(() => q.make(seed), [q, seed]);
  const [inputs, setInputs] = useState(() => blankInputs(p));
  const [results, setResults] = useState<BoxResult[][] | null>(null);
  const [hints, setHints] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  // only the first complete check of each set of numbers is saved as progress
  const recorded = useRef(false);

  // a new set of numbers (or a different question) starts fresh
  useEffect(() => {
    setInputs(blankInputs(p));
    setResults(null);
    setHints(0);
    setShowSolution(false);
    recorded.current = false;
  }, [p]);

  const record = (clean: boolean) => {
    if (recorded.current) return;
    recorded.current = true;
    recordWs(q.q, clean);
  };

  const check = () => {
    const rs = checkAll(p, inputs);
    setResults(rs);
    if (rs.flat().some((r) => r.kind === 'blank' || r.kind === 'invalid')) return; // not finished yet: don't count
    const ok = allCorrect(rs);
    record(ok && hints === 0 && !showSolution);
    if (ok) setShowSolution(true);
  };

  const setInput = (i: number, j: number, v: BoxInput) =>
    setInputs((xs) => xs.map((row, a) => (a === i ? row.map((x, b) => (b === j ? v : x)) : row)));

  const solved = results !== null && allCorrect(results);
  const drills = generators.filter((g) => g.ws === q.q);
  const idx = built.indexOf(q);
  const prev = built[idx - 1];
  const next = built[idx + 1];

  return (
    <>
      <section className="card">
        <div className="section-head">
          <span className="tag-pill">
            ข้อ {q.q} · บทที่ {chapterById(q.chapter)?.num}
          </span>
          <a className="reset-btn" href="#/exam">
            ← รายการข้อ
          </a>
        </div>
        <h2 style={{ marginTop: 8 }}>{q.title}</h2>
        <div className="seg" role="group" aria-label="ตัวเลขของโจทย์">
          <button className={seed === 'original' ? 'on' : ''} aria-pressed={seed === 'original'} onClick={() => setSeed('original')}>
            ตัวเลขในแบบฝึกหัด
          </button>
          <button className={seed !== 'original' ? 'on' : ''} aria-pressed={seed !== 'original'} onClick={() => setSeed(newSeed())}>
            {seed === 'original' ? 'สุ่มตัวเลขใหม่' : '🎲 สุ่มอีกครั้ง'}
          </button>
        </div>
        <p style={{ marginTop: 10 }}>
          <b>{q.q}. </b>
          <T>{p.prompt}</T>
        </p>
        {p.figure && (
          <div style={{ textAlign: 'center' }}>
            <Figure id={p.figure.id} props={p.figure.props} />
          </div>
        )}
        {p.parts.map((part, i) => (
          <PartView key={i} part={part} inputs={inputs[i] ?? []} results={results?.[i] ?? null} onChange={(j, v) => setInput(i, j, v)} disabled={showSolution} />
        ))}
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
            <button className="btn" onClick={check}>
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
          {showSolution && (
            <button className="btn" onClick={() => setSeed(newSeed())}>
              🎲 ลองตัวเลขใหม่
            </button>
          )}
        </div>
        {showSolution && <Solution p={p} />}
        <SheetFormulas q={q} />
      </section>

      <section className="card">
        <div className="btn-row" style={{ marginTop: 0 }}>
          <a className="btn ghost" href={q.lesson}>
            📖 ทบทวนบทเรียน
          </a>
          {drills.length > 0 && (
            <a className="btn ghost" href={`#/practice/ws${q.q}`}>
              ✏️ ฝึกทีละส่วน ({drills.length} แบบ)
            </a>
          )}
        </div>
        <div className="btn-row">
          {prev ? (
            <a className="btn ghost" href={`#/exam/${prev.q}`}>
              ← ข้อ {prev.q}
            </a>
          ) : (
            <span />
          )}
          {next && (
            <a className="btn ghost" href={`#/exam/${next.q}`}>
              ข้อ {next.q} →
            </a>
          )}
        </div>
      </section>
    </>
  );
}

// ------------------------------------------------------------ mock exam

/** 125 → "2:05" */
const clock = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

/** Picks up to 6 different built questions at random, each with fresh numbers. */
function makeMock(): { q: Question; p: WsProblem }[] {
  const pool = [...built];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool
    .slice(0, EXAM_COUNT)
    .sort((a, b) => a.q - b.q)
    .map((q) => ({ q, p: q.make(newSeed()) }));
}

function Mock({ onAgain }: { onAgain: () => void }) {
  const items = useMemo(makeMock, []);
  const [inputs, setInputs] = useState(() => items.map((it) => blankInputs(it.p)));
  const [i, setI] = useState(0); // which question is on screen
  const [seconds, setSeconds] = useState(0);
  const [results, setResults] = useState<BoxResult[][][] | null>(null);

  // count-up clock; stops once submitted
  useEffect(() => {
    if (results) return;
    const t = setTimeout(() => setSeconds((s) => s + 1), 1000);
    return () => clearTimeout(t);
  }, [seconds, results]);

  const setInput = (part: number, box: number, v: BoxInput) =>
    setInputs((all) => all.map((q, a) => (a === i ? q.map((row, b) => (b === part ? row.map((x, c) => (c === box ? v : x)) : row)) : q)));

  const submit = () => {
    const rs = items.map((it, k) => checkAll(it.p, inputs[k]));
    // a question left completely blank does not count as a try in the list
    items.forEach((it, k) => {
      if (rs[k].flat().some((r) => r.kind !== 'blank')) recordWs(it.q.q, allCorrect(rs[k]));
    });
    const flat = rs.flat(2);
    recordMock({
      at: Date.now(),
      score: flat.filter((r) => r.kind === 'correct').length,
      total: flat.length,
      seconds,
      questions: items.map((it) => it.q.q),
    });
    setResults(rs);
    window.scrollTo(0, 0);
  };

  if (results) {
    const flat = results.flat(2);
    const score = flat.filter((r) => r.kind === 'correct').length;
    return (
      <>
        <section className="card">
          <div className="section-head">
            <h2>
              ได้ {score}/{flat.length} ช่อง
            </h2>
            <a className="reset-btn" href="#/exam">
              ← กลับ
            </a>
          </div>
          <p className="small">
            ใช้เวลา {clock(seconds)} · ข้อที่ถูกครบทุกช่องนับเป็น "ถูกครบ" ในรายการข้อ
          </p>
          <div className="btn-row">
            <button className="btn" onClick={onAgain}>
              จำลองสอบอีกชุด
            </button>
          </div>
        </section>
        {items.map((it, k) => (
          <section className="card" key={k}>
            <span className="tag-pill">
              ข้อ {it.q.q} · {allCorrect(results[k]) ? '✓ ถูกครบ' : '✗ ยังไม่ครบ'}
            </span>
            <p style={{ marginTop: 8 }}>
              <T>{it.p.prompt}</T>
            </p>
            {it.p.figure && (
              <div style={{ textAlign: 'center' }}>
                <Figure id={it.p.figure.id} props={it.p.figure.props} />
              </div>
            )}
            {it.p.parts.map((part, a) => (
              <PartView key={a} part={part} inputs={inputs[k][a]} results={results[k][a]} onChange={() => {}} disabled />
            ))}
            <Solution p={it.p} />
          </section>
        ))}
      </>
    );
  }

  const it = items[i];
  const answered = (k: number) => inputs[k].flat().every((x) => x.text.trim() !== '' || x.choice !== null);
  return (
    <section className="card">
      <div className="section-head">
        <span className="tag-pill">จำลองสอบ · ข้อ {it.q.q}</span>
        <span className="timer">⏱ {clock(seconds)}</span>
      </div>
      <nav className="chips" aria-label="ข้อในชุดนี้" style={{ marginTop: 8 }}>
        {items.map((x, k) => (
          <button key={k} className={`chip${k === i ? ' done' : ''}`} onClick={() => setI(k)} aria-current={k === i}>
            {answered(k) ? '● ' : ''}ข้อ {x.q.q}
          </button>
        ))}
      </nav>
      <p>
        <b>{it.q.q}. </b>
        <T>{it.p.prompt}</T>
      </p>
      {it.p.figure && (
        <div style={{ textAlign: 'center' }}>
          <Figure id={it.p.figure.id} props={it.p.figure.props} />
        </div>
      )}
      {it.p.parts.map((part, a) => (
        <PartView key={`${i}-${a}`} part={part} inputs={inputs[i][a]} results={null} onChange={(b, v) => setInput(a, b, v)} disabled={false} />
      ))}
      <div className="btn-row">
        <button className="btn ghost" onClick={() => setI(i - 1)} disabled={i === 0}>
          ← ก่อนหน้า
        </button>
        {i < items.length - 1 ? (
          <button className="btn" onClick={() => setI(i + 1)}>
            ถัดไป →
          </button>
        ) : (
          <button className="btn" onClick={() => confirm('ส่งคำตอบทั้งชุด?') && submit()}>
            ส่งคำตอบ
          </button>
        )}
      </div>
      <p className="small" style={{ marginTop: 10 }}>
        ไม่มีคำใบ้ · เฉลยแสดงหลังส่ง · ใช้ชีทสูตรได้ (แท็บ "สูตร") ·{' '}
        <a href="#/exam" onClick={(e) => !confirm('ออกจากการจำลองสอบ? คำตอบจะไม่ถูกบันทึก') && e.preventDefault()}>
          ยกเลิก
        </a>
      </p>
    </section>
  );
}

// ------------------------------------------------------------ list

function ExamList() {
  const s = useStore();
  const ready = built.filter((q) => (s.ws[q.q]?.clean ?? 0) >= 2).length;
  const lastMock = s.mocks[s.mocks.length - 1];
  return (
    <>
      <section className="card">
        <h2>ตัวอย่างข้อสอบ (แบบฝึกหัดข้อ 21–40)</h2>
        <p>
          ข้อสอบจริงหยิบ <b>{EXAM_COUNT} ข้อ</b> จาก 20 ข้อนี้ เปลี่ยนแค่ตัวเลข (คิดเป็น 30% ของคะแนน) ที่นี่แต่ละข้อมีครบทุกส่วนเหมือนในแบบฝึกหัด
          เริ่มจากตัวเลขเดิม แล้วกดสุ่มตัวเลขใหม่จนทำได้คล่อง
        </p>
        <p className="small">
          ในห้องสอบมีชีทสูตรและค่าคงที่ให้ ไม่ต้องท่องสูตร (ดูแท็บ <a href="#/cheat">สูตร</a>) แต่ละข้อบอกไว้ว่าใช้สูตรไหนจากชีท และอะไรที่ไม่อยู่ในชีท
        </p>
        <div className="skill-row">
          <span>พร้อมสอบ (ถูกครบโดยไม่ใช้คำใบ้ 2 ครั้ง)</span>
          <b>
            {ready}/{allQuestions.length} ข้อ
          </b>
          <div className="bar">
            <i style={{ width: `${(100 * ready) / allQuestions.length}%` }} />
          </div>
        </div>
        <div className="btn-row">
          <a className="btn" href="#/exam/mock">
            📝 จำลองสอบ {Math.min(EXAM_COUNT, built.length)} ข้อ
          </a>
        </div>
        <p className="small" style={{ marginTop: 8 }}>
          สุ่มจากข้อที่มีแล้ว (ข้อ {built[0].q}–{built[built.length - 1].q}) ไม่มีคำใบ้ จับเวลาแบบนับขึ้น
          {lastMock && ` · ครั้งล่าสุด ${lastMock.score}/${lastMock.total} ช่อง ใน ${clock(lastMock.seconds)}`}
        </p>
      </section>

      <section className="card">
        <h2>รายการข้อ</h2>
        <div className="ws-list">
          {allQuestions.map((x) => {
            const ch = chapterById(x.chapter);
            if (!isBuilt(x))
              return (
                <div key={x.q} className="ws-row soon">
                  <b>ข้อ {x.q}</b>
                  <span>
                    {x.title}
                    <span className="small mut"> · บทที่ {ch?.num} ยังไม่เสร็จ</span>
                  </span>
                </div>
              );
            const st = status(s.ws[x.q]);
            return (
              <a key={x.q} className="ws-row" href={`#/exam/${x.q}`}>
                <b>ข้อ {x.q}</b>
                <span>{x.title}</span>
                <span className={`ws-status ${st.cls}`}>{st.text}</span>
              </a>
            );
          })}
        </div>
      </section>
    </>
  );
}

// ------------------------------------------------------------ page

/** `sub` is the part of the URL after #/exam/ ("25", "mock" or nothing). */
export function ExamPage({ sub }: { sub?: string }) {
  // bumping `round` remounts <Mock>, which draws a new set of questions
  const [round, setRound] = useState(0);
  if (sub === 'mock') return <Mock key={round} onAgain={() => setRound(round + 1)} />;
  const q = sub ? questionByNumber(Number(sub)) : undefined;
  if (q) return <QuestionScreen key={q.q} q={q} />;
  return <ExamList />;
}
