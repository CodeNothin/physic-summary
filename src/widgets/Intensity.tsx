// =====================================================================
// Widget: intensity of a source that spreads its power out
// (slides 13–15, worksheet Q29).
//
// I = (Power)_av / A, where A is the area the wave has spread over:
//   ทุกทิศทาง (every direction)  → sphere,      A = 4πr²   (Q29)
//   เหนือพื้นโลก (above ground)   → half sphere, A = 2πr²   (slide 15)
// Then the energy that lands on a patch of area A' in time t is
// U = I A' t (Q29 part ข). The graph shows I falling as 1/r².
// =====================================================================
import { useState } from 'react';
import { Readout, Seg, Slider, WidgetFrame } from '../components/ui';
import { Graph } from '../components/Graph';
import { fmt } from '../lib/format';
import { emaxFromIntensity, energyOnArea, intensityAtDistance } from '../physics';
import type { Spread } from '../physics';

// starting values are worksheet Q29
const init = { PkW: 50, r: 200, spread: 'sphere' as Spread, A: 4, t: 60 };

export function Intensity() {
  const [PkW, setP] = useState(init.PkW);
  const [r, setR] = useState(init.r);
  const [spread, setSpread] = useState<Spread>(init.spread);
  const [A, setA] = useState(init.A);
  const [t, setT] = useState(init.t);

  const P = PkW * 1000;
  const I = intensityAtDistance(P, r, spread);
  const U = energyOnArea(I, A, t);
  const Emax = emaxFromIntensity(I);
  const R = 70; // on-screen radius of the wavefront (the picture is not to scale)
  const C = { x: 160, y: spread === 'sphere' ? 92 : 128 };

  return (
    <WidgetFrame
      title="ความเข้มของคลื่นที่ระยะ r"
      notice="กำลังของแหล่งกำเนิดกระจายบนผิวทรงกลม $4\pi r^2$ ระยะเพิ่ม 2 เท่า ความเข้มเหลือ $\tfrac14$ ลองสลับเป็น **ครึ่งทรงกลม** (ส่งเฉพาะเหนือพื้นโลก แบบสไลด์ 15) พื้นที่เหลือครึ่งเดียว ความเข้มจึงเพิ่มเป็น 2 เท่า"
      onReset={() => {
        setP(init.PkW);
        setR(init.r);
        setSpread(init.spread);
        setA(init.A);
        setT(init.t);
      }}
    >
      <svg viewBox="0 0 320 190" className="stage pan-y">
        {spread === 'sphere' ? (
          <circle cx={C.x} cy={C.y} r={R} className="f-none s-accent" strokeWidth={2} strokeDasharray="5 4" />
        ) : (
          <>
            <path d={`M${C.x - R} ${C.y} A${R} ${R} 0 0 1 ${C.x + R} ${C.y}`} className="f-none s-accent" strokeWidth={2} strokeDasharray="5 4" />
            <line x1={20} y1={C.y} x2={300} y2={C.y} className="s-ink" strokeWidth={2} />
            <text x={24} y={C.y + 16} className="small mut">พื้นโลก</text>
          </>
        )}
        {/* the source and the radius to the receiving patch */}
        <circle cx={C.x} cy={C.y} r={7} className="f-pos" />
        <line x1={C.x} y1={C.y} x2={C.x + R * 0.71} y2={C.y - R * 0.71} className="s-muted" strokeWidth={1.4} />
        <text x={C.x + R * 0.26} y={C.y - R * 0.42} className="small">r</text>
        {/* receiving patch A', tangent to the wavefront */}
        <line
          x1={C.x + R * 0.71 - 12}
          y1={C.y - R * 0.71 - 12}
          x2={C.x + R * 0.71 + 12}
          y2={C.y - R * 0.71 + 12}
          className="s-metal"
          strokeWidth={7}
        />
        <text x={C.x + R * 0.71 + 14} y={C.y - R * 0.71 - 8} className="small">A′</text>
        <text x={8} y={18} className="small mut">{spread === 'sphere' ? 'พื้นที่ 4πr²' : 'พื้นที่ 2πr²'}</text>
      </svg>
      <Graph
        fn={(x) => intensityAtDistance(P, x, spread)}
        xMin={50}
        xMax={500}
        marker={r}
        yLabel="I (W/m²)"
        xLabel="r (m)"
        unit="W/m²"
        height={120}
      />
      <div className="controls">
        <Seg
          value={spread}
          onChange={setSpread}
          options={[
            { value: 'sphere', label: 'ทุกทิศทาง (4πr²)' },
            { value: 'hemisphere', label: 'เหนือพื้นโลก (2πr²)' },
          ]}
        />
        <Slider label="กำลังเฉลี่ย $P$" value={PkW} min={5} max={100} step={5} onChange={setP} show={`${PkW} kW`} />
        <Slider label="ระยะ $r$" value={r} min={50} max={500} step={10} onChange={setR} show={`${r} m`} />
        <Slider label="พื้นที่รับ $A'$" value={A} min={0.5} max={10} step={0.5} onChange={setA} show={`${A} m²`} />
        <Slider label="เวลา $t$" value={t} min={10} max={300} step={10} onChange={setT} show={`${t} s`} />
      </div>
      <div className="readouts">
        <Readout k="$I=P/A$" v={`${fmt(I)} W/m²`} hl />
        <Readout k="$U=IA't$" v={`${fmt(U)} J`} hl />
        <Readout k="$E_{max}=\sqrt{2\mu_0cI}$" v={`${fmt(Emax)} V/m`} />
      </div>
    </WidgetFrame>
  );
}
