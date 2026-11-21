// =====================================================================
// Widget: light through a row of polarizers (slides 35–39).
//
// Each sheet is a circle with its transmission axis drawn as a line, at
// an angle from the vertical. Light comes in from the left, either
// unpolarized (the first sheet passes ½) or polarized vertically
// (slide 38). After each sheet, Malus's law I = I_prev cos²(Δθ) with Δθ
// the angle between this sheet and the previous direction.
// The arrow under each gap has a length ∝ the intensity there.
// =====================================================================
import { useState } from 'react';
import { Readout, Seg, Slider, WidgetFrame } from '../components/ui';
import { fmt } from '../lib/format';
import { polarizerStack } from '../physics';

type Input = 'unpol' | 'vertical';
const init = { input: 'unpol' as Input, count: 2, a: [0, 60, 90] };

export function Polarizers() {
  const [input, setInput] = useState<Input>(init.input);
  const [count, setCount] = useState(init.count);
  const [a, setA] = useState(init.a);

  const axes = a.slice(0, count);
  const out = polarizerStack(1, axes, input === 'unpol' ? null : 0);
  const setOne = (i: number) => (v: number) => setA(a.map((x, j) => (j === i ? v : x)));
  // sheets spread evenly between x = 95 and 225 (one sheet sits in the middle)
  const sheetX = [...Array(count)].map((_, i) => (count === 1 ? 160 : 95 + (i * 130) / (count - 1)));
  const r = 26;

  return (
    <WidgetFrame
      title="แผ่นโพลารอยด์และกฎของมาลุส"
      notice="แสงไม่โพลาไรซ์ผ่านแผ่นแรกเหลือครึ่งเดียวเสมอ แล้วแต่ละแผ่นต่อไปคูณ $\cos^2$ ของมุม **ระหว่างแผ่นนี้กับแผ่นก่อนหน้า** ลองตั้ง 2 แผ่นตั้งฉากกัน (0° กับ 90°) แสงดับ แล้วเพิ่มแผ่นที่ 45° ไว้ตรงกลาง แสงกลับลอดผ่านได้"
      onReset={() => {
        setInput(init.input);
        setCount(init.count);
        setA(init.a);
      }}
    >
      <svg viewBox="0 0 320 130" className="stage pan-y">
        <line x1={10} y1={60} x2={310} y2={60} className="s-line" strokeWidth={1.2} strokeDasharray="4 3" />
        <text x={8} y={20} className="small mut">{input === 'unpol' ? 'ไม่โพลาไรซ์' : 'โพลาไรซ์แนวตั้ง'}</text>
        {sheetX.map((x, i) => {
          const t = (axes[i] * Math.PI) / 180;
          return (
            <g key={i}>
              <circle cx={x} cy={60} r={r} className="f-none s-accent" strokeWidth={2} style={{ fill: 'var(--accent)', fillOpacity: 0.08 }} />
              <line x1={x - r * Math.sin(t)} y1={60 + r * Math.cos(t)} x2={x + r * Math.sin(t)} y2={60 - r * Math.cos(t)} className="s-ink" strokeWidth={2.5} />
              <text x={x} y={104} textAnchor="middle" className="small">
                {`${axes[i]}°`}
              </text>
              <rect x={x + r + 4} y={112} width={Math.max(1, 40 * out[i])} height={8} className="f-force" />
            </g>
          );
        })}
        <rect x={20} y={112} width={40} height={8} className="f-force" />
        <text x={20} y={108} className="small mut">I₀</text>
      </svg>
      <div className="controls">
        <Seg
          value={input}
          onChange={setInput}
          options={[
            { value: 'unpol', label: 'แสงไม่โพลาไรซ์' },
            { value: 'vertical', label: 'โพลาไรซ์แนวตั้ง' },
          ]}
        />
        <Seg
          value={String(count)}
          onChange={(v) => setCount(Number(v))}
          options={[
            { value: '1', label: '1 แผ่น' },
            { value: '2', label: '2 แผ่น' },
            { value: '3', label: '3 แผ่น' },
          ]}
        />
        {axes.map((x, i) => (
          <Slider key={i} label={`แผ่นที่ ${i + 1}: แกนทำมุมกับแนวตั้ง`} value={x} min={0} max={180} step={5} onChange={setOne(i)} show={`${x}°`} />
        ))}
      </div>
      <div className="readouts">
        {out.map((I, i) => (
          <Readout key={i} k={`หลังแผ่นที่ ${i + 1}`} v={`${fmt(I, 3)} I₀`} hl={i === out.length - 1} />
        ))}
      </div>
    </WidgetFrame>
  );
}
