// =====================================================================
// Widget: which way does B point? (slide 9 property 3, worksheet Q30).
//
// The user picks the direction of E and the direction the wave travels.
// B must be perpendicular to both, and E × B must point along the travel
// direction, which gives B̂ = k̂ × Ê (src/physics/emwave.ts, bDirection).
// Same 3-D view as the CrossDir widget of chapter 3:
//   x comes towards you (down-left), y goes right (down-right), z goes up.
// "ทายก่อน" hides B until the user taps เฉลย, for self-testing.
// =====================================================================
import { useState } from 'react';
import { Arrow, Readout, Seg, WidgetFrame } from '../components/ui';
import { bDirection, vec3 } from '../physics';
import type { Vec3 } from '../physics';

const W = 320;
const H = 230;
const O = { x: 160, y: 125 };
const LEN = 80;

/** Projects a 3-D vector onto the 2-D screen (SVG y grows downward). */
function project(v: Vec3): { x: number; y: number } {
  return {
    x: O.x + LEN * (-0.866 * v.x + 0.866 * v.y),
    y: O.y + LEN * (0.5 * v.x + 0.5 * v.y - v.z),
  };
}

type Dir = '+x' | '-x' | '+y' | '-y' | '+z' | '-z';
const dirs: Dir[] = ['+x', '-x', '+y', '-y', '+z', '-z'];
const unit: Record<Dir, Vec3> = {
  '+x': vec3(1, 0, 0),
  '-x': vec3(-1, 0, 0),
  '+y': vec3(0, 1, 0),
  '-y': vec3(0, -1, 0),
  '+z': vec3(0, 0, 1),
  '-z': vec3(0, 0, -1),
};

/** Unit vector → its name, e.g. (0,1,0) → "+ŷ". */
function name(v: Vec3): string {
  if (v.x !== 0) return `${v.x > 0 ? '+' : '−'}x̂`;
  if (v.y !== 0) return `${v.y > 0 ? '+' : '−'}ŷ`;
  if (v.z !== 0) return `${v.z > 0 ? '+' : '−'}ẑ`;
  return '0';
}

// the starting choice is worksheet Q30: E along −z, travelling along +x
const init = { E: '-z' as Dir, k: '+x' as Dir, guess: false };

export function EBDirection() {
  const [E, setE] = useState<Dir>(init.E);
  const [k, setK] = useState<Dir>(init.k);
  const [guess, setGuess] = useState(init.guess);
  const [shown, setShown] = useState(false);

  // E along the travel direction is not a light wave (property 1 on slide 9)
  const sameAxis = E[1] === k[1];
  const B = bDirection(unit[E], unit[k]);
  const showB = !sameAxis && (!guess || shown);

  const pick = (set: (d: Dir) => void) => (d: Dir) => {
    set(d);
    setShown(false);
  };

  const axis = (d: Dir) => {
    const e = project(unit[d]);
    return { x: O.x + (e.x - O.x) * 1.25, y: O.y + (e.y - O.y) * 1.25 };
  };

  return (
    <WidgetFrame
      title="ทิศของ B ในคลื่น EM"
      notice="$\vec E\times\vec B$ ต้องชี้ไปทางที่คลื่นวิ่งเสมอ จึงได้ $\hat B=\hat k\times\hat E$ (ทิศคลื่น ครอส ทิศ E) เปิด **ทายก่อน** แล้วลองเดาก่อนกดเฉลย ค่าเริ่มต้นคือข้อ 30: $\vec E$ ชี้ $-\hat z$ คลื่นวิ่ง $+\hat x$"
      onReset={() => {
        setE(init.E);
        setK(init.k);
        setGuess(init.guess);
        setShown(false);
      }}
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="stage pan-y">
        {(['+x', '+y', '+z'] as Dir[]).map((d) => {
          const a = axis(d);
          const b = axis(('-' + d.slice(1)) as Dir);
          return (
            <g key={d}>
              <line x1={b.x} y1={b.y} x2={a.x} y2={a.y} className="s-line" strokeWidth={1.2} strokeDasharray="4 3" />
              <text x={a.x + (a.x < O.x ? -12 : 6)} y={a.y + (d === '+z' ? -4 : 12)} className="small mut">
                {d.slice(1)}
              </text>
            </g>
          );
        })}
        <Arrow x1={O.x} y1={O.y} {...end(unit[k])} cls="accent" w={3.5} head={11} />
        <Arrow x1={O.x} y1={O.y} {...end(unit[E])} cls="field" w={3.5} head={11} />
        {showB && <Arrow x1={O.x} y1={O.y} {...end(B)} cls="bfield" w={4} head={12} />}
        <circle cx={O.x} cy={O.y} r={4} className="f-ink" />
        <Label at={unit[k]} text="c" cls="accent" />
        <Label at={unit[E]} text="E" cls="field" />
        {showB && <Label at={B} text="B" cls="bfield" />}
        {sameAxis && (
          <text x={8} y={18} className="small" style={{ fontWeight: 700 }}>
            E ต้องตั้งฉากกับทิศที่คลื่นวิ่ง (คลื่นตามขวาง)
          </text>
        )}
      </svg>
      <div className="controls">
        <span className="small">ทิศของสนามไฟฟ้า E</span>
        <Seg value={E} onChange={pick(setE)} options={dirs.map((d) => ({ value: d, label: d }))} />
        <span className="small">ทิศที่คลื่นเคลื่อนที่</span>
        <Seg value={k} onChange={pick(setK)} options={dirs.map((d) => ({ value: d, label: d }))} />
        <div className="seg">
          <button
            className={guess ? 'on' : ''}
            aria-pressed={guess}
            onClick={() => {
              setGuess(!guess);
              setShown(false);
            }}
          >
            {guess ? '☑' : '☐'} ทายก่อน
          </button>
          {guess && (
            <button onClick={() => setShown(true)} disabled={shown || sameAxis}>
              เฉลยทิศ B
            </button>
          )}
        </div>
      </div>
      <div className="readouts">
        <Readout k="$\hat k\times\hat E$" v={showB ? name(B) : sameAxis ? '—' : '?'} hl />
        <Readout k="ตรวจ: $\hat E\times\hat B$" v={showB ? name(unit[k]) : '?'} />
      </div>
    </WidgetFrame>
  );
}

/** Screen end point of a unit arrow drawn from the origin. */
function end(v: Vec3) {
  const p = project(v);
  return { x2: p.x, y2: p.y };
}

/** A coloured letter just beyond the tip of a unit arrow. */
function Label({ at, text, cls }: { at: Vec3; text: string; cls: string }) {
  const p = project(at);
  const dx = p.x - O.x;
  const dy = p.y - O.y;
  return (
    <text x={p.x + dx * 0.18 - 4} y={p.y + dy * 0.18 + 4} style={{ fill: `var(--${cls})`, fontWeight: 700, fontSize: 14 }}>
      {text}
    </text>
  );
}
