import { useEffect, useState } from 'react';
import { effectiveTheme, setTheme, useStore } from './lib/store';
import { CheatPage } from './pages/CheatPage';
import { GaussPage, gaussSections } from './pages/GaussPage';
import { HomePage } from './pages/HomePage';
import { PotentialPage, potentialSections } from './pages/PotentialPage';
import { PracticePage } from './practice/PracticePage';
import { W, widgets } from './widgets/registry';

// Hash routing (#/page/section) so the site works on any GitHub Pages path.
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

const tabs = [
  { id: '', ico: '🏠', label: 'หน้าแรก' },
  { id: 'gauss', ico: '⚡', label: 'เกาส์' },
  { id: 'potential', ico: '⛰️', label: 'ศักย์ไฟฟ้า' },
  { id: 'practice', ico: '✏️', label: 'ฝึกโจทย์' },
  { id: 'cheat', ico: '📋', label: 'สรุปสูตร' },
];

function Chips({ page, items }: { page: string; items: { id: string; label: string }[] }) {
  const done = useStore().done;
  return (
    <nav className="chips" aria-label="หัวข้อในหน้านี้">
      {items.map((s) => (
        <a
          key={s.id}
          className={`chip${done[s.id] ? ' done' : ''}`}
          href={`#/${page}/${s.id}`}
          style={{ textDecoration: 'none', color: 'inherit' }}
        >
          {done[s.id] ? '✓ ' : ''}
          {s.label}
        </a>
      ))}
    </nav>
  );
}

export function App() {
  const [page = '', sub] = useRoute();
  const store = useStore();
  const theme = effectiveTheme(store);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  // scroll to the section named in the hash, or to the top on a page change
  useEffect(() => {
    const el = sub ? document.getElementById(`sec-${sub}`) : null;
    if (el) el.scrollIntoView({ block: 'start' });
    else window.scrollTo(0, 0);
  }, [page, sub]);

  let body;
  if (page === 'gauss') {
    body = (
      <>
        <Chips page="gauss" items={gaussSections} />
        <GaussPage />
      </>
    );
  } else if (page === 'potential') {
    body = (
      <>
        <Chips page="potential" items={potentialSections} />
        <PotentialPage />
      </>
    );
  } else if (page === 'practice') body = <PracticePage />;
  else if (page === 'cheat') body = <CheatPage />;
  else if (page === 'w') {
    // single-widget view, handy for sharing a link to one widget
    body = (
      <>
        <nav className="chips">
          {Object.entries(widgets).map(([id, w]) => (
            <a key={id} className="chip" href={`#/w/${id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
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
        <span className="brand">2304121 · เกาส์ & ศักย์ไฟฟ้า</span>
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
          <a key={t.id} href={`#/${t.id}`} className={page === t.id ? 'on' : ''}>
            <span className="ico">{t.ico}</span>
            {t.label}
          </a>
        ))}
      </nav>
    </div>
  );
}
