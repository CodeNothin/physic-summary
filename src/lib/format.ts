// Number formatting shared by widgets and practice.

const SUP: Record<string, string> = {
  '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
  '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
};

function parts(x: number, sig: number): { m: string; e: number } {
  const [m, e] = x.toExponential(sig - 1).split('e');
  return { m, e: Number(e) };
}

const isPlain = (x: number) => {
  const a = Math.abs(x);
  return a >= 0.01 && a < 10000;
};

/** Removes float noise, e.g. 0.30000000000000004 → "0.3". */
function plain(x: number, sig: number): string {
  return String(Number(x.toPrecision(sig)));
}

/** "1.84×10⁶", "-9", "0.12" */
export function fmt(x: number, sig = 3): string {
  if (!Number.isFinite(x)) return '—';
  if (x === 0 || Math.abs(x) < 1e-300) return '0';
  if (isPlain(x)) return plain(x, sig);
  const { m, e } = parts(x, sig);
  const exp = [...String(e)].map((c) => SUP[c] ?? c).join('');
  return `${m}×10${exp}`;
}

/** Same, as TeX. */
export function tex(x: number, sig = 3): string {
  if (x === 0) return '0';
  if (isPlain(x)) return plain(x, sig);
  const { m, e } = parts(x, sig);
  return `${m}\\times10^{${e}}`;
}

/** Formats with an SI prefix: fmtSI(4e-6,'C') → "4 μC". */
export function fmtSI(x: number, unit: string, sig = 3): string {
  if (x === 0) return `0 ${unit}`;
  const a = Math.abs(x);
  const table: [number, string][] = [
    [1e6, 'M'], [1e3, 'k'], [1, ''], [1e-3, 'm'], [1e-6, 'μ'], [1e-9, 'n'], [1e-12, 'p'],
  ];
  for (const [f, p] of table) {
    if (a >= f * 0.9995) return `${plain(x / f, sig)} ${p}${unit}`;
  }
  return `${fmt(x, sig)} ${unit}`;
}

export const clamp = (x: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, x));
export const snap = (x: number, step: number) => Math.round(x / step) * step;
