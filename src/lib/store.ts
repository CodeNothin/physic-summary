// =====================================================================
// The site's saved state (progress, scores, theme).
//
// Everything lives in the browser's localStorage under ONE key, so
// nothing leaves the user's device and there is no server.
//
// How components use it:
//   const s = useStore();         // read (re-renders when state changes)
//   toggleDone('flux');           // write through one of the helpers below
//
// To add a new saved field:
//   1. add it to `State` and to `empty` (its default value),
//   2. write a small helper like `setTheme` that calls `update(...)`.
// Old saved data without the new field still loads, because `load()`
// starts from `empty` and copies the saved fields on top.
// =====================================================================
import { useSyncExternalStore } from 'react';

/** How many first attempts at one skill were right. */
export interface SkillStat {
  correct: number;
  total: number;
}

/** One finished timed exam. */
export interface ExamResult {
  /** when it was finished (milliseconds since 1970, from Date.now()) */
  at: number;
  score: number;
  total: number;
  seconds: number;
  /** which exam set (see `examSets` in practice/bank.ts); missing on old saves */
  set?: string;
}

export interface State {
  /** null = follow the phone/computer setting */
  theme: 'light' | 'dark' | null;
  /** section id → "เข้าใจแล้ว" ticked */
  done: Record<string, boolean>;
  /** skill id → accuracy */
  skills: Record<string, SkillStat>;
  /** last 20 timed exams */
  exams: ExamResult[];
  /** chapter id the user last opened, for the "บทเรียน" tab */
  lastChapter: string | null;
}

/** Bump the version number only if the shape changes in a way old data can't fill. */
const KEY = 'physicweb:v1';
const empty: State = { theme: null, done: {}, skills: {}, exams: [], lastChapter: null };

function load(): State {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...empty, ...(JSON.parse(raw) as Partial<State>) };
  } catch {
    // private browsing or corrupted data: start fresh instead of crashing
  }
  return empty;
}

// The current state lives in this module-level variable.
// `listeners` are React's re-render callbacks (one per component using useStore).
let state: State = load();
const listeners = new Set<() => void>();

/** Replace the state with fn(old state), save it, and re-render every reader. */
export function update(fn: (s: State) => State): void {
  state = fn(state);
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // storage full or blocked: the site keeps working, it just won't remember
  }
  listeners.forEach((l) => l());
}

/** React hook: the current state. Components re-render whenever `update` runs. */
export function useStore(): State {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => state,
  );
}

// ------------------------------------------------------------ helpers

export const toggleDone = (id: string) =>
  update((s) => ({ ...s, done: { ...s.done, [id]: !s.done[id] } }));

/** Count one first attempt at a skill (correct or not). */
export const recordAttempt = (skill: string, correct: boolean) =>
  update((s) => {
    const cur = s.skills[skill] ?? { correct: 0, total: 0 };
    return {
      ...s,
      skills: {
        ...s.skills,
        [skill]: { correct: cur.correct + (correct ? 1 : 0), total: cur.total + 1 },
      },
    };
  });

/** Save a finished exam, keeping only the last 20. */
export const recordExam = (r: ExamResult) =>
  update((s) => ({ ...s, exams: [...s.exams, r].slice(-20) }));

/** Wipe progress but keep the chosen theme. */
export const resetProgress = () => update((s) => ({ ...empty, theme: s.theme }));

export const setLastChapter = (id: string) =>
  update((s) => (s.lastChapter === id ? s : { ...s, lastChapter: id }));

/** The theme actually shown: the saved choice, or else the device setting. */
export function effectiveTheme(s: State): 'light' | 'dark' {
  if (s.theme) return s.theme;
  return typeof matchMedia !== 'undefined' && matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

export const setTheme = (theme: 'light' | 'dark') => update((s) => ({ ...s, theme }));
