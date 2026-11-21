// =====================================================================
// Widget: radiation pressure on a surface (slides 16–19).
//
// A wave of intensity S hits a flat plate head-on. A fraction f of it
// bounces back; the rest is absorbed.
//   P = (1 + f) S / c      f = 0 absorber (S/c), f = 1 mirror (2S/c)
//   F = P A
// The picture: incoming wave arrow (always full), reflected arrow
// (thickness ∝ f), and the push on the plate (length ∝ 1 + f).
// =====================================================================
import { useState } from 'react';
import { Arrow, Readout, Slider, WidgetFrame } from '../components/ui';
import { fmt, fmtSI } from '../lib/format';
import { radiationForce, radiationPressure } from '../physics';

// starting values: sunlight above the atmosphere (slide 21), a 1 m² plate
const init = { S: 1370, f: 0, A: 1 };

export function RadPressure() {
  const [S, setS] = useState(init.S);
  const [f, setF] = useState(init.f);
  const [A, setA] = useState(init.A);

  const P = radiationPressure(S, f);
  const F = radiationForce(S, A, f);
  const kind = f === 0 ? 'ดูดกลืนสมบูรณ์' : f === 1 ? 'สะท้อนสมบูรณ์' : 'สะท้อนบางส่วน';

  return (
    <WidgetFrame
      title="ความดันรังสี"
      notice="ผิวดูดกลืน: คลื่นส่งโมเมนตัม $U/c$ ให้ครั้งเดียว ผิวสะท้อน: คลื่นต้องกลับทิศด้วย จึงได้ $2U/c$ ลองเลื่อน $f$ จาก 0 ไป 1 ความดันเพิ่มจาก $S/c$ เป็น $2S/c$"
      onReset={() => {
        setS(init.S);
        setF(init.f);
        setA(init.A);
      }}
    >
      <svg viewBox="0 0 320 170" className="stage pan-y">
        {/* the plate */}
        <rect x={214} y={30} width={14} height={110} className="f-metal" />
        <text x={221} y={160} textAnchor="middle" className="small mut">A</text>
        {/* incoming wave (top) and reflected wave (bottom, thickness ∝ f) */}
        <Arrow x1={30} y1={62} x2={208} y2={62} cls="accent" w={6} head={13} />
        <text x={40} y={50} className="small">คลื่นตกกระทบ S</text>
        {f > 0 && <Arrow x1={208} y1={108} x2={30} y2={108} cls="accent" w={Math.max(1.5, 6 * f)} head={13} opacity={0.4 + 0.6 * f} />}
        {f > 0 && (
          <text x={40} y={130} className="small">
            สะท้อน {fmt(f * 100, 2)}%
          </text>
        )}
        {/* the push on the plate, length ∝ (1 + f) */}
        <Arrow x1={234} y1={85} x2={234 + 34 * (1 + f)} y2={85} cls="force" w={4} head={11} />
        <text x={238} y={76} className="small" style={{ fill: 'var(--force)', fontWeight: 700 }}>F</text>
        <text x={8} y={18} className="small" style={{ fontWeight: 700 }}>{kind}</text>
      </svg>
      <div className="controls">
        <Slider label="ความเข้ม $S$" value={S} min={100} max={3000} step={10} onChange={setS} show={`${S} W/m²`} />
        <Slider label="สัดส่วนที่สะท้อน $f$" value={f} min={0} max={1} step={0.05} onChange={setF} show={fmt(f, 2)} />
        <Slider label="พื้นที่ $A$" value={A} min={0.5} max={10} step={0.5} onChange={setA} show={`${A} m²`} />
      </div>
      <div className="readouts">
        <Readout k="$P=(1+f)S/c$" v={fmtSI(P, 'Pa')} hl />
        <Readout k="$F=PA$" v={fmtSI(F, 'N')} />
        <Readout k="$P$ ถ้าดูดกลืนหมด" v={fmtSI(radiationPressure(S, 0), 'Pa')} />
      </div>
    </WidgetFrame>
  );
}
