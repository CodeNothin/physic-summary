import { useCallback, useRef } from 'react';
import type { PointerEvent as RPointerEvent } from 'react';

export interface SvgPoint {
  x: number;
  y: number;
}

/** Converts a pointer event to the SVG's own viewBox coordinates. */
export function svgPoint(svg: SVGSVGElement, e: { clientX: number; clientY: number }): SvgPoint {
  const ctm = svg.getScreenCTM();
  if (!ctm) return { x: 0, y: 0 };
  const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse());
  return { x: p.x, y: p.y };
}

/**
 * Pointer-based dragging (mouse + touch) inside an SVG.
 * Spread `bind(key)` on each draggable element; `onMove` gets viewBox coordinates.
 */
export function useDrag<K>(onMove: (key: K, p: SvgPoint) => void, onEnd?: (key: K) => void) {
  const active = useRef<K | null>(null);

  const bind = useCallback(
    (key: K) => ({
      onPointerDown: (e: RPointerEvent<SVGElement>) => {
        const svg = e.currentTarget.ownerSVGElement ?? (e.currentTarget as SVGSVGElement);
        active.current = key;
        e.currentTarget.setPointerCapture(e.pointerId);
        onMove(key, svgPoint(svg, e));
        e.preventDefault();
      },
      onPointerMove: (e: RPointerEvent<SVGElement>) => {
        if (active.current === null || active.current !== key) return;
        const svg = e.currentTarget.ownerSVGElement ?? (e.currentTarget as SVGSVGElement);
        onMove(key, svgPoint(svg, e));
      },
      onPointerUp: (e: RPointerEvent<SVGElement>) => {
        if (active.current === null) return;
        active.current = null;
        e.currentTarget.releasePointerCapture(e.pointerId);
        onEnd?.(key);
      },
      onPointerCancel: () => {
        active.current = null;
      },
    }),
    [onMove, onEnd],
  );

  return bind;
}
