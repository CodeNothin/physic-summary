import { useState } from 'react';
import { Graph } from '../components/Graph';
import { Readout, Seg, Slider, WidgetFrame } from '../components/ui';
import { fmt, fmtSI } from '../lib/format';
import { sphereEnclosedCharge, sphereField, spherePotential } from '../physics';
import type { SphereKind } from '../physics';

const W = 320;
const H = 216;
const C = { x: W / 2, y: H / 2 };
const PX_PER_CM = 3.5;
const R_CM = 10; // same numbers as worksheet Q25
const Q = 4.0e-6;
const R = R_CM / 100;
const init = { r: 14, kind: 'conductor' as SphereKind };

// fixed pseudo-random dots that stand for charge spread through the insulator
const volumeDots = Array.from({ length: 60 }, (_, i) => {
  const rad = Math.sqrt((i + 0.5) / 60); // even in area
  const ang = i * 2.399963; // golden angle
  return { u: rad * Math.cos(ang), v: rad * Math.sin(ang), rad };
});
const surfaceDots = Array.from({ length: 20 }, (_, i) => {
  const ang = (i * 2 * Math.PI) / 20;
  return { u: Math.cos(ang), v: Math.sin(ang), rad: 1 };
});

export function SphereExplorer() {
  const [rCm, setRCm] = useState(init.r);
  const [kind, setKind] = useState<SphereKind>(init.kind);

  const r = rCm / 100;
  const Rpx = R_CM * PX_PER_CM;
  const rpx = rCm * PX_PER_CM;
  const qIn = sphereEnclosedCharge(kind, Q, R, r);
  const E = sphereField(kind, Q, R, r);
  const V = spherePotential(kind, Q, R, r);
  const dots = kind === 'conductor' ? surfaceDots : volumeDots;
  const where = r < R ? (kind === 'conductor' ? 'ในเนื้อตัวนำ' : 'ในเนื้อฉนวน') : r === R ? 'ที่ผิว' : 'ข้างนอก';

  return (
    <WidgetFrame
      title="สำรวจทรงกลมประจุ (R = 10 cm, Q = 4.0 μC)"
      notice="เลื่อน $r$ ผ่านผิวทรงกลม แล้วสลับ ตัวนำ / ฉนวน: ข้างนอกเหมือนกันทุกอย่าง ข้างในต่างกัน ดูว่าผิวเกาส์ (เส้นประ) ล้อมประจุ (จุดสีเข้ม) ไว้กี่จุด"
      onReset={() => {
        setRCm(init.r);
        setKind(init.kind);
      }}
    >
      <Seg
        value={kind}
        onChange={setKind}
        options={[
          { value: 'conductor', label: 'ตัวนำ' },
          { value: 'insulator', label: 'ฉนวนประจุสม่ำเสมอ' },
        ]}
      />
      <svg viewBox={`0 0 ${W} ${H}`} className="stage pan-y" style={{ marginTop: 8 }}>
        <circle cx={C.x} cy={C.y} r={Rpx} className={kind === 'conductor' ? 'f-metal' : 'f-card'} stroke="var(--muted)" />
        {dots.map((d, i) => {
          const inside = d.rad * R_CM <= rCm + 1e-9;
          return (
            <circle
              key={i}
              cx={C.x + d.u * Rpx * 0.97}
              cy={C.y + d.v * Rpx * 0.97}
              r={2.2}
              className="f-pos"
              opacity={inside ? 1 : 0.25}
            />
          );
        })}
        {rCm > 0 && (
          <circle cx={C.x} cy={C.y} r={rpx} className="f-none s-gauss" strokeWidth={2.2} strokeDasharray="6 4" />
        )}
        <line x1={C.x} y1={C.y} x2={C.x + rpx} y2={C.y} className="s-gauss" strokeWidth={1.5} />
        <circle cx={C.x + rpx} cy={C.y} r={4.5} className="f-gauss" />
        <text x={C.x + rpx + 7} y={C.y + 4} style={{ fontWeight: 700 }}>
          r
        </text>
        <text x={8} y={16} className="small mut">
          {kind === 'conductor' ? 'ตัวนำ: ประจุอยู่ที่ผิว' : 'ฉนวน: ประจุกระจายทั่วเนื้อ'}
        </text>
      </svg>
      <div className="controls">
        <Slider
          label="ระยะ $r$"
          value={rCm}
          min={0}
          max={30}
          step={0.5}
          onChange={setRCm}
          show={`${fmt(rCm)} cm · ${where}`}
        />
      </div>
      <div className="readouts">
        <Readout k="ประจุที่ถูกล้อม $q_{in}$" v={fmtSI(qIn, 'C')} />
        <Readout k="สนาม $E$" v={`${fmt(E)} N/C`} hl />
        <Readout k="ศักย์ $V$" v={V === null ? 'ไม่มีสูตรในเนื้อหา' : `${fmt(V)} V`} hl />
      </div>
      <div style={{ display: 'grid', gap: 6, marginTop: 8 }}>
        <Graph
          fn={(x) => sphereField(kind, Q, R, x / 100)}
          xMax={30}
          marker={rCm}
          guides={[{ x: R_CM, label: 'R' }]}
          yLabel="E(r)"
          xLabel="r (cm)"
          unit="N/C"
          cls="field"
        />
        <Graph
          fn={(x) => spherePotential(kind, Q, R, x / 100)}
          xMax={30}
          marker={rCm}
          guides={[{ x: R_CM, label: 'R' }]}
          yLabel="V(r)"
          xLabel="r (cm)"
          unit="V"
          gapNote={kind === 'insulator' ? { x: R_CM / 2, text: 'ไม่อยู่ในเนื้อหา' } : undefined}
        />
      </div>
    </WidgetFrame>
  );
}
