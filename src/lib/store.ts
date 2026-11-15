// Progress lives in localStorage only (one versioned key).
import { useSyncExternalStore } from 'react';

export interface SkillStat {
  correct: number;
  total: number;
}

export interface ExamResult {
  at: number;
  score: number;
  total: number;
  seconds: number;
}

export interface State {
  theme: 'light' | 'dark' | null;
  done: Record<string, boolean>;
  skills: Record<string, SkillStat>;
  exams: ExamResult[];
}

const KEY = 'physicweb:v1';
const empty: State = { theme: null, done: {}, skills: {}, exams: [] };

function load(): State {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...empty, ...(JSON.parse(raw) as Partial<State>) };
  } catch {
    // private mode or corrupted data: start fresh
  }
  return empty;
}

let state: State = load();
const listeners = new Set<() => void>();

export function update(fn: (s: State) => State): void {
  state = fn(state);
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // storage unavailable: keep the in-memory state
  }
  listeners.forEach((l) => l());
}

export function useStore(): State {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => state,
  );
}

export const toggleDone = (id: string) =>
  update((s) => ({ ...s, done: { ...s.done, [id]: !s.done[id] } }));

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

export const recordExam = (r: ExamResult) =>
  update((s) => ({ ...s, exams: [...s.exams, r].slice(-20) }));

export const resetProgress = () => update((s) => ({ ...empty, theme: s.theme }));

export function effectiveTheme(s: State): 'light' | 'dark' {
  if (s.theme) return s.theme;
  return typeof matchMedia !== 'undefined' && matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

export const setTheme = (theme: 'light' | 'dark') => update((s) => ({ ...s, theme }));
