// =====================================================================
// Widget: field of long wires seen end-on, added as vectors (Q27).
//
// The page is the xy-plane, in metres, and the wires run along z.
// Wire A crosses at (0, a) and wire B at (b, 0). The user can flip each
// current (⊙ = +k̂, ⊗ = −k̂), change the current sizes, and drag the
// point P. Thin arrows are each wire's field; the thick arrow is the sum.
//
// Readouts are in units of μ0 I / 2π, the unit in the worksheet answer
//   B = μ0 I / 2π · (1/3 î + 1/2 ĵ)   (the default settings).
// =====================================================================
import { useCallback, useState } from 'react';
import { Arrow, OutIn, Readout, Seg, Slider, WidgetFrame } from '../components/ui';
import { clamp, fmt, snap } from '../lib/format';
import { useDrag } from '../lib/useDrag';
import { MU0, lineCurrentsField } from '../physics';
import type { Vec2 } from '../physics';

const W = 320;
const H = 260;
const S = 44; // px per metre
const O = { x: 70, y: 200 }; // screen position of the origin
const toScreen = (p: Vec2) => ({ x: O.x + p.x * S, y: O.y - p.y * S });
const UNIT = MU0 / (2 * Math.PI); // μ0 I / 2π with I = 1 A

const A_POS = { x: 0, y: 3 }; // a = 3 m
const B_POS = { x: 4, y: 0 }; // b = 4 m
const init = { aOut: true, bOut: false, nA: 1, nB: 2, P: { x: 0, y: 0 } };

export function WiresEndOn() {
  const [aOut, setAOut] = useState(init.aOut);
  const [bOut, setBOut] = useState(init.bOut);
  const [nA, setNA] = useState(init.nA); // current in A, in units of I
  const [nB, setNB] = useState(init.nB);
  const [P, setP] = useState(init.P);

  const onMove = useCallback((_k: 'P', p: Vec2) => {
    // snap P to a 0.5 m grid so it is easy to land on "nice" points
    setP({
      x: clamp(snap((p.x - O.x) / S, 0.5), -1, 5.5),
      y: clamp(snap((O.y - p.y) / S, 0.5), -1, 4),
    });
  }, []);
  const bind = useDrag(onMove);

  const wireA = { ...A_POS, I: (aOut ? 1 : -1) * nA };
  const wireB = { ...B_POS, I: (bOut ? 1 : -1) * nB };
  const onA = P.x === A_POS.x && P.y === A_POS.y;
  const onB = P.x === B_POS.x && P.y === B_POS.y;
  const BA = onA ? { x: 0, y: 0 } : lineCurrentsField([wireA], P);
  const BB = onB ? { x: 0, y: 0 } : lineCurrentsField([wireB], P);
  const net = { x: BA.x + BB.x, y: BA.y + BB.y };

  // arrow scale: 1 unit of μ0I/2π per metre → 90 px
  const k = 90 / UNIT;
  const sp = toScreen(P);
  const arrow = (b: Vec2, cls: string, w: number) => (
    <Arrow x1={sp.x} y1={sp.y} x2={sp.x + b.x * k} y2={sp.y - b.y * k} cls={cls} w={w} head={w * 3} />
  );

  return (
    <WidgetFrame
      title="ลวดยาวสองเส้นแนวแกน z (ข้อ 27)"
      notice="สนามของลวดแต่ละเส้นวนรอบลวด จึง **ตั้งฉาก** กับเส้นที่ลากจากลวดมาหา P ค่าเริ่มต้นคือข้อ 27 ลากจุด P ไปที่อื่น หรือกลับทิศกระแส แล้วดูผลรวมเวกเตอร์"
      onReset={() => {
        setAOut(init.aOut);
        setBOut(init.bOut);
        setNA(init.nA);
        setNB(init.nB);
        setP(init.P);
      }}
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="stage" {...bind('P')}>
        {/* 1 m grid */}
        {Array.from({ length: 7 }, (_, i) => i - 1).map((i) => (
          <g key={i}>
            <line x1={toScreen({ x: i, y: -1 }).x} y1={toScreen({ x: 0, y: -1 }).y} x2={toScreen({ x: i, y: 4.5 }).x} y2={toScreen({ x: 0, y: 4.5 }).y} className="s-line" />
            {i <= 4 && (
              <line x1={toScreen({ x: -1, y: i }).x} y1={toScreen({ x: 0, y: i }).y} x2={toScreen({ x: 5.5, y: 0 }).x} y2={toScreen({ x: 0, y: i }).y} className="s-line" />
            )}
          </g>
        ))}
        <Arrow x1={toScreen({ x: -1, y: 0 }).x} y1={O.y} x2={toScreen({ x: 5.5, y: 0 }).x} y2={O.y} cls="muted" w={1.2} head={6} />
        <Arrow x1={O.x} y1={toScreen({ x: 0, y: -1 }).y} x2={O.x} y2={toScreen({ x: 0, y: 4.5 }).y} cls="muted" w={1.2} head={6} />
        <text x={toScreen({ x: 5.5, y: 0 }).x - 4} y={O.y + 14} className="small mut">x (m)</text>
        <text x={O.x + 6} y={toScreen({ x: 0, y: 4.5 }).y + 4} className="small mut">y (m)</text>
        {[
          { w: wireA, label: 'A' },
          { w: wireB, label: 'B' },
        ].map(({ w, label }) => {
          const s = toScreen(w);
          return (
            <g key={label}>
              <OutIn x={s.x} y={s.y} out={w.I > 0} cls="cur" size={10} />
              <text x={s.x + 13} y={s.y - 10} style={{ fill: 'var(--cur)', fontWeight: 700 }}>
                {label} ({Math.abs(w.I)}I)
              </text>
            </g>
          );
        })}
        {arrow(BA, 'muted', 1.8)}
        {arrow(BB, 'muted', 1.8)}
        {arrow(net, 'bfield', 3.5)}
        <g className="drag">
          <circle cx={sp.x} cy={sp.y} r={20} fill="transparent" />
          <circle cx={sp.x} cy={sp.y} r={6} className="f-accent" />
          <text x={sp.x - 14} y={sp.y + 18} style={{ fontWeight: 700 }}>
            P
          </text>
        </g>
      </svg>
      <div className="controls">
        <div className="grid2" style={{ gap: 6 }}>
          <Seg
            value={aOut ? 'out' : 'in'}
            onChange={(v) => setAOut(v === 'out')}
            options={[
              { value: 'out', label: 'A: +k̂ ⊙' },
              { value: 'in', label: 'A: −k̂ ⊗' },
            ]}
          />
          <Seg
            value={bOut ? 'out' : 'in'}
            onChange={(v) => setBOut(v === 'out')}
            options={[
              { value: 'out', label: 'B: +k̂ ⊙' },
              { value: 'in', label: 'B: −k̂ ⊗' },
            ]}
          />
        </div>
        <Slider label="กระแสในลวด A" value={nA} min={1} max={3} step={1} onChange={setNA} show={`${nA}I`} />
        <Slider label="กระแสในลวด B" value={nB} min={1} max={3} step={1} onChange={setNB} show={`${nB}I`} />
      </div>
      <div className="readouts">
        <Readout k="P" v={`(${P.x}, ${P.y}) m`} />
        <Readout k="$B_x$ (หน่วย $\mu_0I/2\pi$)" v={fmt(net.x / UNIT, 3)} hl />
        <Readout k="$B_y$ (หน่วย $\mu_0I/2\pi$)" v={fmt(net.y / UNIT, 3)} hl />
      </div>
    </WidgetFrame>
  );
}
