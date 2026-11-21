// =====================================================================
// Widget: Young's double slit (slides 10–15, 21–24, worksheet Q31–32).
//
// The strip is the screen seen face-on: brightness = intensity, colour =
// the wavelength. The graph below is I/I_max against y (mm).
//   bright:  y = mλL/d        dark:  y = (m + ½)λL/d
//   I/I_max = cos²(πdy/λL)    (small angles, sinθ ≈ y/L)
// "รวมความกว้างสลิต a" multiplies by the single-slit envelope (sinα/α)²
// as on slide 22, so some bright fringes go missing.
// The y slider is the point P whose intensity is read out (Q32 asks for
// exactly this).
// =====================================================================
import { useState } from 'react';
import { Readout, Slider, Toggle, WidgetFrame } from '../components/ui';
import { Graph } from '../components/Graph';
import { fmt } from '../lib/format';
import { doubleSlitRatio, fringeSpacing } from '../physics';
import { lambdaColor } from './lightColor';

const YMAX = 10; // the strip and graph show −10 … +10 mm
const N = 160; // number of thin bars in the strip

// starting values are worksheet Q32 (L = 1.92 m found from its 2nd bright fringe)
const init = { lamNm: 600, dMm: 0.64, L: 1.92, yMm: 3.4, wide: false, aMm: 0.15 };

export function DoubleSlit() {
  const [lamNm, setLam] = useState(init.lamNm);
  const [dMm, setD] = useState(init.dMm);
  const [L, setL] = useState(init.L);
  const [yMm, setY] = useState(init.yMm);
  const [wide, setWide] = useState(init.wide);
  const [aMm, setA] = useState(init.aMm);

  const lam = lamNm * 1e-9;
  const d = dMm * 1e-3;
  const a = aMm * 1e-3;
  /** I/I_max at y (mm), with or without the single-slit envelope. */
  const ratio = (ymm: number) => {
    const y = ymm * 1e-3;
    const two = doubleSlitRatio(y, lam, L, d);
    if (!wide) return two;
    const alpha = (Math.PI * a * y) / (lam * L);
    return two * (Math.abs(alpha) < 1e-12 ? 1 : (Math.sin(alpha) / alpha) ** 2);
  };
  const dy = fringeSpacing(lam, L, d) * 1e3; // mm
  const I = ratio(yMm);
  const phiHalfDeg = ((Math.PI * d * yMm * 1e-3) / (lam * L)) * (180 / Math.PI);

  return (
    <WidgetFrame
      title="การแทรกสอดจากสลิตคู่"
      notice="ระยะห่างแถบ $\Delta y=\lambda L/d$: เพิ่ม $\lambda$ หรือ $L$ แถบห่างขึ้น เพิ่ม $d$ แถบชิดขึ้น ค่าเริ่มต้นคือข้อ 32 ลองเปิด **รวมความกว้างสลิต** จะเห็นแถบสว่างถูกคุมด้วยเส้นห่อของสลิตเดี่ยว (สไลด์ 22)"
      onReset={() => {
        setLam(init.lamNm);
        setD(init.dMm);
        setL(init.L);
        setY(init.yMm);
        setWide(init.wide);
        setA(init.aMm);
      }}
    >
      <svg viewBox="0 0 320 64" className="stage pan-y" style={{ background: '#000' }}>
        {[...Array(N)].map((_, i) => {
          const ymm = -YMAX + ((2 * YMAX) * (i + 0.5)) / N;
          return <rect key={i} x={(320 * i) / N} y={6} width={320 / N + 0.6} height={40} style={{ fill: lambdaColor(lamNm, ratio(ymm)) }} />;
        })}
        {/* point P */}
        <line x1={160 + (yMm / YMAX) * 160} y1={2} x2={160 + (yMm / YMAX) * 160} y2={50} stroke="#fff" strokeWidth={1.5} />
        <text x={160 + (yMm / YMAX) * 160 + 3} y={60} style={{ fill: '#fff', fontSize: 11 }}>P</text>
        <text x={157} y={60} style={{ fill: '#aaa', fontSize: 11 }}>0</text>
      </svg>
      <Graph fn={ratio} xMin={-YMAX} xMax={YMAX} marker={yMm} yLabel="I / I_max" xLabel="y (mm)" unit="" height={120} />
      <div className="controls">
        <Slider label="ความยาวคลื่น $\lambda$" value={lamNm} min={400} max={700} step={10} onChange={setLam} show={`${lamNm} nm`} />
        <Slider label="ระยะห่างสลิต $d$" value={dMm} min={0.2} max={1.5} step={0.02} onChange={setD} show={`${fmt(dMm)} mm`} />
        <Slider label="ระยะถึงฉาก $L$" value={L} min={0.5} max={3} step={0.02} onChange={setL} show={`${fmt(L)} m`} />
        <Slider label="ตำแหน่ง P บนฉาก $y$" value={yMm} min={-YMAX} max={YMAX} step={0.05} onChange={setY} show={`${fmt(yMm)} mm`} />
        <div className="seg">
          <Toggle on={wide} label="รวมความกว้างสลิต a" onChange={setWide} />
        </div>
        {wide && <Slider label="ความกว้างสลิต $a$" value={aMm} min={0.05} max={0.5} step={0.01} onChange={setA} show={`${fmt(aMm)} mm`} />}
      </div>
      <div className="readouts">
        <Readout k="$\Delta y=\lambda L/d$" v={`${fmt(dy)} mm`} hl />
        <Readout k="$I/I_{max}$ ที่ P" v={fmt(I)} hl />
        <Readout k="$\phi/2=\pi dy/\lambda L$" v={`${fmt(phiHalfDeg)}°`} />
        <Readout k="P อยู่ที่ $y/\Delta y$" v={`${fmt(yMm / dy)} แถบ`} />
      </div>
    </WidgetFrame>
  );
}
