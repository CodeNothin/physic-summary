// =====================================================================
// Small building blocks shared by every page and widget:
//   Tex / M / T       math: inline, display, and text with $...$ inside
//   P / Li / Note     a paragraph, list item, or yellow note (text may use $...$)
//   Analogy / Worked  a "picture it like this" box and a fold-out worked example
//   Section           one card on a chapter page, with the "เข้าใจแล้ว" button
//   WidgetFrame       the blue box around every widget (title, notice, reset)
//   Slider / Seg / Toggle / Readout   widget controls and number read-outs
//   Arrow / ChargeDot / OutIn         SVG drawing helpers
// Colours come from CSS classes in styles.css (s-<name> = stroke, f-<name> = fill).
// =====================================================================
import katex from 'katex';
import { Fragment, memo } from 'react';
import type { ReactNode } from 'react';
import { toggleDone, useStore } from '../lib/store';

/** Shorthand for raw TeX strings: r`\frac{a}{b}` */
export const r = String.raw;

function render(texSrc: string, display: boolean): string {
  return katex.renderToString(texSrc, { displayMode: display, throwOnError: false, strict: false });
}

/** Inline math. */
export const Tex = memo(function Tex({ children }: { children: string }) {
  return <span dangerouslySetInnerHTML={{ __html: render(children, false) }} />;
});

/** Display math, scrolls sideways on narrow screens instead of overflowing the page. */
export const M = memo(function M({ children }: { children: string }) {
  // wide "a ⇒ b" formulas are stacked on separate lines so they fit a phone screen
  let src = children;
  if (src.includes(r`\qquad`)) {
    const lines = src.replace(/\\qquad\\Rightarrow\\qquad/g, r`\\[4pt] \Rightarrow\ `).replace(/(\\qquad)+/g, r`\\[4pt] `);
    src = r`\begin{gathered}${lines}\end{gathered}`;
  }
  return <div className="math-block" dangerouslySetInnerHTML={{ __html: render(src, true) }} />;
});

/** Text with inline $math$ and **bold**. */
export function T({ children }: { children: string }) {
  // Split the text into pieces: "$...$" (math), "**...**" (bold), and plain text.
  // The brackets in the pattern keep the matched pieces in the result.
  const bits = children.split(/(\$[^$]+\$|\*\*[^*]+\*\*)/g);
  return (
    <>
      {bits.map((b, i) =>
        b.startsWith('$') && b.endsWith('$') && b.length > 1 ? (
          <Tex key={i}>{b.slice(1, -1)}</Tex>
        ) : b.startsWith('**') ? (
          <b key={i}>{b.slice(2, -2)}</b>
        ) : (
          <Fragment key={i}>{b}</Fragment>
        ),
      )}
    </>
  );
}

export const P = ({ children }: { children: string }) => (
  <p>
    <T>{children}</T>
  </p>
);

export const Li = ({ children }: { children: string }) => (
  <li>
    <T>{children}</T>
  </li>
);

export function Analogy({ tag = 'นึกภาพแบบ Minecraft', children }: { tag?: string; children: ReactNode }) {
  return (
    <aside className="analogy">
      <p className="tag">{tag}</p>
      {children}
    </aside>
  );
}

export function Worked({ title, children }: { title: string; children: ReactNode }) {
  return (
    <details className="worked">
      <summary>{title}</summary>
      <div style={{ marginTop: 8 }}>{children}</div>
    </details>
  );
}

export const Note = ({ children }: { children: string }) => (
  <p className="note">
    <T>{children}</T>
  </p>
);

export function Section({
  id,
  eyebrow,
  title,
  en,
  children,
}: {
  id: string;
  eyebrow?: string;
  title: string;
  en?: string;
  children: ReactNode;
}) {
  const done = !!useStore().done[id];
  return (
    <section className="card section" id={`sec-${id}`}>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <div className="section-head">
        <h2>
          {title} {en && <span className="th-en">({en})</span>}
        </h2>
        <button
          className={`done-btn${done ? ' on' : ''}`}
          onClick={() => toggleDone(id)}
          aria-pressed={done}
        >
          {done ? '✓ เข้าใจแล้ว' : 'เข้าใจแล้ว?'}
        </button>
      </div>
      {children}
    </section>
  );
}

// ------------------------------------------------------------ widget kit

