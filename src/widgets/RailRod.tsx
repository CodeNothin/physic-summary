// =====================================================================
// Widget: rod sliding on rails closed by a resistor (slides 6–8).
//
// The field points INTO the page (⊗). Drag the rod (or use the
// direction buttons) to see the shaded area, i.e. the flux Φ = Bℓx,
// grow or shrink. The readouts are for the speed set by the slider.
//   moving right → flux in grows → induced B out → current CCW
//   (down through R, up through the rod), F_B on the rod points left.
//   moving left  → everything flips.
// The drawing is not to scale: the rails always look the same height,
// whatever ℓ is; only the numbers use ℓ.
// =====================================================================
import { useCallback, useRef, useState } from 'react';
import { Arrow, OutIn, Readout, Seg, Slider, WidgetFrame } from '../components/ui';
import { fmt } from '../lib/format';
import { useDrag } from '../lib/useDrag';
import { motionalEmf, railCurrent, railForce, railPower } from '../physics';

const W = 320;
const H = 210;
const TOP = 45; // top rail (screen y)
const BOT = 165; // bottom rail
const XR = 34; // resistor x
const XMIN = 80; // rod limits on screen
const XMAX = 296;

type Dir = 'right' | 'left';
const init = { x: 190, v: 4, B: 0.5, lcm: 50, R: 5, dir: 'right' as Dir };

export function RailRod() {
  const [x, setX] = useState(init.x);
  const [v, setV] = useState(init.v);
  const [B, setB] = useState(init.B);
  const [lcm, setL] = useState(init.lcm);
  const [R, setR] = useState(init.R);
  const [dir, setDir] = useState<Dir>(init.dir);

  // last rod position, so a drag can tell which way the rod is moving
  const lastX = useRef(init.x);
  const onMove = useCallback((_k: 'rod', p: { x: number }) => {
    const nx = Math.max(XMIN, Math.min(XMAX, p.x));
    if (Math.abs(nx - lastX.current) > 0.5) setDir(nx > lastX.current ? 'right' : 'left'); // dragging sets the direction
    lastX.current = nx;
    setX(nx);
  }, []);
  const bind = useDrag(onMove);

  const l = lcm / 100;
  const emf = motionalEmf(B, l, v);
  const I = railCurrent(B, l, v, R);
  const F = railForce(B, l, v, R);
  const Pw = railPower(B, l, v, R);
  const ccw = dir === 'right';
  const mid = (TOP + BOT) / 2;

  return (
    <WidgetFrame
      title="แท่งตัวนำเลื่อนบนราง"
      notice="ลากแท่งไปทางขวา พื้นที่ (ฟลักซ์) เพิ่ม กระแสวนทวนเข็ม และแรงแม่เหล็กบนแท่ง **ต้านการเคลื่อนที่** เสมอ ลากกลับทางซ้าย ทุกอย่างกลับทิศ"
      onReset={() => {
        setX(init.x);
        lastX.current = init.x;
        setV(init.v);
        setB(init.B);
        setL(init.lcm);
        setR(init.R);
        setDir(init.dir);
      }}
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="stage" {...bind('rod')}>
        {/* shaded loop area = flux */}
        <rect x={XR} y={TOP} width={x - XR} height={BOT - TOP} className="f-bfield" opacity={0.12} />
        {/* field into the page */}
        {Array.from({ length: 7 }, (_, i) =>
          Array.from({ length: 4 }, (_, j) => (
            <OutIn key={`${i}-${j}`} x={60 + i * 38} y={TOP + 15 + j * 30} out={false} size={5} opacity={0.55} />
          )),
        )}
        {/* rails */}
        <line x1={XR} y1={TOP} x2={W - 4} y2={TOP} className="s-ink" strokeWidth={4} />
        <line x1={XR} y1={BOT} x2={W - 4} y2={BOT} className="s-ink" strokeWidth={4} />
        {/* resistor (zig-zag) on the left */}
        <path
          d={`M${XR} ${TOP} L${XR} ${mid - 24} ${[...Array(6)].map((_, i) => `L${XR + (i % 2 ? -7 : 7)} ${mid - 20 + i * 8}`).join(' ')} L${XR} ${mid + 24} L${XR} ${BOT}`}
          className="f-none s-ink"
          strokeWidth={2}
        />
        <text x={XR - 10} y={mid + 4} textAnchor="end" className="small">R</text>
        {/* current through the resistor: CCW loop = down through R */}
        <Arrow x1={XR + 16} y1={ccw ? mid - 18 : mid + 18} x2={XR + 16} y2={ccw ? mid + 18 : mid - 18} cls="cur" w={2.4} />
        {/* the rod (drag handle is the whole picture) */}
        <rect x={x - 6} y={TOP - 10} width={12} height={BOT - TOP + 20} rx={3} className="f-metal" stroke="var(--muted)" />
        {/* current in the rod: CCW = up */}
        <Arrow x1={x + 16} y1={ccw ? mid + 18 : mid - 18} x2={x + 16} y2={ccw ? mid - 18 : mid + 18} cls="cur" w={2.4} />
        <text x={x + 22} y={mid + 4} className="small" style={{ fill: 'var(--cur)', fontWeight: 700 }}>I</text>
        {/* velocity and magnetic force on the rod */}
        <Arrow x1={x} y1={TOP - 22} x2={x + (ccw ? 36 : -36)} y2={TOP - 22} cls="vel" w={2.4} />
        <text x={x + (ccw ? 40 : -40)} y={TOP - 18} textAnchor={ccw ? 'start' : 'end'} className="small" style={{ fill: 'var(--vel)' }}>v</text>
        <Arrow x1={x} y1={BOT + 22} x2={x + (ccw ? -36 : 36)} y2={BOT + 22} cls="force" w={2.4} />
        <text x={x + (ccw ? -40 : 40)} y={BOT + 26} textAnchor={ccw ? 'end' : 'start'} className="small" style={{ fill: 'var(--force)' }}>F_B</text>
        <text x={W - 6} y={mid + 4} textAnchor="end" className="small mut">ℓ</text>
      </svg>
      <div className="controls">
        <Seg
          value={dir}
          options={[
            { value: 'right', label: 'แท่งไปทางขวา →' },
            { value: 'left', label: '← แท่งไปทางซ้าย' },
          ]}
          onChange={setDir}
        />
        <Slider label="อัตราเร็ว $v$" value={v} min={1} max={10} step={0.5} onChange={setV} show={`${fmt(v)} m/s`} />
        <Slider label="สนาม $B$" value={B} min={0.1} max={1} step={0.1} onChange={setB} show={`${fmt(B)} T`} />
        <Slider label="ความยาวแท่ง $\ell$" value={lcm} min={10} max={100} step={5} onChange={setL} show={`${lcm} cm`} />
        <Slider label="ความต้านทาน $R$" value={R} min={1} max={20} step={1} onChange={setR} show={`${R} Ω`} />
      </div>
      <div className="readouts">
        <Readout k="$|\varepsilon|=B\ell v$" v={`${fmt(emf)} V`} hl />
        <Readout k="$I=|\varepsilon|/R$" v={`${fmt(I)} A`} />
        <Readout k="$F_B=I\ell B$" v={`${fmt(F)} N`} />
        <Readout k="$P=I^2R$" v={`${fmt(Pw)} W`} />
        <Readout k="กระแสวน" v={ccw ? '↺ ทวนเข็ม' : '↻ ตามเข็ม'} />
      </div>
    </WidgetFrame>
  );
}
