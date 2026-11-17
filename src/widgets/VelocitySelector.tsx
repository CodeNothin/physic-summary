// =====================================================================
// Widget: velocity selector (slide 5).
//
// Same layout as the slide: + plate on the left, − plate on the right,
// so E points right; B points into the page (⊗); a proton enters from
// the bottom moving up. The path is computed by simulateCharge2D() in
// the physics module — nothing is faked. Only particles with v = E/B
// come out of the top in a straight line.
//
// Real sizes: plates 10 cm long, 4 cm apart. Drawing scale 2000 px/m,
// so 1 cm on the plates = 20 px.
// =====================================================================
import { useMemo, useState } from 'react';
import { Arrow, OutIn, Readout, Slider, WidgetFrame } from '../components/ui';
import { fmt } from '../lib/format';
import { E_CHARGE, PROTON_MASS, simulateCharge2D, velocitySelectorSpeed } from '../physics';

const W = 320;
const H = 300;
const S = 2000; // px per metre
const GAP = 0.04; // m between the plates
const LEN = 0.1; // m, plate length
const X0 = W / 2; // screen x of the centre line
const Y0 = H - 40; // screen y where the particle enters (y = 0 m)
const sx = (x: number) => X0 + x * S;
const sy = (y: number) => Y0 - y * S;

const init = { E: 2.5, B: 0.05, v: 5 }; // E in 10⁴ V/m, B in T, v in 10⁵ m/s

