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
