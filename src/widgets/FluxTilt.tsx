import { useCallback, useState } from 'react';
import { Arrow, Readout, Slider, WidgetFrame } from '../components/ui';
import { fmt } from '../lib/format';
import { useDrag } from '../lib/useDrag';
import { fluxUniform } from '../physics';

const W = 320;
const H = 220;
const C = { x: 160, y: 110 };
const init = { theta: 30, E: 500, A: 0.5 };

export function FluxTilt() {
  const [theta, setTheta] = useState(init.theta);
  const [E, setE] = useState(init.E);
  const [A, setA] = useState(init.A);

  // dragging the top end of the surface sets θ (angle between E and the area vector)
  const onMove = useCallback((_k: 'h', p: { x: number; y: number }) => {
    const deg = (Math.atan2(C.x - p.x, C.y - p.y) * 180) / Math.PI;
    setTheta(Math.round(Math.min(180, Math.max(0, deg))));
  }, []);
  const bind = useDrag(onMove);

  const t = (theta * Math.PI) / 180;
  const half = 35 + 45 * A; // drawn half-length grows with the area
  const sx = Math.sin(t) * half;
  const sy = Math.cos(t) * half;
  const top = { x: C.x - sx, y: C.y - sy };
  const bot = { x: C.x + sx, y: C.y + sy };
  const aTip = { x: C.x + Math.cos(t) * 46, y: C.y - Math.sin(t) * 46 };

  // field-line density follows E (more lines = stronger field)
  const gap = 22 - (12 * (E - 100)) / 900;
  const rows: number[] = [];
  for (let y = 0; y <= 92; y += gap) {
    rows.push(y);
    if (y > 0) rows.push(-y);
  }
  const reach = Math.abs(sy);
  const passing = rows.filter((y) => Math.abs(y) <= reach + 0.01).length;
  const flux = fluxUniform(E, A, theta);

  return (
    <WidgetFrame
      title="เอียงผิวในสนามสม่ำเสมอ"
      notice="ลากปลายผิว (จุดกลม) เพื่อเอียง ลูกศรสีเข้มคือเส้นที่ทะลุผิว ที่ $\theta=90^\circ$ ไม่มีเส้นไหนทะลุเลย และเมื่อ $\theta>90^\circ$ ฟลักซ์เป็นลบ"
      onReset={() => {
        setTheta(init.theta);
        setE(init.E);
        setA(init.A);
      }}
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="stage">
        {rows.map((y) => {
          const hit = Math.abs(y) <= reach + 0.01;
          return (
            <Arrow
              key={y}
              x1={14}
              y1={C.y + y}
              x2={W - 14}
              y2={C.y + y}
              w={hit ? 2.2 : 1.2}
              opacity={hit ? 1 : 0.28}
            />
          );
        })}
        <text x={18} y={16} className="small mut">
          สนาม E →
        </text>
        <line x1={top.x} y1={top.y} x2={bot.x} y2={bot.y} className="s-ink" strokeWidth={5} strokeLinecap="round" />
        <Arrow x1={C.x} y1={C.y} x2={aTip.x} y2={aTip.y} cls="gauss" w={2.5} head={8} />
        <text x={aTip.x + 6} y={aTip.y - 4} className="f-gauss" style={{ fill: 'var(--gauss)', fontWeight: 700 }}>
          A
        </text>
        {theta > 4 && (
          <path
            d={`M ${C.x + 24} ${C.y} A 24 24 0 0 0 ${C.x + 24 * Math.cos(t)} ${C.y - 24 * Math.sin(t)}`}
            className="f-none s-gauss"
            strokeWidth={1.4}
          />
        )}
        <text x={C.x + 30} y={C.y - 8} className="small">
          θ
        </text>
        <g {...bind('h')} className="drag">
          <circle cx={top.x} cy={top.y} r={20} fill="transparent" />
          <circle cx={top.x} cy={top.y} r={8} className="f-accent" />
        </g>
      </svg>
      <div className="controls">
        <Slider label="มุม $\theta$ ระหว่าง $\vec E$ กับ $\vec A$" value={theta} min={0} max={180} step={1} onChange={setTheta} show={`${theta}°`} />
        <Slider label="ขนาดสนาม $E$" value={E} min={100} max={1000} step={50} onChange={setE} show={`${E} N/C`} />
        <Slider label="พื้นที่ $A$" value={A} min={0.1} max={1} step={0.1} onChange={setA} show={`${fmt(A, 2)} m²`} />
      </div>
      <div className="readouts">
        <Readout k="$\cos\theta$" v={fmt(Math.cos(t), 2)} />
        <Readout k="เส้นที่ทะลุผิว" v={`${passing} จาก ${rows.length} เส้น`} />
        <Readout k="$\Phi_E=EA\cos\theta$" v={`${fmt(flux)} N·m²/C`} hl />
      </div>
    </WidgetFrame>
  );
}