export function VelocitySelector() {
  const [E4, setE4] = useState(init.E);
  const [B, setB] = useState(init.B);
  const [v5, setV5] = useState(init.v);

  const E = E4 * 1e4;
  const v = v5 * 1e5;
  const vSel = velocitySelectorSpeed(E, B);

  // Simulate the proton until it hits a plate or leaves the top.
  const path = useMemo(
    () =>
      simulateCharge2D({
        q: E_CHARGE,
        m: PROTON_MASS,
        start: { p: { x: 0, y: 0 }, v: { x: 0, y: v } },
        E: { x: E, y: 0 }, // + plate on the left ⇒ E points right
        Bz: -B, // into the page
        dt: 2e-10,
        steps: 12000,
        stop: (p) => Math.abs(p.x) > GAP / 2 || p.y > LEN + 0.01 || p.y < -0.005,
      }),
    [E, B, v],
  );

  const last = path[path.length - 1];
  const result =
    Math.abs(last.x) > GAP / 2
      ? last.x < 0
        ? 'ชนแผ่นซ้าย (แรงแม่เหล็กชนะ)'
        : 'ชนแผ่นขวา (แรงไฟฟ้าชนะ)'
      : Math.abs(last.x) < 5e-4
        ? 'ผ่านช่องออกไปเป็นเส้นตรง ✓'
        : last.x < 0
          ? 'ออกไปได้แต่เบนซ้าย'
          : 'ออกไปได้แต่เบนขวา';

  const Fe = E_CHARGE * E;
  const FB = E_CHARGE * v * B;
  const fScale = 60 / Math.max(Fe, FB); // longest force arrow = 60 px

  return (
    <WidgetFrame
      title="ตัวเลือกความเร็ว"
      notice="ปรับ $v$ จน $qE=qvB$ แล้วโปรตอนวิ่งตรงผ่านช่องด้านบน ช้ากว่านั้นแรงไฟฟ้า (ขวา) ชนะ เร็วกว่านั้นแรงแม่เหล็ก (ซ้าย) ชนะ"
      onReset={() => {
        setE4(init.E);
        setB(init.B);
        setV5(init.v);
      }}
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="stage pan-y">
        {/* B into page, between the plates */}
        {Array.from({ length: 5 }, (_, j) =>
          Array.from({ length: 3 }, (_, i) => (
            <OutIn key={`${i}-${j}`} x={sx(-0.013 + i * 0.013)} y={sy(0.01 + j * 0.02)} out={false} size={5} opacity={0.4} />
          )),
        )}
        {/* E field lines, left to right */}
        {Array.from({ length: 5 }, (_, j) => (
          <Arrow key={j} x1={sx(-GAP / 2) + 8} y1={sy(0.02 + j * 0.02) + 9} x2={sx(GAP / 2) - 8} y2={sy(0.02 + j * 0.02) + 9} w={1.2} head={5} opacity={0.5} />
        ))}
        {/* plates */}
        <rect x={sx(-GAP / 2) - 12} y={sy(LEN)} width={12} height={LEN * S} className="f-pos" opacity={0.75} />
        <rect x={sx(GAP / 2)} y={sy(LEN)} width={12} height={LEN * S} className="f-neg" opacity={0.75} />
        <text x={sx(-GAP / 2) - 6} y={sy(LEN) - 6} textAnchor="middle" style={{ fontWeight: 700 }}>+</text>
        <text x={sx(GAP / 2) + 6} y={sy(LEN) - 6} textAnchor="middle" style={{ fontWeight: 700 }}>−</text>
        {/* exit slit at the top */}
        <line x1={sx(-0.03)} y1={sy(LEN + 0.005)} x2={sx(-0.003)} y2={sy(LEN + 0.005)} className="s-ink" strokeWidth={3} />
        <line x1={sx(0.003)} y1={sy(LEN + 0.005)} x2={sx(0.03)} y2={sy(LEN + 0.005)} className="s-ink" strokeWidth={3} />
        {/* the computed path */}
        <polyline
          points={path.filter((_, i) => i % 10 === 0 || i === path.length - 1).map((p) => `${sx(p.x)},${sy(p.y)}`).join(' ')}
          className="f-none s-pos"
          strokeWidth={2.2}
        />
        {/* forces at the entrance */}
        <Arrow x1={X0} y1={Y0} x2={X0 + Fe * fScale} y2={Y0} cls="field" w={3} head={9} />
        <Arrow x1={X0} y1={Y0} x2={X0 - FB * fScale} y2={Y0} cls="force" w={3} head={9} />
        <Arrow x1={X0} y1={Y0 + 30} x2={X0} y2={Y0 + 8} cls="vel" w={2.5} head={8} />
        <circle cx={X0} cy={Y0} r={6} className="f-pos" />
        <text x={X0 + Fe * fScale} y={Y0 + 16} textAnchor="middle" className="small" style={{ fill: 'var(--field)', fontWeight: 700 }}>
          Fe
        </text>
        <text x={X0 - FB * fScale} y={Y0 + 16} textAnchor="middle" className="small" style={{ fill: 'var(--force)', fontWeight: 700 }}>
          F_B
        </text>
        <text x={8} y={16} className="small mut">
          แผ่นยาว 10 cm ห่าง 4 cm · B เข้ากระดาษ
        </text>
      </svg>
      <div className="feedback hint" style={{ marginTop: 8 }}>
        {result}
      </div>
      <div className="controls">
        <Slider label="สนามไฟฟ้า $E$" value={E4} min={0.5} max={5} step={0.25} onChange={setE4} show={`${fmt(E)} V/m`} />
        <Slider label="สนามแม่เหล็ก $B$" value={B} min={0.02} max={0.1} step={0.005} onChange={setB} show={`${fmt(B)} T`} />
        <Slider label="อัตราเร็ว $v$" value={v5} min={1} max={10} step={0.25} onChange={setV5} show={`${fmt(v)} m/s`} />
      </div>
      <div className="readouts">
        <Readout k="$F_e=qE$" v={`${fmt(Fe)} N`} />
        <Readout k="$F_B=qvB$" v={`${fmt(FB)} N`} />
        <Readout k="อัตราเร็วที่ผ่านได้ $E/B$" v={`${fmt(vSel)} m/s`} hl />
      </div>
    </WidgetFrame>
  );
}
