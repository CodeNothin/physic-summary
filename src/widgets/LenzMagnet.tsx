// =====================================================================
// Widget: Lenz's law with a bar magnet and a horizontal loop
// (slides 9–11, the four cases a–d).
//
// The student picks which pole faces the loop and whether the magnet
// moves towards or away from it. The widget then shows:
//   green arrows  = the magnet's field through the loop (B)
//   blue arrow    = the induced field B_ind (always against the CHANGE)
//   purple arrow  = the induced current on the front edge of the loop
// "ทายก่อน" mode hides the answer until the student taps a direction.
//
// Picture: side view, seen slightly from above, so the loop is an
// ellipse. The FRONT edge (towards the reader) is the bottom of the
// ellipse; counter-clockwise seen from above moves RIGHT along it.
// =====================================================================
import { useState } from 'react';
import { Arrow, Readout, Seg, Toggle, WidgetFrame } from '../components/ui';
import { lenzInducedField, lenzTurn } from '../physics';
import type { Turn } from '../physics';

const W = 320;
const H = 230;
const LOOP = { x: 160, y: 175, rx: 90, ry: 20 }; // loop ellipse
const MAG = { x: 140, w: 40, h: 70 }; // magnet box (top y depends on the motion)

type Pole = 'N' | 'S';
type Motion = 'toward' | 'away';

const init = { pole: 'N' as Pole, motion: 'toward' as Motion, quiz: false };

