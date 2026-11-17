// =====================================================================
// Widget: Gauss's law with draggable charges.
// The dashed outline is a closed (Gaussian) surface. Net flux = q_in / ε0,
// where q_in only counts charges inside. Each shape is a polygon, so one
// point-in-polygon test works for the circle, the box and the blob.
// =====================================================================
import { useCallback, useState } from 'react';
import { ChargeDot, Readout, Seg, WidgetFrame } from '../components/ui';
import { clamp, fmt } from '../lib/format';
import { useDrag } from '../lib/useDrag';
import { enclosedCharge, netFlux } from '../physics';
import type { Vec2 } from '../physics';

const W = 320;
const H = 240;

type Shape = 'circle' | 'box' | 'blob';

// every surface is a polygon, so one point-in-polygon test serves all shapes
const shapes: Record<Shape, Vec2[]> = {
  circle: Array.from({ length: 48 }, (_, i) => {
    const a = (i * 2 * Math.PI) / 48;
    return { x: 160 + 72 * Math.cos(a), y: 120 + 72 * Math.sin(a) };
  }),
  box: [
    { x: 85, y: 60 },
    { x: 235, y: 60 },
    { x: 235, y: 180 },
    { x: 85, y: 180 },
  ],
  blob: Array.from({ length: 48 }, (_, i) => {
    const a = (i * 2 * Math.PI) / 48;
    const rad = 62 + 22 * Math.sin(3 * a) + 12 * Math.cos(2 * a);
    return { x: 160 + rad * 1.15 * Math.cos(a), y: 120 + rad * Math.sin(a) };
  }),
};

function inside(poly: Vec2[], p: Vec2): boolean {
  let hit = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[i];
    const b = poly[j];
    if (a.y > p.y !== b.y > p.y && p.x < ((b.x - a.x) * (p.y - a.y)) / (b.y - a.y) + a.x) hit = !hit;
  }
  return hit;
}

const start = [
  { q: 3e-9, x: 140, y: 110 },
  { q: -2e-9, x: 190, y: 140 },
  { q: 1e-9, x: 40, y: 50 },
  { q: -1e-9, x: 285, y: 200 },
];

export function GaussCharges() {
  const [charges, setCharges] = useState(start);
  const [shape, setShape] = useState<Shape>('circle');

  const onMove = useCallback((i: number, p: Vec2) => {
    setCharges((cs) =>
      cs.map((c, k) => (k === i ? { ...c, x: clamp(p.x, 14, W - 14), y: clamp(p.y, 14, H - 14) } : c)),
    );
  }, []);
  const bind = useDrag(onMove);

  const poly = shapes[shape];
  const contains = (p: Vec2) => inside(poly, p);
  const qIn = enclosedCharge(charges, contains);
  const flux = netFlux(qIn);

  return (
    <WidgetFrame
      title="ลากประจุเข้า–ออกผิวปิด"
      notice="ฟลักซ์สุทธิเปลี่ยนเฉพาะตอนที่ประจุ **ข้ามเส้นประ** เท่านั้น ขยับประจุไปมาข้างใน (หรือข้างนอก) หรือเปลี่ยนรูปร่างผิว ค่าก็ไม่เปลี่ยน"
      onReset={() => {
        setCharges(start);
        setShape('circle');
      }}
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="stage">
        <polygon
          points={poly.map((p) => `${p.x},${p.y}`).join(' ')}
          className="s-gauss"
          strokeWidth={2.5}
          strokeDasharray="7 5"
          style={{ fill: 'var(--gauss)', fillOpacity: 0.1 }}
        />
        <text x={8} y={H - 8} className="small mut">
          เส้นประ = ผิวเกาส์ (ผิวปิดสมมติ)
        </text>
        {charges.map((c, i) => (
          <g key={i} {...bind(i)} className="drag">
            <circle cx={c.x} cy={c.y} r={22} fill="transparent" />
            {contains(c) && <circle cx={c.x} cy={c.y} r={16} className="f-none s-gauss" strokeWidth={2} />}
            <ChargeDot x={c.x} y={c.y} q={c.q} />
            <text x={c.x} y={c.y - 16} textAnchor="middle" className="small">
              {c.q > 0 ? '+' : '−'}
              {Math.abs(c.q) * 1e9} nC
            </text>
          </g>
        ))}
      </svg>
      <div className="controls">
        <Seg
          value={shape}
          onChange={setShape}
          options={[
            { value: 'circle', label: 'ทรงกลม' },
            { value: 'box', label: 'กล่อง' },
            { value: 'blob', label: 'รูปร่างแปลก ๆ' },
          ]}
        />
      </div>
      <div className="readouts">
        <Readout k="ประจุภายใน $q_{in}$" v={`${fmt(qIn * 1e9)} nC`} />
        <Readout k="ฟลักซ์สุทธิ $\Phi_E=q_{in}/\varepsilon_0$" v={`${fmt(flux)} N·m²/C`} hl />
        <Readout
          k="ความหมาย"
          v={flux > 0 ? 'เส้นสนามพุ่งออกสุทธิ' : flux < 0 ? 'เส้นสนามพุ่งเข้าสุทธิ' : 'เข้าเท่ากับออก'}
        />
      </div>
    </WidgetFrame>
  );
}
