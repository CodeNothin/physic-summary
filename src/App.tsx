// =====================================================================
// The app shell: top bar, page router and bottom tab bar.
//
// ROUTING. The page is chosen by the part of the URL after "#":
//   #/                     → home (chapter list)
//   #/learn                → the chapter the user opened last
//   #/<chapterId>          → a chapter page, e.g. #/gauss
//   #/<chapterId>/<sec>    → same page, scrolled to that section
//   #/practice             → short practice questions
//   #/practice/ws25        → same, drilling only the pieces of worksheet Q25
//   #/exam                 → ตัวอย่างข้อสอบ: worksheet Q21–40 in full form
//   #/exam/25, #/exam/mock → one worksheet question; a 6-question mock exam
//   #/cheat                → formula sheet (mirrors the official exam sheet)
//   #/w/<widgetId>         → one widget on its own (handy for testing/sharing)
// A "#" URL never reloads the page and works on GitHub Pages without
// any server setup, which is why it is used instead of normal paths.
// =====================================================================
import { useEffect, useState } from 'react';
import { chapterById, readyChapters } from './chapters';
import type { SectionInfo } from './chapters';
import { effectiveTheme, setLastChapter, setTheme, useStore } from './lib/store';
import { CheatPage } from './pages/CheatPage';
import { HomePage } from './pages/HomePage';
import { PracticePage } from './practice/PracticePage';
import { ExamPage } from './worksheet/ExamPage';
import { W, widgets } from './widgets/registry';

/** Splits "#/gauss/flux" into ["gauss", "flux"] and re-renders when the hash changes. */
function useRoute(): string[] {
  const read = () => window.location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  const [route, setRoute] = useState(read);
  useEffect(() => {
    const on = () => setRoute(read());
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return route;
}

/** Bottom tab bar. `match` decides which tab is highlighted for the current page. */
const tabs: { href: string; ico: string; label: string; match: (page: string) => boolean }[] = [
  { href: '#/', ico: '🏠', label: 'หน้าแรก', match: (p) => p === '' },
  { href: '#/learn', ico: '📖', label: 'บทเรียน', match: (p) => p === 'learn' || !!chapterById(p) },
  { href: '#/practice', ico: '✏️', label: 'ฝึกโจทย์(สั้น)', match: (p) => p === 'practice' },
  { href: '#/exam', ico: '📝', label: 'ตัวอย่างข้อสอบ', match: (p) => p === 'exam' },
  { href: '#/cheat', ico: '📋', label: 'สูตร', match: (p) => p === 'cheat' },
];

/** The row of section chips at the top of a chapter page (ticked ones turn green). */
function Chips({ page, items }: { page: string; items: SectionInfo[] }) {
  const done = useStore().done;
  return (
    <nav className="chips" aria-label="หัวข้อในหน้านี้">
      {items.map((s) => (
        <a key={s.id} className={`chip${done[s.id] ? ' done' : ''}`} href={`#/${page}/${s.id}`}>
          {done[s.id] ? '✓ ' : ''}
          {s.label}
        </a>
      ))}
    </nav>
  );
}

export function App() {
  let [page = '', sub] = useRoute();
  const store = useStore();
  const theme = effectiveTheme(store);

  // "#/learn" means: the last chapter opened, or the first chapter if none yet.
  if (page === 'learn') page = chapterById(store.lastChapter)?.id ?? readyChapters[0].id;
  const chapter = chapterById(page);

  // Put the theme on <html data-theme="..."> so styles.css can switch colours.
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  // Remember the chapter for the "บทเรียน" tab.
  useEffect(() => {
    if (chapter?.status === 'ready') setLastChapter(chapter.id);
  }, [chapter]);

  // Scroll to the section named in the URL, or to the top when the page changes.
  useEffect(() => {
    const el = sub ? document.getElementById(`sec-${sub}`) : null;
    if (el) el.scrollIntoView({ block: 'start' });
    else window.scrollTo(0, 0);
  }, [page, sub]);

  let body;
  if (chapter?.Page) {
    body = (
      <>
        <p className="eyebrow" style={{ marginBottom: 4 }}>
          บทที่ {chapter.num} · {chapter.en}
        </p>
        <Chips page={chapter.id} items={chapter.sections} />
        <chapter.Page />
      </>
    );
  } else if (page === 'practice') body = <PracticePage key={sub ?? ''} sub={sub} />;
  else if (page === 'exam') body = <ExamPage sub={sub} />;
  else if (page === 'cheat') body = <CheatPage />;
  else if (page === 'w') {
    // single-widget view: a chip per widget, then the chosen one
    body = (
      <>
        <nav className="chips">
          {Object.entries(widgets).map(([id, w]) => (
            <a key={id} className="chip" href={`#/w/${id}`}>
              {w.title}
            </a>
          ))}
        </nav>
        {sub && <W id={sub} />}
      </>
    );
  } else body = <HomePage />;

  return (
    <div className="app">
      <header className="topbar">
        <span className="brand">2304121 · สรุปฟิสิกส์</span>
        <button
          className="icon-btn"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          aria-label="สลับโหมดสว่าง/มืด"
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </header>
      <main>{body}</main>
      <nav className="tabbar" aria-label="เมนูหลัก">
        {tabs.map((t) => (
          <a key={t.href} href={t.href} className={t.match(page) ? 'on' : ''}>
            <span className="ico">{t.ico}</span>
            {t.label}
          </a>
        ))}
      </nav>
    </div>
  );
}
