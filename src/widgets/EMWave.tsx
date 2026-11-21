// =====================================================================
// Widget: a plane electromagnetic wave travelling along +x (slides 8–9).
//
// E = E_max cos(kx − ωt) along y (drawn up, orange-ish "field" colour),
// B = B_max cos(kx − ωt) along z (drawn slanting down-left, "bfield"),
// in step with E and smaller by the factor c (B is drawn scaled up so
// it can be seen; the readout gives its real size).
//
// The picture is a cheap 3-D view: x goes right, y goes up, and z comes
// towards you, drawn as a slant down-left. "เล่น" moves the wave with
// requestAnimationFrame; the speed on screen is only for looks.
// =====================================================================
import { useEffect, useRef, useState } from 'react';
import { Arrow, Readout, Slider, T, Toggle, WidgetFrame, r } from '../components/ui';
import { fmt, fmtSI } from '../lib/format';
import { bFromE, frequencyFromWavelength, intensityFromEmax, omegaFromK } from '../physics';

const W = 320;
const H = 200;
const O = { x: 40, y: 100 }; // where the x axis starts on screen
const LEN = 260; // on-screen length of the x axis
const AMP = 60; // pixels for the largest E
const Z = { x: -0.55, y: 0.45 }; // screen direction of +z (towards you)

const init = { E: 100, lamNm: 628, play: true };

export function EMWave() {
  const [E, setE] = useState(init.E); // V/m
  const [lamNm, setLam] = useState(init.lamNm); // wavelength in nm
  const [play, setPlay] = useState(init.play);
  const [phase, setPhase] = useState(0); // ωt, radians

  // animation: advance ωt while "เล่น" is on (about one period per 2 s)
  const last = useRef<number | null>(null);
  useEffect(() => {
    if (!play) return;
    let id = 0;
    const step = (now: number) => {
      if (last.current !== null) setPhase((p) => (p + ((now - last.current!) / 2000) * 2 * Math.PI) % (2 * Math.PI));
      last.current = now;
      id = requestAnimationFrame(step);
    };
    id = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(id);
      last.current = null;
    };
  }, [play]);

  const lam = lamNm * 1e-9;
  const k = (2 * Math.PI) / lam;
  const B = bFromE(E);
  const f = frequencyFromWavelength(lam);
  const I = intensityFromEmax(E);

  // two wavelengths fit the axis, whatever λ is; the size scales with E
  const a = (AMP * E) / 200;
  const pts = [...Array(121)].map((_, i) => {
    const s = i / 120; // 0..1 along the axis
    const c = Math.cos(4 * Math.PI * s - phase);
    return { x: O.x + LEN * s, c };
  });
  const ePath = pts.map((p, i) => `${i ? 'L' : 'M'}${p.x} ${O.y - a * p.c}`).join(' ');
  const bPath = pts.map((p, i) => `${i ? 'L' : 'M'}${p.x + Z.x * a * p.c} ${O.y + Z.y * a * p.c}`).join(' ');
  const ticks = pts.filter((_, i) => i % 6 === 3);

  return (
    <WidgetFrame
      title="คลื่นแม่เหล็กไฟฟ้าระนาบ"
      notice="$\vec E$ (แนว $y$) กับ $\vec B$ (แนว $z$) ขึ้นลงพร้อมกัน ตั้งฉากกันเอง และตั้งฉากกับทิศที่คลื่นวิ่ง ($x$) ลองเพิ่ม $E_{max}$: $B_{max}=E_{max}/c$ เพิ่มตาม และความเข้ม $I$ เพิ่มเป็น **กำลังสอง**"
      onReset={() => {
        setE(init.E);
        setLam(init.lamNm);
        setPlay(init.play);
        setPhase(0);
      }}
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="stage pan-y">
        {/* axes */}
        <Arrow x1={O.x - 10} y1={O.y} x2={O.x + LEN + 14} y2={O.y} cls="muted" w={1.2} head={7} />
        <text x={O.x + LEN + 8} y={O.y + 16} className="small mut">x</text>
        <Arrow x1={O.x} y1={O.y + 4} x2={O.x} y2={O.y - AMP - 18} cls="muted" w={1.2} head={7} />
        <text x={O.x + 5} y={O.y - AMP - 12} className="small mut">y</text>
        <Arrow x1={O.x} y1={O.y} x2={O.x + Z.x * 70} y2={O.y + Z.y * 70} cls="muted" w={1.2} head={7} />
        <text x={O.x + Z.x * 70 - 4} y={O.y + Z.y * 70 + 14} className="small mut">z</text>
        {/* field arrows from the axis, then the two curves */}
        {ticks.map((p) => (
          <g key={p.x}>
            <Arrow x1={p.x} y1={O.y} x2={p.x} y2={O.y - a * p.c} cls="field" w={1.5} head={5} opacity={0.75} />
            <Arrow x1={p.x} y1={O.y} x2={p.x + Z.x * a * p.c} y2={O.y + Z.y * a * p.c} cls="bfield" w={1.5} head={5} opacity={0.75} />
          </g>
        ))}
        <path d={ePath} className="f-none s-field" strokeWidth={2.2} />
        <path d={bPath} className="f-none s-bfield" strokeWidth={2.2} />
        {/* propagation arrow */}
        <Arrow x1={210} y1={22} x2={290} y2={22} cls="accent" w={3} head={9} />
        <text x={250} y={14} textAnchor="middle" className="small" style={{ fontWeight: 700 }}>c</text>
        <text x={8} y={18} className="small" style={{ fill: 'var(--field)', fontWeight: 700 }}>E</text>
        <text x={22} y={18} className="small" style={{ fill: 'var(--bfield)', fontWeight: 700 }}>B</text>
      </svg>
      <div className="controls">
        <div className="seg">
          <Toggle on={play} label="เล่น" onChange={setPlay} />
        </div>
        <Slider label="แอมพลิจูด $E_{max}$" value={E} min={20} max={200} step={10} onChange={setE} show={`${E} V/m`} />
        <Slider label="ความยาวคลื่น $\lambda$" value={lamNm} min={400} max={700} step={4} onChange={setLam} show={`${lamNm} nm`} />
      </div>
      <div className="readouts">
        <Readout k="$B_{max}=E_{max}/c$" v={fmtSI(B, 'T')} hl />
        <Readout k="$k=2\pi/\lambda$" v={`${fmt(k)} m⁻¹`} />
        <Readout k="$f=c/\lambda$" v={`${fmt(f)} Hz`} />
        <Readout k="$\omega=ck$" v={`${fmt(omegaFromK(k))} rad/s`} />
        <Readout k="$I=E_{max}^2/2\mu_0c$" v={`${fmt(I)} W/m²`} />
      </div>
      <p className="small">
        <T>{r`ภาพวาด $B$ ขยายให้เห็น ขนาดจริง (เป็นเทสลา) คือ $E$ หารด้วย $c=3\times10^8$`}</T>
      </p>
    </WidgetFrame>
  );
}
