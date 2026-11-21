// =====================================================================
// Colour of visible light, for the chapter 6 widgets.
// `lambdaColor(nm)` gives a CSS rgb() colour for a wavelength between
// about 380 and 750 nm (a common piecewise-linear approximation; good
// enough for pictures, not for physics). `alpha` dims it, e.g. to draw
// a fringe whose brightness is the intensity.
// =====================================================================

export function lambdaColor(nm: number, alpha = 1): string {
  let r = 0;
  let g = 0;
  let b = 0;
  if (nm < 440) {
    r = (440 - nm) / 60;
    b = 1;
  } else if (nm < 490) {
    g = (nm - 440) / 50;
    b = 1;
  } else if (nm < 510) {
    g = 1;
    b = (510 - nm) / 20;
  } else if (nm < 580) {
    r = (nm - 510) / 70;
    g = 1;
  } else if (nm < 645) {
    r = 1;
    g = (645 - nm) / 65;
  } else {
    r = 1;
  }
  const to = (x: number) => Math.round(255 * Math.max(0, Math.min(1, x)));
  return `rgba(${to(r)},${to(g)},${to(b)},${Math.max(0, Math.min(1, alpha))})`;
}
