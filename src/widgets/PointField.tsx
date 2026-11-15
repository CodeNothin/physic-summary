import { useCallback, useState } from 'react';
import { Arrow, ChargeDot, Readout, Seg, Slider, WidgetFrame } from '../components/ui';
import { clamp, fmt } from '../lib/format';
import { useDrag } from '../lib/useDrag';
import { pointFieldMagnitude } from '../physics';

const W = 320;
const H = 230;
const C = { x: W / 2, y: H / 2 };
const PX_PER_M = 400; // 40 px = 0.1 m
const init = { p: { x: 240, y: 115 }, qn: 2, sign: '+' as '+' | '-' };

export function PointField() {
  const [p, setP] = useState(init.p);
  const [qn, setQn] = useState(init.qn);
  const [sign, setSign] = useState(init.sign);

  const onMove = useCallback((_k: 'p', pt: { x: number; y: number }) => {
    let x = clamp(pt.x, 12, W - 12);
    let y = clamp(pt.y, 12, H - 12);
    // keep the probe off the charge itself
    const d = Math.hypot(x - C.x, y - C.y);
    if (d < 24) {
      const u = d === 0 ? { x: 1, y: 0 } : { x: (x - C.x) / d, y: (y - C.y) / d };
      x = C.x + u.x * 24;
      y = C.y + u.y * 24;
    }
    setP({ x, y });
  }, []);
  const bind = useDrag(onMove);

  const q = (sign === '+' ? 1 : -1) * qn * 1e-9;
  const dpx = Math.hypot(p.x - C.x, p.y - C.y);
  const rM = dpx / PX_PER_M;
  const E = pointFieldMagnitude(q, rM);
  const u = { x: (p.x - C.x) / dpx, y: (p.y - C.y) / dpx };
  const dir = q >= 0 ? 1 : -1;
  // arrow length follows 1/r² (relative to r = 0.1 m), clamped so it stays on screen
  const len = clamp(40 * qn * (0.1 / rM) ** 2, 6, 90);
  const reach = 18+10*qn

  return (
    <WidgetFrame
      title="สนามของจุดประจุ"
      notice="ลากจุด P ให้ห่างเป็น 2 เท่า ขนาดสนามจะเหลือ 1/4 แล้วลองสลับเครื่องหมายประจุดูทิศลูกศร"
      onReset={() => {
        setP(init.p);
        setQn(init.qn);
        setSign(init.sign);
      }}
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="stage" {...bind('p')}>
        {[0.1, 0.2, 0.3].map((rr) => (
          <g key={rr}>
            <circle cx={C.x} cy={C.y} r={rr * PX_PER_M} className="f-none s-line" strokeDasharray="3 4" />
            <text x={C.x + rr * PX_PER_M + 3} y={C.y - 3} className="small mut">
              {rr} m
            </text>
          </g>
        ))}
        {Array.from({ length: 8 }, (_, i) => {
          const a = (i * Math.PI) / 4 + Math.PI / 8;
          const r1 = dir > 0 ? 18 : reach;
          const r2 = dir > 0 ? reach : 18;
          return (
            <Arrow
              key={i}
              x1={C.x + Math.cos(a) * r1}
              y1={C.y + Math.sin(a) * r1}
              x2={C.x + Math.cos(a) * r2}
              y2={C.y + Math.sin(a) * r2}
              w={1.3}
              head={5}
              opacity={0.45}
            />
          );
        })}
        <line x1={C.x} y1={C.y} x2={p.x} y2={p.y} className="s-muted" strokeDasharray="4 3" />
        <ChargeDot x={C.x} y={C.y} q={q} />
        <Arrow x1={p.x} y1={p.y} x2={p.x + u.x * len * dir} y2={p.y + u.y * len * dir} w={3} head={9} />
        <circle cx={p.x} cy={p.y} r={7} className="f-accent drag" />
        <circle cx={p.x} cy={p.y} r={18} fill="transparent" className="drag" />
        <text x={p.x + 10} y={p.y - 10} style={{ fontWeight: 700 }}>
          P
        </text>
      </svg>
      <div className="controls">
        <Seg
          value={sign}
          onChange={setSign}
          options={[
            { value: '+', label: 'ประจุบวก (+)' },
            { value: '-', label: 'ประจุลบ (−)' },
          ]}
        />
        <Slider label="ขนาดประจุ $|q|$" value={qn} min={1} max={5} step={1} onChange={setQn} show={`${qn} nC`} />
      </div>
      <div className="readouts">
        <Readout k="ระยะ $r$" v={`${fmt(rM, 2)} m`} />
        <Readout k="$E=k|q|/r^2$" v={`${fmt(E)} N/C`} hl />
        <Readout k="ทิศของ $\vec E$" v={q >= 0 ? 'ชี้ออกจากประจุ' : 'ชี้เข้าหาประจุ'} />
      </div>
    </WidgetFrame>
  );
}
