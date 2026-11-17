// =====================================================================
// Widget: field inside a long solenoid (slides 23–25).
//
// Side cut through the coil: the top row of wires carries current out
// of the page (⊙) and the bottom row into the page (⊗), which by the
// grip rule makes B point to the right inside. Field lines are drawn
// inside only; the number of lines follows B = μ0 n I.
// The red rectangle is the Amperian loop of slide 25 with its sides
// numbered 1–4; the table says what each side contributes to ∮B·ds.
// =====================================================================
import { useState } from 'react';
import { Arrow, OutIn, Readout, Slider, Toggle, WidgetFrame } from '../components/ui';
import { fmt } from '../lib/format';
import { solenoidField, turnsPerLength } from '../physics';

const W = 320;
const H = 200;
const TOP = 60; // screen y of the top row of wires
const BOT = 140; // screen y of the bottom row
const X0 = 30; // left end of the coil
const X1 = 290; // right end of the coil

const init = { N: 500, Lcm: 25, I: 2, loop: true };

export function Solenoid() {
  const [N, setN] = useState(init.N);
  const [Lcm, setL] = useState(init.Lcm);
  const [I, setI] = useState(init.I);
  const [loop, setLoop] = useState(init.loop);

  const n = turnsPerLength(N, Lcm / 100);
  const B = solenoidField(n, I);
  const Bmax = solenoidField(turnsPerLength(1000, 0.1), 5); // largest B the sliders allow

  // draw at most 18 wires per row; tighter winding (bigger n) = closer drawing
  const drawn = Math.round(6 + 12 * Math.min(1, n / 10000));
  const step = (X1 - X0) / drawn;
  const lines = Math.max(1, Math.round(1 + 6 * Math.sqrt(B / Bmax))); // field lines inside

  return (
    <WidgetFrame
      title="โซลีนอยด์"
      notice="เพิ่มจำนวนรอบ $N$ หรือลดความยาว $\ell$ แล้ว $n=N/\ell$ เพิ่ม สนามข้างในจึงแรงขึ้น ส่วนข้างนอกแทบเป็นศูนย์ เปิดวงแอมแปร์เพื่อดูว่าทำไมเหลือแค่ $B\ell$"
      onReset={() => {
        setN(init.N);
        setL(init.Lcm);
        setI(init.I);
        setLoop(init.loop);
      }}
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="stage pan-y">
        {/* field lines inside, pointing right */}
        {Array.from({ length: lines }, (_, i) => {
          const y = TOP + 14 + ((BOT - TOP - 28) * (i + 0.5)) / lines;
          return <Arrow key={i} x1={X0 + 6} y1={y} x2={X1 - 6} y2={y} cls="bfield" w={1.8} head={7} />;
        })}
        {/* the windings: ⊙ on top, ⊗ underneath */}
        {Array.from({ length: drawn }, (_, i) => {
          const x = X0 + step * (i + 0.5);
          return (
            <g key={i}>
              <OutIn x={x} y={TOP} out cls="cur" size={Math.min(7, step / 2.2)} />
              <OutIn x={x} y={BOT} out={false} cls="cur" size={Math.min(7, step / 2.2)} />
            </g>
          );
        })}
        {loop && (
          <g>
            <rect x={150} y={TOP - 34} width={90} height={BOT - TOP + 14} className="f-none s-pos" strokeWidth={2} />
            {/* side numbers as on slide 25 (here the coil is lying down) */}
            <text x={195} y={BOT - 6} textAnchor="middle" className="small" style={{ fill: 'var(--pos)', fontWeight: 700 }}>
              1
            </text>
            <text x={244} y={TOP + 10} className="small" style={{ fill: 'var(--pos)', fontWeight: 700 }}>
              2
            </text>
            <text x={195} y={TOP - 38} textAnchor="middle" className="small" style={{ fill: 'var(--pos)', fontWeight: 700 }}>
              3
            </text>
            <text x={140} y={TOP + 10} className="small" style={{ fill: 'var(--pos)', fontWeight: 700 }}>
              4
            </text>
          </g>
        )}
        <text x={8} y={H - 8} className="small mut">
          ภาพตัดตามยาว · ⊙ บน กระแสออก · ⊗ ล่าง กระแสเข้า
        </text>
      </svg>
      <div className="controls">
        <Slider label="จำนวนรอบ $N$" value={N} min={50} max={1000} step={50} onChange={setN} show={`${N} รอบ`} />
        <Slider label="ความยาว $\ell$" value={Lcm} min={10} max={50} step={1} onChange={setL} show={`${Lcm} cm`} />
        <Slider label="กระแส $I$" value={I} min={0.5} max={5} step={0.5} onChange={setI} show={`${fmt(I)} A`} />
        <div className="seg">
          <Toggle on={loop} label="แสดงวงแอมแปร์" onChange={setLoop} />
        </div>
      </div>
      <div className="readouts">
        <Readout k="$n=N/\ell$" v={`${fmt(n)} รอบ/m`} />
        <Readout k="$B_{in}=\mu_0nI$" v={`${fmt(B)} T`} hl />
        <Readout k="$B_{out}$" v="≈ 0" />
      </div>
      {loop && (
        <div className="scroll" style={{ marginTop: 8 }}>
          <table>
            <thead>
              <tr>
                <th>ด้าน</th>
                <th>อยู่ตรงไหน</th>
                <th>ได้ <span style={{ whiteSpace: 'nowrap' }}>∫B·ds</span></th>
              </tr>
            </thead>
            <tbody>
              <tr><td>1</td><td>ข้างใน ขนานกับ B</td><td>Bℓ</td></tr>
              <tr><td>2, 4</td><td>ตั้งฉากกับ B</td><td>0</td></tr>
              <tr><td>3</td><td>ข้างนอก B ≈ 0</td><td>0</td></tr>
            </tbody>
          </table>
        </div>
      )}
    </WidgetFrame>
  );
}
