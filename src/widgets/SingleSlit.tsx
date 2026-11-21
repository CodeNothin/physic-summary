// =====================================================================
// Widget: diffraction from one narrow slit (slides 17–18, 25–28).
//
// Dark fringes: a sinθ = mλ (m = ±1, ±2, …), on the screen y = mλD/a.
// The central bright band runs from the first dark on one side to the
// other: width 2λD/a — "สลิตยิ่งแคบ แถบสว่างกลางยิ่งกว้าง".
// Intensity I/I_m = (sinα/α)², α = (πa/λ) sinθ.
// =====================================================================
import { useState } from 'react';
import { Readout, Slider, WidgetFrame } from '../components/ui';
import { Graph } from '../components/Graph';
import { fmt } from '../lib/format';
import { centralWidth, rayleighSlit, singleSlitDarkY } from '../physics';
import { lambdaColor } from './lightColor';

const YMAX = 15; // mm shown on each side
const N = 160;

// starting values are the slide-26 example: 580 nm, a = 0.3 mm, D = 2 m
const init = { lamNm: 580, aMm: 0.3, D: 2 };

export function SingleSlit() {
  const [lamNm, setLam] = useState(init.lamNm);
  const [aMm, setA] = useState(init.aMm);
  const [D, setD] = useState(init.D);

  const lam = lamNm * 1e-9;
  const a = aMm * 1e-3;
  const ratio = (ymm: number) => {
    const alpha = (Math.PI * a * ymm * 1e-3) / (lam * D);
    return Math.abs(alpha) < 1e-12 ? 1 : (Math.sin(alpha) / alpha) ** 2;
  };
  const y1 = singleSlitDarkY(1, lam, D, a) * 1e3; // mm
  const w = centralWidth(lam, D, a) * 1e3;
  // the side fringes are faint; boost the strip so they can be seen (the graph stays exact)
  const glow = (r: number) => Math.min(1, Math.sqrt(r) * 1.1);

  return (
    <WidgetFrame
      title="การเลี้ยวเบนผ่านสลิตเดี่ยว"
      notice="ลองทำสลิตให้ **แคบลง**: แถบสว่างกลางกว้างขึ้น ($2\lambda D/a$) ตรงข้ามกับที่หลายคนเดา แถบสว่างกลางกว้างเป็น 2 เท่าของแถบสว่างข้าง ๆ ค่าเริ่มต้นคือตัวอย่างในสไลด์ 26"
      onReset={() => {
        setLam(init.lamNm);
        setA(init.aMm);
        setD(init.D);
      }}
    >
      <svg viewBox="0 0 320 52" className="stage pan-y" style={{ background: '#000' }}>
        {[...Array(N)].map((_, i) => {
          const ymm = -YMAX + ((2 * YMAX) * (i + 0.5)) / N;
          return <rect key={i} x={(320 * i) / N} y={6} width={320 / N + 0.6} height={40} style={{ fill: lambdaColor(lamNm, glow(ratio(ymm))) }} />;
        })}
      </svg>
      <p className="small">แถบด้านข้างจริง ๆ จางกว่านี้มาก (ภาพเร่งความสว่างให้เห็น กราฟคือค่าจริง)</p>
      <Graph
        fn={ratio}
        xMin={-YMAX}
        xMax={YMAX}
        guides={y1 < YMAX ? [{ x: -y1, label: '−1' }, { x: y1, label: 'm=1' }] : []}
        yLabel="I / I_m"
        xLabel="y (mm)"
        unit=""
        height={120}
      />
      <div className="controls">
        <Slider label="ความยาวคลื่น $\lambda$" value={lamNm} min={400} max={700} step={10} onChange={setLam} show={`${lamNm} nm`} />
        <Slider label="ความกว้างสลิต $a$" value={aMm} min={0.05} max={1} step={0.01} onChange={setA} show={`${fmt(aMm)} mm`} />
        <Slider label="ระยะถึงฉาก $D$" value={D} min={0.5} max={3} step={0.1} onChange={setD} show={`${fmt(D)} m`} />
      </div>
      <div className="readouts">
        <Readout k="แถบมืดที่ 1: $y=\lambda D/a$" v={`${fmt(y1)} mm`} hl />
        <Readout k="แถบสว่างกลางกว้าง $2\lambda D/a$" v={`${fmt(w)} mm`} hl />
        <Readout k="$\theta_{min}=\lambda/a$" v={`${fmt(rayleighSlit(lam, a))} rad`} />
      </div>
    </WidgetFrame>
  );
}