export function LenzMagnet() {
  const [pole, setPole] = useState<Pole>(init.pole);
  const [motion, setMotion] = useState<Motion>(init.motion);
  const [quiz, setQuiz] = useState(init.quiz);
  const [guess, setGuess] = useState<Turn | null>(null);

  // Field lines leave N and enter S, so N facing down = field DOWN through the loop.
  const fluxUp: 1 | -1 = pole === 'N' ? -1 : 1;
  const increasing = motion === 'toward'; // closer magnet = stronger field through the loop
  const turn = lenzTurn(fluxUp, increasing);
  const induced = lenzInducedField(fluxUp, increasing);
  const show = !quiz || guess !== null;

  const top = 30; // magnet top
  const bottom = top + MAG.h;
  const half = MAG.h / 2;
  const lower = pole; // pole facing the loop
  const upper: Pole = pole === 'N' ? 'S' : 'N';
  const poleCls = (p: Pole) => (p === 'N' ? 'f-pos' : 'f-neg');

  const change = (f: () => void) => {
    f();
    setGuess(null);
  };

  return (
    <WidgetFrame
      title="กฎของเลนซ์: แม่เหล็กกับขดลวด"
      notice="สนามเหนี่ยวนำ (ฟ้า) ไม่ได้ตรงข้ามกับ $B$ เสมอ มันตรงข้ามกับ **การเปลี่ยนแปลง** ของฟลักซ์: แม่เหล็กเข้าใกล้ สนามเหนี่ยวนำสวน แม่เหล็กถอยออก สนามเหนี่ยวนำช่วยเสริม"
      onReset={() => {
        setPole(init.pole);
        setMotion(init.motion);
        setQuiz(init.quiz);
        setGuess(null);
      }}
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="stage pan-y">
        {/* back half of the loop (drawn first, behind the field lines) */}
        <path
          d={`M${LOOP.x - LOOP.rx} ${LOOP.y} A${LOOP.rx} ${LOOP.ry} 0 0 1 ${LOOP.x + LOOP.rx} ${LOOP.y}`}
          className="f-none s-ink"
          strokeWidth={3}
          opacity={0.5}
        />
        {/* the magnet's field through the loop */}
        {[-50, -18, 18, 50].map((dx) => (
          <Arrow
            key={dx}
            x1={LOOP.x + dx}
            y1={fluxUp < 0 ? bottom + 8 : H - 10}
            x2={LOOP.x + dx}
            y2={fluxUp < 0 ? H - 10 : bottom + 8}
            cls="bfield"
            w={1.6}
            head={6}
            opacity={0.8}
          />
        ))}
        {/* the magnet: two halves, N red, S blue */}
        <rect x={MAG.x} y={top} width={MAG.w} height={half} className={poleCls(upper)} />
        <rect x={MAG.x} y={top + half} width={MAG.w} height={half} className={poleCls(lower)} />
        <text x={MAG.x + MAG.w / 2} y={top + half / 2 + 5} textAnchor="middle" style={{ fill: '#fff', fontWeight: 700 }}>
          {upper}
        </text>
        <text x={MAG.x + MAG.w / 2} y={top + half * 1.5 + 5} textAnchor="middle" style={{ fill: '#fff', fontWeight: 700 }}>
          {lower}
        </text>
        {/* velocity of the magnet */}
        <Arrow
          x1={MAG.x - 18}
          y1={motion === 'toward' ? top + 15 : top + 55}
          x2={MAG.x - 18}
          y2={motion === 'toward' ? top + 55 : top + 15}
          cls="vel"
          w={2.4}
        />
        <text x={MAG.x - 26} y={top + 40} textAnchor="end" className="small" style={{ fill: 'var(--vel)' }}>
          v
        </text>
        {/* front half of the loop */}
        <path
          d={`M${LOOP.x - LOOP.rx} ${LOOP.y} A${LOOP.rx} ${LOOP.ry} 0 0 0 ${LOOP.x + LOOP.rx} ${LOOP.y}`}
          className="f-none s-ink"
          strokeWidth={3}
        />
        {show && (
          <g>
            {/* induced field at the centre of the loop */}
            <Arrow
              x1={LOOP.x + 82}
              y1={induced > 0 ? LOOP.y + 10 : LOOP.y - 40}
              x2={LOOP.x + 82}
              y2={induced > 0 ? LOOP.y - 40 : LOOP.y + 10}
              cls="force"
              w={3}
              head={8}
            />
            <text x={LOOP.x + 92} y={LOOP.y - 44} className="small" style={{ fill: 'var(--force)', fontWeight: 700 }}>
              B_ind
            </text>
            {/* induced current along the front edge: CCW from above moves right here */}
            <Arrow
              x1={turn === 'ccw' ? LOOP.x - 30 : LOOP.x + 30}
              y1={LOOP.y + LOOP.ry + 1}
              x2={turn === 'ccw' ? LOOP.x + 30 : LOOP.x - 30}
              y2={LOOP.y + LOOP.ry + 1}
              cls="cur"
              w={3}
              head={8}
            />
            <text x={LOOP.x - 60} y={LOOP.y + LOOP.ry + 18} className="small" style={{ fill: 'var(--cur)', fontWeight: 700 }}>
              I
            </text>
          </g>
        )}
        <text x={8} y={16} className="small mut">
          เขียว = B ของแม่เหล็ก · ฟ้า = B เหนี่ยวนำ · ม่วง = I
        </text>
      </svg>
      <div className="controls">
        <Seg
          value={pole}
          options={[
            { value: 'N', label: 'ขั้ว N หันลง' },
            { value: 'S', label: 'ขั้ว S หันลง' },
          ]}
          onChange={(v) => change(() => setPole(v))}
        />
        <Seg
          value={motion}
          options={[
            { value: 'toward', label: 'เลื่อนเข้าใกล้' },
            { value: 'away', label: 'ดึงออกห่าง' },
          ]}
          onChange={(v) => change(() => setMotion(v))}
        />
        <div className="seg">
          <Toggle on={quiz} label="ทายก่อนดูคำตอบ" onChange={(v) => change(() => setQuiz(v))} />
        </div>
        {quiz && (
          <div className="seg" role="group">
            <button className={guess === 'cw' ? 'on' : ''} onClick={() => setGuess('cw')}>
              ↻ ตามเข็ม
            </button>
            <button className={guess === 'ccw' ? 'on' : ''} onClick={() => setGuess('ccw')}>
              ↺ ทวนเข็ม
            </button>
          </div>
        )}
      </div>
      <div className="readouts">
        <Readout k="$B$ ผ่านขดลวด" v={fluxUp > 0 ? 'ชี้ขึ้น' : 'ชี้ลง'} />
        <Readout k="ฟลักซ์" v={increasing ? 'เพิ่มขึ้น' : 'ลดลง'} />
        <Readout k="$B$ เหนี่ยวนำ" v={show ? (induced > 0 ? 'ชี้ขึ้น' : 'ชี้ลง') : '?'} />
        <Readout
          k="กระแส (มองจากด้านบน)"
          v={show ? (turn === 'ccw' ? '↺ ทวนเข็ม' : '↻ ตามเข็ม') : '?'}
          hl
        />
      </div>
      {quiz && guess !== null && (
        <p className={`feedback ${guess === turn ? 'good' : 'bad'}`} style={{ marginTop: 8 }}>
          {guess === turn ? '✓ ถูก' : '✗ ยังไม่ถูก ดูลูกศรฟ้า: สนามเหนี่ยวนำตรงข้ามกับการเปลี่ยนแปลง แล้วใช้กฎกำมือขวาหาทิศกระแส'}
        </p>
      )}
    </WidgetFrame>
  );
}
