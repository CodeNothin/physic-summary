// =====================================================================
// Widget: RL circuit, current switching on and off (slides 18–26, Q28).
//
// Case 1 ("เปิดสวิตช์ต่อแบตเตอรี่"): current rises, I = (ε/R)(1 − e^(−t/τ)).
// Case 2 ("ตัดแบตเตอรี่ออก"):       current falls, I = (ε/R) e^(−t/τ).
// τ = L/R. The time slider runs from 0 to 5τ, so the curve always fills
// the graph; the readout gives the time in ms too. The two voltage
// readouts show slide 26: while rising, ΔV_L = ε − ΔV_R.
// =====================================================================
import { useState } from 'react';
import { Readout, Seg, Slider, WidgetFrame } from '../components/ui';
import { Graph } from '../components/Graph';
import { fmt } from '../lib/format';
import { rlDecay, rlMaxCurrent, rlRise, rlTau } from '../physics';

type Case = 'rise' | 'decay';
const init = { mode: 'rise' as Case, emf: 9, R: 4, LmH: 200, k: 1 };

export function RLCircuit() {
  const [mode, setMode] = useState<Case>(init.mode);
  const [emf, setEmf] = useState(init.emf);
  const [R, setR] = useState(init.R);
  const [LmH, setL] = useState(init.LmH);
  const [k, setK] = useState(init.k); // t / τ

  const L = LmH / 1000;
  const tau = rlTau(L, R);
  const Imax = rlMaxCurrent(emf, R);
  const tauMs = tau * 1000;
  const current = (tMs: number) => (mode === 'rise' ? rlRise(emf, R, L, tMs / 1000) : rlDecay(emf, R, L, tMs / 1000));
  const tMs = k * tauMs;
  const I = current(tMs);
  const VR = I * R;
  // rising: the battery is in the loop, ΔV_L = ε − IR; falling: no battery, ΔV_L = IR in size
  const VL = mode === 'rise' ? emf - VR : VR;

  return (
    <WidgetFrame
      title="วงจร RL"
      notice="ที่ $t=\tau$ กระแสขึ้นไปได้ 63% ของ $\varepsilon/R$ (หรือลดเหลือ 37%) ลองเพิ่ม $L$ แล้ว $\tau=L/R$ ยาวขึ้น ตัวเหนี่ยวนำ **ถ่วง** การเปลี่ยนแปลงของกระแส แต่ไม่เปลี่ยนค่าสุดท้าย $\varepsilon/R$"
      onReset={() => {
        setMode(init.mode);
        setEmf(init.emf);
        setR(init.R);
        setL(init.LmH);
        setK(init.k);
      }}
    >
      <Graph
        fn={current}
        xMax={5 * tauMs}
        marker={tMs}
        guides={[{ x: tauMs, label: 'τ' }]}
        yLabel="I (A)"
        xLabel="t (ms)"
        unit="A"
        cls="cur"
        height={150}
      />
      <div className="controls">
        <Seg
          value={mode}
          options={[
            { value: 'rise', label: 'กรณี 1: ต่อแบตเตอรี่' },
            { value: 'decay', label: 'กรณี 2: ตัดแบตเตอรี่' },
          ]}
          onChange={setMode}
        />
        <Slider label="แบตเตอรี่ $\varepsilon$" value={emf} min={3} max={24} step={1} onChange={setEmf} show={`${emf} V`} />
        <Slider label="ความต้านทาน $R$" value={R} min={1} max={20} step={1} onChange={setR} show={`${R} Ω`} />
        <Slider label="ความเหนี่ยวนำ $L$" value={LmH} min={10} max={500} step={10} onChange={setL} show={`${LmH} mH`} />
        <Slider label="เวลา $t$" value={k} min={0} max={5} step={0.05} onChange={setK} show={`${fmt(k)}τ = ${fmt(tMs)} ms`} />
      </div>
      <div className="readouts">
        <Readout k="$\tau=L/R$" v={`${fmt(tauMs)} ms`} />
        <Readout k="$\varepsilon/R$" v={`${fmt(Imax)} A`} />
        <Readout k="$I(t)$" v={`${fmt(I)} A`} hl />
        <Readout k="$\Delta V_R=IR$" v={`${fmt(VR)} V`} />
        <Readout k="$|\Delta V_L|$" v={`${fmt(VL)} V`} />
      </div>
    </WidgetFrame>
  );
}
