// =====================================================================
// Widget: square loop sliding through a field region (slide 13 example).
//
// Loop width w, height ℓ, moving right at constant v through a region
// of uniform B (into the page) that is 3w wide, from x = 0 to x = 3w.
// x is the position of the loop's RIGHT edge, as on the slide.
// Two graphs follow the slider:
//   Φ_B(x)  in units of Bℓw   (positive = into the page)
//   ε(x)    in units of Bℓv   (ε = −dΦ/dt)
// The sign of ε depends on that "into the page = +" choice; see the
// note in src/physics/faraday.ts.
// =====================================================================
import { useState } from 'react';
import { Arrow, OutIn, Readout, Slider, WidgetFrame } from '../components/ui';
import { Graph } from '../components/Graph';
import { fmt } from '../lib/format';
import { loopRegionEmf, loopRegionFlux } from '../physics';

const W = 320;
const H = 130;
const PX = 42; // pixels per w
const X0 = 55; // screen x of x = 0
const Y_TOP = 40; // loop top on screen
const LOOP_H = 50; // loop height on screen

// Work in units where B = ℓ = w = v = 1, so Φ comes out in Bℓw and ε in Bℓv.
const flux = (x: number) => loopRegionFlux(1, 1, 1, 3, x);
const emf = (x: number) => loopRegionEmf(1, 1, 1, 3, x, 1);

const init = { x: 0.5 };

export function LoopRegion() {
  const [x, setX] = useState(init.x);
  const sx = (u: number) => X0 + u * PX; // x in units of w → screen
  const where = x <= 0 || x >= 4 ? 'นอกสนาม' : x < 1 ? 'กำลังเข้า' : x <= 3 ? 'อยู่ในสนามทั้งขด' : 'กำลังออก';
  const guides = [
    { x: 0, label: '0' },
    { x: 1, label: 'w' },
    { x: 3, label: '3w' },
    { x: 4, label: '4w' },
  ];

  return (
    <WidgetFrame
      title="ขดลวดเคลื่อนผ่านบริเวณสนาม (สไลด์ 13)"
      notice="ε เกิดเฉพาะตอนที่ฟลักซ์ **เปลี่ยน** (ตอนเข้าและตอนออก) ตอนที่ขดอยู่ในสนามทั้งขด ฟลักซ์มากที่สุดแต่คงที่ จึงได้ $\varepsilon=0$"
      onReset={() => setX(init.x)}
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="stage pan-y">
        {/* the field region, 0 to 3w */}
        <rect x={sx(0)} y={18} width={3 * PX} height={H - 36} className="f-bfield" opacity={0.1} />
        {Array.from({ length: 6 }, (_, i) =>
          Array.from({ length: 3 }, (_, j) => (
            <OutIn key={`${i}-${j}`} x={sx(0.25 + i * 0.5)} y={32 + j * 33} out={false} size={5} opacity={0.6} />
          )),
        )}
        {/* the loop: right edge at x, width w */}
        <rect x={sx(x - 1)} y={Y_TOP} width={PX} height={LOOP_H} className="f-none s-ink" strokeWidth={3.5} rx={2} />
        <Arrow x1={sx(x) + 6} y1={Y_TOP + LOOP_H / 2} x2={sx(x) + 30} y2={Y_TOP + LOOP_H / 2} cls="vel" w={2.2} head={6} />
        {/* axis */}
        <line x1={8} y1={H - 10} x2={W - 8} y2={H - 10} className="s-muted" />
        {guides.map((g) => (
          <text key={g.label} x={sx(g.x)} y={H - 1} textAnchor="middle" className="small mut">
            {g.label}
          </text>
        ))}
        <text x={sx(3) + 4} y={14} className="small mut">B เข้ากระดาษ กว้าง 3w</text>
      </svg>
      <Graph fn={flux} xMin={-0.5} xMax={5} marker={x} guides={guides} yLabel="Φ_B" xLabel="x" unit="× Bℓw" cls="bfield" height={110} />
      <Graph fn={emf} xMin={-0.5} xMax={5} marker={x} guides={guides} yLabel="ε" xLabel="x" unit="× Bℓv" cls="cur" height={110} />
      <div className="controls">
        <Slider label="ตำแหน่งขอบขวา $x$" value={x} min={-0.5} max={4.8} step={0.05} onChange={setX} show={`${fmt(x)} w`} />
      </div>
      <div className="readouts">
        <Readout k="ขดลวด" v={where} />
        <Readout k="$\Phi_B$" v={`${fmt(flux(x))} Bℓw`} />
        <Readout k="$\varepsilon=-d\Phi_B/dt$" v={`${fmt(emf(x))} Bℓv`} hl />
      </div>
    </WidgetFrame>
  );
}
