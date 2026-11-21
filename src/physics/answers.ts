// Parsing and checking of typed numeric answers. Pure, no UI.

const PREFIX: Record<string, number> = {
  p: 1e-12,
  n: 1e-9,
  'μ': 1e-6,
  'µ': 1e-6,
  u: 1e-6,
  m: 1e-3,
  c: 1e-2,
  k: 1e3,
  M: 1e6,
};

/** Base units we understand, in canonical spelling. */
const BASE_UNITS = ['N·m²/C', 'N/C', 'V/m', 'C/m²', 'C', 'V', 'J', 'm'] as const;
export type BaseUnit = (typeof BASE_UNITS)[number] | '';

function canonUnit(raw: string): string {
  return raw
    .replace(/\s+/g, '')
    .replace(/\^?2/g, '²')
    .replace(/[.*]/g, '·')
    .replace(/^Nm²\/C$/, 'N·m²/C');
}

export interface ParsedUnit {
  base: BaseUnit;
  factor: number;
}

/** "μC" → {base:'C', factor:1e-6}. Returns null for unknown units. */
export function parseUnit(raw: string): ParsedUnit | null {
  const u = canonUnit(raw);
  if (u === '') return { base: '', factor: 1 };
  for (const b of BASE_UNITS) if (u === b) return { base: b, factor: 1 };
  const p = PREFIX[u[0]];
  if (p !== undefined) {
    const rest = u.slice(1);
    for (const b of BASE_UNITS) if (rest === b) return { base: b, factor: p };
  }
  return null;
}

/** Parses "1.84e6", "1.84×10^6", "1.84x10^-6", "-9", "2,5". Returns NaN if it is not a number. */
export function parseNumber(raw: string): number {
  let s = raw.trim().replace(/\s+/g, '').replace(/−/g, '-').replace(/,/g, '.');
  if (s === '') return NaN;
  const sup: Record<string, string> = {
    '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5',
    '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9', '⁻': '-', '⁺': '+',
  };
  s = s.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁻⁺]+/g, (m) => '^' + [...m].map((ch) => sup[ch]).join(''));
  // a×10^b, a*10^b, ax10^b, 10^b
  const m = s.match(/^([+-]?[\d.]*)(?:[×x*])?10\^\(?([+-]?\d+)\)?$/i);
  if (m) {
    const mant = m[1] === '' || m[1] === '+' ? 1 : m[1] === '-' ? -1 : Number(m[1]);
    return mant * 10 ** Number(m[2]);
  }
  // simple fraction a/b
  const f = s.match(/^([+-]?[\d.]+)\/([\d.]+)$/);
  if (f) return Number(f[1]) / Number(f[2]);
  if (!/^[+-]?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?$/i.test(s)) return NaN;
  return Number(s);
}

export interface ParsedAnswer {
  /** Value converted to the SI base unit. */
  value: number;
  base: BaseUnit;
}

/** Parses a number with an optional unit, e.g. "2.7e-5 J" or "-5 μC". */
export function parseAnswer(text: string): ParsedAnswer | null {
  const t = text.trim();
  const m = t.match(/^(.*?[\d.)⁰¹²³⁴⁵⁶⁷⁸⁹])\s*([A-Za-zμµ][A-Za-zμµ·.*/²^2\s]*)?$/);
  if (!m) return null;
  const value = parseNumber(m[1]);
  if (Number.isNaN(value)) return null;
  const unit = parseUnit(m[2] ?? '');
  if (!unit) return null;
  return { value: value * unit.factor, base: unit.base };
}

export type Verdict =
  | { kind: 'correct' }
  | { kind: 'sign' }
  | { kind: 'power10'; exponent: number }
  | { kind: 'mistake'; id: string }
  | { kind: 'wrong' };

export interface KnownMistake {
  /** Stable id; the UI maps it to a Thai message. */
  id: string;
  /** The (wrong) value this mistake produces, in SI. */
  value: number;
}

const TOL = 0.02;

/**
 * True when `given` matches `target`: within 2 %, OR exactly `target`
 * rounded to 2 significant figures. The second rule is for answers
 * like 2.25 → "2.3" (the worksheet rounds this way), which is 2.2 % off.
 */
function close(given: number, target: number, scale: number): boolean {
  if (target === 0) return Math.abs(given) <= 1e-9 * scale;
  if (Math.abs(given - target) <= TOL * Math.abs(target)) return true;
  const twoSig = Number(target.toPrecision(2));
  return Math.abs(given - twoSig) <= 1e-9 * Math.abs(target);
}

/**
 * Compares an answer with the expected value (both SI).
 * Order: correct → a known mistake of this question → sign → power of ten → wrong.
 * `scale` is a typical magnitude, used only when the expected answer is exactly 0.
 */
export function checkAnswer(
  given: number,
  expected: number,
  mistakes: KnownMistake[] = [],
  scale = 1,
): Verdict {
  if (close(given, expected, scale)) return { kind: 'correct' };
  for (const m of mistakes) {
    if (close(m.value, expected, scale)) continue; // not a mistake for these numbers
    if (close(given, m.value, scale)) return { kind: 'mistake', id: m.id };
  }
  if (expected === 0 || given === 0) return { kind: 'wrong' };
  if (close(given, -expected, scale)) return { kind: 'sign' };
  const ratio = Math.abs(given / expected);
  const exponent = Math.round(Math.log10(ratio));
  if (given / expected > 0 && exponent !== 0 && Math.abs(ratio / 10 ** exponent - 1) <= TOL) {
    return { kind: 'power10', exponent };
  }
  return { kind: 'wrong' };
}
