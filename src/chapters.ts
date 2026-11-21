// =====================================================================
// The list of chapters for the semester.
//
// This is the ONE place to register a chapter. The home page, the
// "บทเรียน" tab, the progress bars and the page router all read it.
//
// To add a chapter later:
//   1. write src/pages/<Name>Page.tsx exporting the page component
//      and a `<name>Sections` list (copy MagnetismPage.tsx as a template),
//   2. import both here and fill in `Page` and `sections`,
//   3. change its `status` from 'soon' to 'ready'.
// The chapter's URL is  #/<id>  (for example #/magnetism).
// =====================================================================
import type { ComponentType } from 'react';
import { FaradayPage, faradaySections } from './pages/FaradayPage';
import { GaussPage, gaussSections } from './pages/GaussPage';
import { EMWavePage, emwaveSections } from './pages/EMWavePage';
import { MagnetismPage, magnetismSections } from './pages/MagnetismPage';
import { PotentialPage, potentialSections } from './pages/PotentialPage';

/** One section inside a chapter page; `id` is also the "เข้าใจแล้ว" progress key. */
export interface SectionInfo {
  id: string;
  label: string;
}

export interface Chapter {
  /** used in the URL (#/id) — never change it once published, or bookmarks break */
  id: string;
  /** chapter number in the course */
  num: number;
  /** Thai title shown on the site */
  title: string;
  /** English title from the slides */
  en: string;
  /** short list of what is inside, for the home page card */
  blurb: string;
  icon: string;
  status: 'ready' | 'soon';
  sections: SectionInfo[];
  Page?: ComponentType;
}

export const chapters: Chapter[] = [
  {
    id: 'gauss',
    num: 1,
    title: 'กฎของเกาส์',
    en: "Gauss' law for electric field",
    blurb: 'ฟลักซ์ · ผิวเกาส์ · ทรงกลม · แผ่นประจุ · ตัวนำ',
    icon: '⚡',
    status: 'ready',
    sections: gaussSections,
    Page: GaussPage,
  },
  {
    id: 'potential',
    num: 2,
    title: 'ศักย์ไฟฟ้า',
    en: 'Electric Potential',
    blurb: 'ความต่างศักย์ · จุดประจุ · หา E จาก V · ตัวนำ',
    icon: '⛰️',
    status: 'ready',
    sections: potentialSections,
    Page: PotentialPage,
  },
  {
    id: 'magnetism',
    num: 3,
    title: 'กฎของบิโอต์–ซาวาร์ต และกฎของแอมแปร์',
    en: "Biot-Savart Law and Ampere's Law",
    blurb: 'แรงแม่เหล็ก · แรงบนลวด · บิโอต์–ซาวาร์ต · แอมแปร์ · โซลีนอยด์',
    icon: '🧲',
    status: 'ready',
    sections: magnetismSections,
    Page: MagnetismPage,
  },
  {
    id: 'faraday',
    num: 4,
    title: 'กฎของฟาราเดย์และความเหนี่ยวนำ',
    en: "Faraday's Law and Inductance",
    blurb: 'ฟลักซ์แม่เหล็ก · เลนซ์ · Bℓv · ความเหนี่ยวนำ · วงจร RL',
    icon: '🔁',
    status: 'ready',
    sections: faradaySections,
    Page: FaradayPage,
  },
  {
    id: 'emwave',
    num: 5,
    title: 'คลื่นแม่เหล็กไฟฟ้า',
    en: 'Electromagnetic waves',
    blurb: 'แมกซ์เวลล์ · E/B = c · สเปกตรัม · พอยน์ติง · ความดันรังสี',
    icon: '📡',
    status: 'ready',
    sections: emwaveSections,
    Page: EMWavePage,
  },
  // ---- not written yet: shown greyed out on the home page
  { id: 'light', num: 6, title: 'แสง', en: 'Light', blurb: '', icon: '💡', status: 'soon', sections: [] },
  { id: 'modern1', num: 7, title: 'ฟิสิกส์ยุคใหม่ 1', en: 'Modern physics 1', blurb: '', icon: '⚛️', status: 'soon', sections: [] },
  { id: 'modern2', num: 8, title: 'ฟิสิกส์ยุคใหม่ 2', en: 'Modern physics 2', blurb: '', icon: '🔬', status: 'soon', sections: [] },
  { id: 'nuclear', num: 9, title: 'ฟิสิกส์นิวเคลียร์', en: 'Nuclear', blurb: '', icon: '☢️', status: 'soon', sections: [] },
];

export const readyChapters = chapters.filter((c) => c.status === 'ready');

export const chapterById = (id: string | null | undefined) => chapters.find((c) => c.id === id);
