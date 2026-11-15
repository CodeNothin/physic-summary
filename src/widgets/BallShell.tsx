import { useState } from 'react';
import { Graph } from '../components/Graph';
import { Readout, Slider, WidgetFrame } from '../components/ui';
import { fmt } from '../lib/format';
import { ballInShellEnclosed, ballInShellField, shellSurfaceCharges } from '../physics';

const W = 320;
const H = 200;
const C = { x: W / 2, y: H / 2 };
const PX = 4.4; // px per cm
const [A, B, Cc] = [6, 12, 16]; // cm
const Q = 1e-6; // "Q" = 1 μC
const init = { r: 9, n: -2 };

/** charge written as a multiple of Q */
function inQ(x: number): string {
  const k = Math.round((x / Q) * 100) / 100;
  if (k === 0) return '0';
  const a = Math.abs(k);
  return `${k > 0 ? '+' : '−'}${a === 1 ? '' : a}Q`;
}

export function BallShell() {
  const [r, setR] = useState(init.r);
  const [n, setN] = useState(init.n);
  const Qshell = n * Q;
  const args = [Q, A / 100, Qshell, B / 100, Cc / 100] as const;
  const qIn = ballInShellEnclosed(...args, r / 100);
  const E = ballInShellField(...args, r / 100);
  const walls = shellSurfaceCharges(Q, Qshell);
  const region = r < A ? 1 : r < B ? 2 : r <= Cc ? 3 : 4;
  const regionText = ['', 'ในฉนวน', 'ช่องว่าง', 'ในเนื้อโลหะ', 'ข้างนอก'][region];

  return (
    <WidgetFrame
      title="ฉนวนทรงกลม +Q ในเปลือกตัวนำ"
      notice="เลื่อน $r$ ผ่านทั้ง 4 บริเวณ แล้วดูว่า $q_{in}$ เปลี่ยนตรงไหน ในเนื้อโลหะ $q_{in}$ ต้องเป็น 0 เสมอ ลองเปลี่ยนประจุของเปลือกเป็น $-Q$ แล้วดูสนามข้างนอก"
      onReset={() => {
        setR(init.r);
        setN(init.n);
      }}
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="stage pan-y">
        <circle cx={C.x} cy={C.y} r={Cc * PX} className="f-metal" />
        <circle cx={C.x} cy={C.y} r={B * PX} className="f-bg" />
        <circle cx={C.x} cy={C.y} r={A * PX} style={{ fill: 'var(--pos)', fillOpacity: 0.35 }} stroke="var(--pos)" />
        <text x={C.x} y={C.y + 4} textAnchor="middle" style={{ fontWeight: 700 }}>
          +Q
        </text>
        {[
          { x: A, t: 'a' },
          { x: B, t: 'b' },
          { x: Cc, t: 'c' },
        ].map((m) => (
          <text key={m.t} x={C.x - m.x * PX * 0.707 - 2} y={C.y - m.x * PX * 0.707 - 2} className="small" textAnchor="end">
            {m.t}
          </text>
        ))}
        <circle cx={C.x} cy={C.y} r={r * PX} className="f-none s-gauss" strokeWidth={2.2} strokeDasharray="6 4" />
        <circle cx={C.x + r * PX} cy={C.y} r={4.5} className="f-gauss" />
        <text x={8} y={16} className="small mut">
          บริเวณ {region}: {regionText}
        </text>
        <text x={W - 8} y={16} className="small mut" textAnchor="end">
          เปลือกมีประจุ {inQ(Qshell)}
        </text>
      </svg>
      <div className="controls">
        <Slider label="รัศมีผิวเกาส์ $r$" value={r} min={1} max={22} step={0.5} onChange={setR} show={`${fmt(r)} cm · บริเวณ ${region}`} />
        <Slider label="ประจุสุทธิของเปลือกตัวนำ" value={n} min={-3} max={3} step={1} onChange={setN} show={inQ(Qshell)} />
      </div>
      <div className="readouts">
        <Readout k="$q_{in}$" v={inQ(qIn)} hl />
        <Readout
          k="$E=kq_{in}/r^2$ (เมื่อ Q = 1 μC)"
          v={`${fmt(Math.abs(E))} N/C ${E > 0 ? 'ชี้ออก' : E < 0 ? 'ชี้เข้า' : ''}`}
          hl
        />
        <Readout k="ผิวในของเปลือก" v={inQ(walls.inner)} />
        <Readout k="ผิวนอกของเปลือก" v={inQ(walls.outer)} />
      </div>
      <div style={{ marginTop: 8 }}>
        <Graph
          fn={(x) => ballInShellField(...args, x / 100)}
          xMax={22}
          marker={r}
          guides={[
            { x: A, label: 'a' },
            { x: B, label: 'b' },
            { x: Cc, label: 'c' },
          ]}
          yLabel="E(r)  (+ = ชี้ออก)"
          xLabel="r (cm)"
          unit="N/C"
          cls="field"
          height={140}
        />
      </div>
    </WidgetFrame>
  );
}
