// =====================================================================
// Widget: the electromagnetic spectrum (slides 10–11).
//
// One slider moves along the frequency on a log scale (10³ to 10²² Hz).
// The widget names the band (src/physics/emwave.ts, `bands`) and gives
// the wavelength λ = c/f. Every band is the same kind of wave with the
// same speed c; only f and λ differ.
// =====================================================================
import { useState } from 'react';
import { Readout, Slider, WidgetFrame } from '../components/ui';
import { fmt, fmtSI } from '../lib/format';
import { bandOf, bands, frequencyFromWavelength } from '../physics';

const LO = 3; // log10 of the lowest frequency on the bar
const HI = 22; // log10 of the highest
const X0 = 12;
const BAR = 296; // bar width in px

/** Screen x of a frequency on the log bar. */
const xOf = (f: number) => X0 + (BAR * (Math.log10(f) - LO)) / (HI - LO);

/** A fill colour per band; the visible band gets a rainbow gradient. */
const colour: Record<string, string> = {
  radio: 'var(--muted)',
  microwave: 'var(--metal)',
  infrared: 'var(--pos)', // red side, below visible red
  visible: 'url(#rainbow)',
  ultraviolet: '#7a4fd0', // violet side, above visible violet
  'X-ray': 'var(--accent)',
  'gamma ray': 'var(--ink)',
};

const init = { logf: 14.7 };

export function Spectrum() {
  const [logf, setLogf] = useState(init.logf);
  const f = 10 ** logf;
  const lam = frequencyFromWavelength(f); // c/f works both ways: λ = c/f
  const band = bandOf(f);

  return (
    <WidgetFrame
      title="สเปกตรัมคลื่นแม่เหล็กไฟฟ้า"
      notice="ทุกช่วงคือคลื่นชนิดเดียวกัน วิ่งด้วย $c$ เท่ากัน ต่างกันแค่ $f$ และ $\lambda=c/f$ ความถี่สูงขึ้น 10 เท่า ความยาวคลื่นสั้นลง 10 เท่า แสงที่ตามองเห็นเป็นช่วงแคบ ๆ แค่ประมาณ 400–700 nm"
      onReset={() => setLogf(init.logf)}
    >
      <svg viewBox="0 0 320 96" className="stage pan-y">
        <defs>
          <linearGradient id="rainbow" x1="0" x2="1">
            <stop offset="0" stopColor="#d33" />
            <stop offset="0.33" stopColor="#ec2" />
            <stop offset="0.6" stopColor="#3b5" />
            <stop offset="1" stopColor="#64d" />
          </linearGradient>
        </defs>
        {bands.map((b) => {
          const x1 = xOf(Math.max(b.fMin, 10 ** LO));
          const x2 = xOf(Math.min(b.fMax, 10 ** HI));
          return <rect key={b.en} x={x1} y={30} width={Math.max(2, x2 - x1)} height={26} style={{ fill: colour[b.en] }} opacity={b === band ? 1 : 0.45} />;
        })}
        {/* marker */}
        <line x1={xOf(f)} y1={22} x2={xOf(f)} y2={64} className="s-ink" strokeWidth={2.5} />
        <polygon points={`${xOf(f)},22 ${xOf(f) - 6},12 ${xOf(f) + 6},12`} className="f-ink" />
        {[3, 6, 9, 12, 15, 18, 21].map((p) => (
          <text key={p} x={xOf(10 ** p)} y={78} textAnchor="middle" className="small mut">
            10{sup(p)}
          </text>
        ))}
        <text x={X0} y={92} className="small mut">f (Hz) ความถี่ต่ำ ← → ความถี่สูง</text>
      </svg>
      <div className="controls">
        <Slider label="ความถี่ $f$" value={logf} min={LO} max={HI} step={0.05} onChange={setLogf} show={`${fmt(f)} Hz`} />
      </div>
      <div className="readouts">
        <Readout k="ช่วงคลื่น" v={`${band.name} (${band.en})`} hl />
        <Readout k="$\lambda=c/f$" v={fmtSI(lam, 'm')} />
      </div>
    </WidgetFrame>
  );
}

/** Superscript digits for the axis labels. */
function sup(n: number): string {
  const s = '⁰¹²³⁴⁵⁶⁷⁸⁹';
  return String(n)
    .split('')
    .map((d) => s[Number(d)])
    .join('');
}
