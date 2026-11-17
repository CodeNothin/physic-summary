// =====================================================================
// Widget: direction of F = q v × B (cross-product hand rule trainer).
//
// The user picks v and B from the six axis directions and the sign of q.
// The picture is a 3-D "isometric" view of the x, y, z axes:
//   x comes towards you (down-left), y goes right (down-right), z goes up.
// That is the usual right-handed view, so x̂ × ŷ = ẑ points up on screen.
// "ทายก่อน" mode hides F until the user taps เฉลย, for self-testing.
// =====================================================================
import { useState } from 'react';
import { Arrow, Readout, Seg, WidgetFrame } from '../components/ui';
import { cross, forceOnCharge, vec3 } from '../physics';
import type { Vec3 } from '../physics';

const W = 320;
const H = 230;
const O = { x: 160, y: 125 }; // where the axes meet on screen
const LEN = 80; // on-screen length of a unit arrow

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

/** Turns a unit vector back into its name, e.g. (0,0,−1) → "−ẑ". */
function name(v: Vec3): string {
  if (v.x !== 0) return `${v.x > 0 ? '+' : '−'}x̂`;
  if (v.y !== 0) return `${v.y > 0 ? '+' : '−'}ŷ`;
  if (v.z !== 0) return `${v.z > 0 ? '+' : '−'}ẑ`;
  return '0';
}

const init = { v: '+x' as Dir, B: '+y' as Dir, sign: '+' as '+' | '-', guess: false };

export function CrossDir() {
  const [v, setV] = useState<Dir>(init.v);
  const [B, setB] = useState<Dir>(init.B);
  const [sign, setSign] = useState(init.sign);
  const [guess, setGuess] = useState(init.guess); // "ทายก่อน" mode on/off
  const [shown, setShown] = useState(false); // in guess mode: has the answer been revealed?

  const q = sign === '+' ? 1 : -1;
  const vxB = cross(unit[v], unit[B]); // direction of v × B (zero if parallel)
  const F = forceOnCharge(q, unit[v], unit[B]);
  const showF = !guess || shown;

  // when a choice changes in guess mode, hide the answer again
  const pick = <T,>(set: (x: T) => void) => (x: T) => {
    set(x);
    setShown(false);
  };

  const axis = (d: Dir) => {
    const e = project(unit[d]);
    return { x: O.x + (e.x - O.x) * 1.25, y: O.y + (e.y - O.y) * 1.25 };
  };

  return (
    <WidgetFrame
      title="ทิศของแรง F = qv × B"
      notice="ชี้นิ้วตาม $\vec v$ งอไปหา $\vec B$ นิ้วโป้งคือ $\vec v\times\vec B$ ลองเปิด **ทายก่อน** แล้วเดาทิศ F ก่อนกดเฉลย และดูว่าประจุลบกลับทิศ"
      onReset={() => {
        setV(init.v);
        setB(init.B);
        setSign(init.sign);
        setGuess(init.guess);
        setShown(false);
      }}
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="stage pan-y">
        {/* faint axes with labels */}
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
        <Arrow x1={O.x} y1={O.y} {...end(unit[v])} cls="vel" w={3.5} head={11} />
        <Arrow x1={O.x} y1={O.y} {...end(unit[B])} cls="bfield" w={3.5} head={11} />
        {showF && <Arrow x1={O.x} y1={O.y} {...end(F)} cls="force" w={4} head={12} />}
        <circle cx={O.x} cy={O.y} r={9} className={q > 0 ? 'f-pos' : 'f-neg'} />
        <text x={O.x} y={O.y + 4} textAnchor="middle" style={{ fill: '#fff', fontWeight: 700, fontSize: 13 }}>
          {q > 0 ? '+' : '−'}
        </text>
        <Label at={unit[v]} text="v" cls="vel" />
        <Label at={unit[B]} text="B" cls="bfield" />
        {showF && F.x + F.y + F.z !== 0 && <Label at={F} text="F" cls="force" />}
        {showF && vxB.x === 0 && vxB.y === 0 && vxB.z === 0 && (
          <text x={8} y={18} className="small" style={{ fontWeight: 700 }}>
            v ขนานกับ B ⇒ F = 0
          </text>
        )}
      </svg>
      <div className="controls">
        <span className="small">ทิศความเร็ว v</span>
        <Seg value={v} onChange={pick(setV)} options={dirs.map((d) => ({ value: d, label: d }))} />
        <span className="small">ทิศสนามแม่เหล็ก B</span>
        <Seg value={B} onChange={pick(setB)} options={dirs.map((d) => ({ value: d, label: d }))} />
        <Seg
          value={sign}
          onChange={pick(setSign)}
          options={[
            { value: '+', label: 'ประจุบวก' },
            { value: '-', label: 'ประจุลบ' },
          ]}
        />
        <div className="seg">
          <button className={guess ? 'on' : ''} aria-pressed={guess} onClick={() => {
              setGuess(!guess);
              setShown(false);
            }}>
            {guess ? '☑' : '☐'} ทายก่อน
          </button>
          {guess && (
            <button onClick={() => setShown(true)} disabled={shown}>
              เฉลยทิศ F
            </button>
          )}
        </div>
      </div>
      <div className="readouts">
        <Readout k="$\hat v\times\hat B$" v={showF ? name(vxB) : '?'} />
        <Readout k="ทิศของ $\vec F=q\vec v\times\vec B$" v={showF ? name(F) : '?'} hl />
      </div>
    </WidgetFrame>
  );
}

/** Screen end point of a unit arrow drawn from the origin. */
function end(v: Vec3) {
  const p = project(v);
  return { x2: p.x, y2: p.y };
}

/** A coloured letter placed just beyond the tip of a unit arrow. */
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
