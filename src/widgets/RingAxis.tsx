// =====================================================================
// Widget: charged ring, V and E along its axis.
// Shows that E_x is minus the slope of the V(x) graph: at the centre V
// is largest but flat, so E = 0 there.
// =====================================================================
import { useState } from 'react';
import { Graph } from '../components/Graph';
import { Readout, Slider, WidgetFrame } from '../components/ui';
import { fmt } from '../lib/format';
import { fieldFromPotential1D, ringField, ringPotential } from '../physics';

const W = 320;
const H = 150;
const CX = W / 2;
const CY = H / 2;
const PX = 140; // px per metre
const Q = 5e-9;
const init = { a: 0.3, x: 0.4 };

export function RingAxis() {
  const [a, setA] = useState(init.a);
  const [x, setX] = useState(init.x);

  const V = ringPotential(Q, a, x);
  const E = ringField(Q, a, x);
  const slope = -fieldFromPotential1D((s) => ringPotential(Q, a, s), x); // dV/dx
  const px = CX + x * PX;
  const ry = a * PX;

  return (
    <WidgetFrame
      title="วงแหวนประจุ: V และ E บนแกน (Q = 5 nC)"
      notice="$E_x$ คือ **ลบความชัน** ของกราฟ $V$ ที่ $x=0$ กราฟ $V$ อยู่บนยอด (ความชันศูนย์) จึงได้ $E=0$ ทั้งที่ $V$ มีค่ามากที่สุด"
      onReset={() => {
        setA(init.a);
        setX(init.x);
      }}
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="stage pan-y">
        <line x1={8} y1={CY} x2={W - 8} y2={CY} className="s-muted" strokeDasharray="4 3" />
        <ellipse cx={CX} cy={CY} rx={ry * 0.22} ry={ry} className="f-none s-pos" strokeWidth={4} />
        <line x1={CX} y1={CY - ry} x2={px} y2={CY} className="s-gauss" strokeWidth={1.4} />
        <line x1={CX} y1={CY + ry} x2={px} y2={CY} className="s-gauss" strokeWidth={1.4} />
        <text x={8} y={16} className="small" style={{ fill: 'var(--gauss)' }}>
          ทุกชิ้นของวงแหวนห่างจาก P เท่ากัน:
          √(a²+x²) = {fmt(Math.hypot(a, x), 2)} m
        </text>
        <line x1={CX} y1={CY} x2={CX} y2={CY - ry} className="s-muted" />
        <text x={CX - 6} y={CY - ry / 2} textAnchor="end" className="small mut">
          a
        </text>
        <circle cx={px} cy={CY} r={6} className="f-accent" />
        <text x={px} y={CY + 20} textAnchor="middle" style={{ fontWeight: 700 }}>
          P
        </text>
        <text x={W - 10} y={CY - 6} textAnchor="end" className="small mut">
          แกน x
        </text>
      </svg>
      <div className="controls">
        <Slider label="ตำแหน่งบนแกน $x$" value={x} min={-1} max={1} step={0.05} onChange={setX} show={`${fmt(x, 2)} m`} />
        <Slider label="รัศมีวงแหวน $a$" value={a} min={0.1} max={0.5} step={0.05} onChange={setA} show={`${fmt(a, 2)} m`} />
      </div>
      <div className="readouts">
        <Readout k="$V=kQ/\sqrt{a^2+x^2}$" v={`${fmt(V)} V`} hl />
        <Readout k="ความชัน $dV/dx$" v={`${fmt(slope)} V/m`} />
        <Readout k="$E_x=-dV/dx$" v={`${fmt(E)} N/C`} hl />
      </div>
      <div style={{ display: 'grid', gap: 6, marginTop: 8 }}>
        <Graph fn={(s) => ringPotential(Q, a, s)} xMin={-1} xMax={1} marker={x} yLabel="V(x)" xLabel="x (m)" unit="V" guides={[{ x: 0, label: '0' }]} />
        <Graph fn={(s) => ringField(Q, a, s)} xMin={-1} xMax={1} marker={x} yLabel="Eₓ(x)" xLabel="x (m)" unit="N/C" cls="field" guides={[{ x: 0, label: '0' }]} />
      </div>
    </WidgetFrame>
  );
}
