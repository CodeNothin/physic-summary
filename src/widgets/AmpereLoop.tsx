// =====================================================================
// Widget: Ampère's law with wires seen end-on (slide 16).
//
// Each long wire crosses the page at one point: ⊙ = current out of the
// page, ⊗ = into the page. The dashed curve is the Amperian loop,
// walked counter-clockwise. The widget really computes ∮B·ds by adding
// B·ds around the loop (circulation() in the physics module) and shows
// it next to μ0 I_enc. They match for every shape, and wires outside
// the loop never change the total — the twin of the Gauss widget.
//
// Physics coordinates: metres, x right, y UP. Drawing: 1 px = 1 mm,
// with the origin at the centre of the picture.
// =====================================================================
import { useCallback, useState } from 'react';
import { Arrow, OutIn, Readout, Seg, WidgetFrame } from '../components/ui';
import { clamp, fmt } from '../lib/format';
import { useDrag } from '../lib/useDrag';
import { MU0, circulation, enclosedCurrent, lineCurrentsField } from '../physics';
import type { LineCurrent, Vec2 } from '../physics';

const W = 320;
const H = 240;
const PX = 1000; // px per metre
const toScreen = (p: Vec2) => ({ x: W / 2 + p.x * PX, y: H / 2 - p.y * PX });
const toMetres = (p: Vec2) => ({ x: (p.x - W / 2) / PX, y: (H / 2 - p.y) / PX });

type Shape = 'circle' | 'square' | 'blob';

/** Loop outlines in metres, listed counter-clockwise (needed for the sign of ∮B·ds). */
const loops: Record<Shape, Vec2[]> = {
  circle: Array.from({ length: 64 }, (_, i) => {
    const a = (i * 2 * Math.PI) / 64;
    return { x: 0.075 * Math.cos(a), y: 0.075 * Math.sin(a) };
  }),
  square: [
    { x: -0.075, y: -0.07 },
    { x: 0.075, y: -0.07 },
    { x: 0.075, y: 0.07 },
    { x: -0.075, y: 0.07 },
  ],
  blob: Array.from({ length: 64 }, (_, i) => {
    const a = (i * 2 * Math.PI) / 64;
    const rad = 0.065 + 0.022 * Math.sin(3 * a) + 0.01 * Math.cos(2 * a);
    return { x: rad * 1.2 * Math.cos(a), y: rad * Math.sin(a) };
  }),
};

/** Standard ray-casting test: is point p inside polygon poly? */
function inside(poly: Vec2[], p: Vec2): boolean {
  let hit = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[i];
    const b = poly[j];
    if (a.y > p.y !== b.y > p.y && p.x < ((b.x - a.x) * (p.y - a.y)) / (b.y - a.y) + a.x) hit = !hit;
  }
  return hit;
}

const start: LineCurrent[] = [
  { x: -0.025, y: 0.015, I: 3 },
  { x: 0.03, y: -0.025, I: -1 },
  { x: 0.125, y: 0.085, I: 4 },
];

export function AmpereLoop() {
  const [wires, setWires] = useState(start);
  const [shape, setShape] = useState<Shape>('circle');

  const onMove = useCallback((i: number, p: Vec2) => {
    const m = toMetres({ x: clamp(p.x, 12, W - 12), y: clamp(p.y, 12, H - 12) });
    setWires((ws) => ws.map((w, k) => (k === i ? { ...w, ...m } : w)));
  }, []);
  const bind = useDrag(onMove);

  const loop = loops[shape];
  const Ienc = enclosedCurrent(wires, (p) => inside(loop, p));
  const lhs = circulation(wires, loop, 60);

  // 16 points along the loop where a small B arrow is drawn
  const samples = shape === 'square' ? squareSamples(loop) : Array.from({ length: 16 }, (_, k) => loop[k * 4]);

  return (
    <WidgetFrame
      title="กฎของแอมแปร์: ลากลวดเข้า–ออกวง"
      notice="ตัวเลข $\oint\vec B\cdot d\vec s$ คำนวณจริงจากการบวก $\vec B\cdot d\vec s$ รอบวง มันเท่ากับ $\mu_0I_{in}$ ทุกครั้ง เปลี่ยนเฉพาะตอนลวด **ข้ามเส้นประ** ลวดนอกวงทำให้ลูกศร B บนวงเปลี่ยน แต่ผลรวมไม่เปลี่ยน"
      onReset={() => {
        setWires(start);
        setShape('circle');
      }}
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="stage">
        <polygon
          points={loop.map((p) => toScreen(p)).map((p) => `${p.x},${p.y}`).join(' ')}
          className="s-gauss"
          strokeWidth={2.2}
          strokeDasharray="7 5"
          style={{ fill: 'var(--gauss)', fillOpacity: 0.08 }}
        />
        {samples.map((m, k) => {
          const B = lineCurrentsField(wires, m);
          const mag = Math.hypot(B.x, B.y);
          if (mag === 0) return null;
          // log scale so both strong and weak fields stay visible
          const len = clamp(8 + 6 * Math.log10(mag / 1e-7), 5, 24);
          const s = toScreen(m);
          return <Arrow key={k} x1={s.x} y1={s.y} x2={s.x + (B.x / mag) * len} y2={s.y - (B.y / mag) * len} cls="bfield" w={1.8} head={5} />;
        })}
        {wires.map((w, i) => {
          const s = toScreen(w);
          return (
            <g key={i} {...bind(i)} className="drag">
              <circle cx={s.x} cy={s.y} r={22} fill="transparent" />
              <OutIn x={s.x} y={s.y} out={w.I > 0} cls="cur" size={10} />
              <text x={s.x} y={s.y - 15} textAnchor="middle" className="small">
                {Math.abs(w.I)} A
              </text>
            </g>
          );
        })}
        <text x={8} y={H - 8} className="small mut">
          ⊙ กระแสออก (+) · ⊗ กระแสเข้า (−) · เดินวงทวนเข็มนาฬิกา
        </text>
      </svg>
      <div className="controls">
        <Seg
          value={shape}
          onChange={setShape}
          options={[
            { value: 'circle', label: 'วงกลม' },
            { value: 'square', label: 'สี่เหลี่ยม' },
            { value: 'blob', label: 'รูปแปลก ๆ' },
          ]}
        />
      </div>
      <div className="readouts">
        <Readout k="กระแสที่ทะลุวง $I_{in}$" v={`${fmt(Ienc)} A`} />
        <Readout k="$\mu_0 I_{in}$" v={`${fmt(MU0 * Ienc)} T·m`} />
        <Readout k="$\oint\vec B\cdot d\vec s$ (บวกจริงรอบวง)" v={`${fmt(Math.abs(lhs) < 1e-12 ? 0 : lhs)} T·m`} hl />
      </div>
    </WidgetFrame>
  );

}

/** For the square (only 4 corner points), spread 16 sample points evenly along its sides. */
function squareSamples(loop: Vec2[]): Vec2[] {
  const out: Vec2[] = [];
  for (let side = 0; side < 4; side++) {
    const a = loop[side];
    const b = loop[(side + 1) % 4];
    for (let k = 0; k < 4; k++) {
      const t = (k + 0.5) / 4;
      out.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
    }
  }
  return out;
}