export function WidgetFrame({
  title,
  notice,
  onReset,
  children,
}: {
  title: string;
  notice: string;
  onReset: () => void;
  children: ReactNode;
}) {
  return (
    <div className="widget">
      <div className="widget-head">
        <span className="widget-title">{title}</span>
        <button className="reset-btn" onClick={onReset}>
          ↺ รีเซ็ต
        </button>
      </div>
      <p className="notice">
        <b>ลองสังเกต:</b> <T>{notice}</T>
      </p>
      {children}
    </div>
  );
}

export function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  show,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  show: string;
}) {
  return (
    <div className="slider">
      <label>
        <span>
          <T>{label}</T>
        </span>
        <b>{show}</b>
      </label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={label.replace(/\$/g, '')}
      />
    </div>
  );
}

export function Seg<V extends string>({
  value,
  options,
  onChange,
}: {
  value: V;
  options: { value: V; label: string }[];
  onChange: (v: V) => void;
}) {
  return (
    <div className="seg" role="group">
      {options.map((o) => (
        <button
          key={o.value}
          className={o.value === value ? 'on' : ''}
          aria-pressed={o.value === value}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Toggle({
  on,
  label,
  onChange,
}: {
  on: boolean;
  label: string;
  onChange: (v: boolean) => void;
}) {
  return (
    <button className={on ? 'on' : ''} aria-pressed={on} onClick={() => onChange(!on)}>
      {on ? '☑' : '☐'} {label}
    </button>
  );
}

export function Readout({ k, v, hl }: { k: string; v: ReactNode; hl?: boolean }) {
  return (
    <div className={`readout${hl ? ' hl' : ''}`}>
      <div className="k">
        <T>{k}</T>
      </div>
      <div className="v">{v}</div>
    </div>
  );
}

/** Arrow from (x1,y1) to (x2,y2) drawn with currentColor-free classes. */
export function Arrow({
  x1,
  y1,
  x2,
  y2,
  cls = 'field',
  w = 2,
  head = 7,
  opacity = 1,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  cls?: string;
  w?: number;
  head?: number;
  opacity?: number;
}) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy);
  if (len < 0.5) return null;
  const ux = dx / len;
  const uy = dy / len;
  const h = Math.min(head, len * 0.6);
  const bx = x2 - ux * h;
  const by = y2 - uy * h;
  const px = -uy * h * 0.5;
  const py = ux * h * 0.5;
  return (
    <g opacity={opacity}>
      <line x1={x1} y1={y1} x2={bx} y2={by} className={`s-${cls}`} strokeWidth={w} strokeLinecap="round" />
      <polygon points={`${x2},${y2} ${bx + px},${by + py} ${bx - px},${by - py}`} className={`f-${cls}`} />
    </g>
  );
}

/** A charge drawn as a disc with its sign. */
export function ChargeDot({ x, y, q, rad = 11 }: { x: number; y: number; q: number; rad?: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r={rad} className={q >= 0 ? 'f-pos' : 'f-neg'} />
      <text x={x} y={y + 4.5} textAnchor="middle" style={{ fill: '#fff', fontWeight: 700, fontSize: 14 }}>
        {q >= 0 ? '+' : '−'}
      </text>
    </g>
  );
}

/**
 * Field or current pointing straight out of (⊙) or into (⊗) the page.
 * `out` = true draws a dot (you see the arrow's tip),
 * `out` = false draws a cross (you see the arrow's tail feathers).
 * `cls` picks the colour class, e.g. "bfield" or "cur".
 */
export function OutIn({
  x,
  y,
  out,
  size = 7,
  cls = 'bfield',
  opacity = 1,
}: {
  x: number;
  y: number;
  out: boolean;
  size?: number;
  cls?: string;
  opacity?: number;
}) {
  const d = size * 0.6;
  return (
    <g opacity={opacity}>
      <circle cx={x} cy={y} r={size} className={`f-none s-${cls}`} strokeWidth={1.5} />
      {out ? (
        <circle cx={x} cy={y} r={size * 0.32} className={`f-${cls}`} />
      ) : (
        <path d={`M${x - d} ${y - d}L${x + d} ${y + d}M${x + d} ${y - d}L${x - d} ${y + d}`} className={`s-${cls}`} strokeWidth={1.5} />
      )}
    </g>
  );
}
