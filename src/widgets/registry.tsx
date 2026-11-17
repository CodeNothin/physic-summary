// =====================================================================
// The widget registry: a plain object from id → { title, component }.
// widgets/all.ts fills it in. <W id="..." /> looks a widget up and shows
// it, or a grey placeholder if the id is unknown (handy while building).
// =====================================================================
import type { ComponentType } from 'react';

export interface WidgetInfo {
  title: string;
  C: ComponentType;
}

/** id → widget. Filled in as widgets are built. */
export const widgets: Record<string, WidgetInfo> = {};

export function W({ id }: { id: string }) {
  const w = widgets[id];
  if (!w) return <div className="widget small">(กำลังสร้าง widget: {id})</div>;
  return <w.C />;
}
