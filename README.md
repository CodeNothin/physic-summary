# สรุปฟิสิกส์ · 2304121 — developer guide

An interactive study site in Thai for Chula course 2304121 (Physics for first-year math
majors). It has chapter lessons with touch-draggable widgets, short practice questions,
the worksheet questions 21–40 in exam form, and the formula sheet. The site is mostly
used on phones.

This README is for people **changing the code**. It explains how the site is put
together, where everything lives, and how to do the common jobs (fix text, add a widget,
add a question, add a chapter) without breaking anything.

---

## Contents

1. [Quick start](#1-quick-start)
2. [The big picture](#2-the-big-picture)
3. [Folder map](#3-folder-map)
4. [The rules the code follows](#4-the-rules-the-code-follows)
5. [How each part works](#5-how-each-part-works)
   - [5.1 Routing (URLs)](#51-routing-urls)
   - [5.2 The chapter list](#52-the-chapter-list)
   - [5.3 Chapter pages and the text building blocks](#53-chapter-pages-and-the-text-building-blocks)
   - [5.4 The physics module](#54-the-physics-module)
   - [5.5 Widgets](#55-widgets)
   - [5.6 ฝึกโจทย์(สั้น): short practice questions](#56-ฝึกโจทย์สั้น-short-practice-questions)
   - [5.7 ตัวอย่างข้อสอบ: worksheet questions 21–40](#57-ตัวอย่างข้อสอบ-worksheet-questions-2140)
   - [5.8 Answer checking](#58-answer-checking)
   - [5.9 Saved progress (localStorage)](#59-saved-progress-localstorage)
   - [5.10 Styling, colours and dark mode](#510-styling-colours-and-dark-mode)
   - [5.11 Home page and สูตร tab](#511-home-page-and-สูตร-tab)
6. [Recipes: common changes step by step](#6-recipes-common-changes-step-by-step)
7. [Before you push: checklist](#7-before-you-push-checklist)
8. [Deploying](#8-deploying)
9. [Conventions](#9-conventions)
10. [Open questions and known limits](#10-open-questions-and-known-limits)
11. [Troubleshooting](#11-troubleshooting)

---

## 1. Quick start

You need **Node 20 or newer**. Run these in the project folder:

```bash
npm install
```

```bash
npm run dev
```

Open http://localhost:5173. Saving a file updates the page in about a second, with no
reload needed.

| Command | What it does |
|---|---|
| `npm run dev` | Development server with live reload, on port 5173 |
| `npm run dev -- --host` | Same, also reachable from a phone on the same Wi-Fi (open the "Network" address it prints) |
| `npm run dev -- --port 5174` | Same, on another port (when 5173 is already taken) |
| `npm test` | Runs every test once (physics, practice bank, worksheet questions) |
| `npm run build` | Type-checks, then writes the finished static site to `dist/` |
| `npm run preview` | Serves the built `dist/` locally, to check the real build |

Useful while working:

- `#/w/<id>` shows one widget on its own, for example http://localhost:5173/#/w/solenoid.
  The ids are in `src/widgets/all.ts`.
- To try a phone screen on a computer, use your browser's device toolbar at **360 px wide**.
  That is the narrowest width the site supports.

---

## 2. The big picture

The stack is **Vite + React + TypeScript**. KaTeX draws the math, and the pictures are
plain SVG. There is no server and no database: the site is static files on GitHub Pages,
and progress is saved in the visitor's own browser.

How a visit turns into a page:

```
index.html
  └─ src/main.tsx           loads CSS + KaTeX CSS, registers widgets, mounts <App/>
       └─ src/App.tsx       top bar, bottom tab bar, and the router:
            reads the URL after "#" and picks a page
              ├─ #/                → pages/HomePage.tsx
              ├─ #/gauss, …        → the chapter's page (from chapters.ts)
              ├─ #/practice        → practice/PracticePage.tsx
              ├─ #/exam            → worksheet/ExamPage.tsx
              └─ #/cheat           → pages/CheatPage.tsx
```

Where the numbers come from:

```
                 src/physics/   (pure functions, tested against the worksheet answers)
                /       |        \
     widgets/      practice/      worksheet/
  (draw + sliders)  (short Qs)   (full worksheet Qs)
                \       |        /
                 components/ui.tsx  (text, math, frames, controls)
                        |
                  lib/store.ts      (progress saved in localStorage)
```

The key idea: **every physics answer on the site is computed by one tested module,
`src/physics/`**. A widget readout, a practice answer and a worksheet answer all call the
same functions. If a formula is wrong, the tests fail.

---

## 3. Folder map

```
index.html                 page shell (title, <div id="root">)
vite.config.ts             build settings: base './', dev port 5173, test file pattern
tsconfig.json              TypeScript settings (strict; unused variables are errors)
.github/workflows/
  deploy.yml               test → build → publish to GitHub Pages on every push to main
.claude/launch.json        dev-server presets used by Claude Code's preview (5173 and 5174)

src/
  main.tsx                 entry point
  App.tsx                  top bar, router, bottom tab bar
  chapters.ts              THE list of chapters (register new chapters here)
  styles.css               all CSS: colour tokens, light/dark, every class

  pages/                   one file per page
    HomePage.tsx           progress, chapter cards, link to ตัวอย่างข้อสอบ
    GaussPage.tsx          chapter 1
    PotentialPage.tsx      chapter 2
    MagnetismPage.tsx      chapter 3 (the best template to copy)
    CheatPage.tsx          the สูตร tab

  components/
    ui.tsx                 text/math helpers, Section, WidgetFrame, Slider, Seg, Arrow, …
    Graph.tsx              small SVG line graph used inside widgets

  widgets/                 one file per interactive widget
    registry.tsx           the id → widget table and <W id="…"/>
    all.ts                 registers every widget under its id

  physics/
    index.ts               chapters 1–2 (k = 9.0e9, ε0 = 8.85e-12); re-exports magnetism.ts
    magnetism.ts           chapter 3 (μ0 = 4π×10⁻⁷, e = 1.60e-19)
    answers.ts             parse a typed number, check it (2 %, sign, ×10ⁿ, known slips)
    physics.test.ts        chapters 1–2 tests (worksheet Q21–25 + lecture examples)
    magnetism.test.ts      chapter 3 tests (Q26–27, slide examples, numeric cross-checks)

  practice/                the ฝึกโจทย์(สั้น) tab
    common.ts              types, skill list, feedback sentences, random helpers, unit lists
    bankElectric.ts        short-question generators, chapters 1–2
    bankMagnetism.ts       short-question generators, chapter 3
    questions.ts           joins the banks; links pieces to worksheet Qs; timed sets
    PracticePage.tsx       menu, drill screen, timed set screen
    questions.test.ts      runs every generator 200 times

  worksheet/               the ตัวอย่างข้อสอบ tab
    types.ts               the question format and defineQuestion()
    ch1to3.ts              worksheet Q21–27
    index.ts               all 20 questions (built + planned), checkBox()
    figures.tsx            the "ดังรูป" figures (Q21, Q22, Q27)
    ExamPage.tsx           list, one-question screen, mock exam
    worksheet.test.ts      answer-key tests + 300 random seeds per question

  lib/
    store.ts               saved state (progress, theme) in localStorage
    useDrag.ts             mouse + touch dragging inside an SVG
    format.ts              number formatting: fmt(), tex(), fmtSI(), clamp()

Source/                    (git-ignored) personal source material, never published
```

Every source file starts with a comment block saying what it does and how to change it.
Read that comment first.

---

## 4. The rules the code follows

1. **Physics lives only in `src/physics/`.** Widgets, practice and worksheet code never
   write a formula themselves; they call a physics function. That function has a test.
2. **Tests use the worksheet's answer key.** If a test with worksheet numbers fails, the
   physics is wrong, not the test.
3. **Every widget has a "ลองสังเกต" (what to notice) line and a ↺ รีเซ็ต button.**
   `WidgetFrame` makes both, so you get them by using it.
4. **Phone first.** Nothing may make the page scroll sideways at 360 px. Wide equations
   scroll inside their own box.
5. **Thai on screen, English in code.** All visible text is Thai, with English physics
   terms in brackets where useful. Comments, names and commit messages are English.
6. **Questions follow the source.** Worksheet questions keep the worksheet's wording and
   all its parts, and only change numbers. Each question uses the constants it states
   itself (for example Q26's proton mass 1.66×10⁻²⁷ kg).
7. **No guessing at a method.** If a solution can be done more than one way and the
   professor's way is unknown, mark it `TODO(professor-method)` (see §10).

---

## 5. How each part works

### 5.1 Routing (URLs)

The site uses **hash routing**: the page is chosen by the part of the URL after `#`.
Changing the hash never reloads the page, and it works on GitHub Pages without any server
setup. `useRoute()` in `App.tsx` splits the hash into `[page, sub]`.

| URL | Shows |
|---|---|
| `#/` | Home |
| `#/learn` | The chapter opened last (the บทเรียน tab) |
| `#/gauss` | A chapter page (`gauss`, `potential`, `magnetism`, …) |
| `#/gauss/sheets` | The same page, scrolled to the section with id `sheets` |
| `#/practice` | ฝึกโจทย์(สั้น) menu |
| `#/practice/ws25` | Practice that drills only the pieces of worksheet Q25 |
| `#/exam` | ตัวอย่างข้อสอบ list |
| `#/exam/25` | Worksheet Q25 |
| `#/exam/mock` | Mock exam (6 random worksheet questions) |
| `#/cheat` | สูตร tab |
| `#/w/<id>` | One widget on its own |

The bottom tab bar is the `tabs` array near the top of `App.tsx`. Each tab has a `match`
function that decides when it is highlighted.

### 5.2 The chapter list

`src/chapters.ts` is the **only** place a chapter is registered. The home page cards, the
บทเรียน tab, the progress bars and the router all read it.

```ts
{
  id: 'magnetism',          // URL #/magnetism; never rename after publishing (breaks links + progress)
  num: 3,
  title: 'กฎของบิโอต์–ซาวาร์ต และกฎของแอมแปร์',
  en: "Biot-Savart Law and Ampere's Law",
  blurb: 'แรงแม่เหล็ก · แรงบนลวด · …',   // shown on the home card
  icon: '🧲',
  status: 'ready',          // 'soon' = greyed out, no page
  sections: magnetismSections,
  Page: MagnetismPage,
}
```

Chapters 4–9 are already listed with `status: 'soon'`.

### 5.3 Chapter pages and the text building blocks

A chapter page is a list of `<Section>` cards. `MagnetismPage.tsx` is the cleanest
example. The pieces, all from `src/components/ui.tsx`:

| Write | You get |
|---|---|
| `<Section id="m-force" eyebrow="ตอนที่ 1" title="…" en="english name">` | One card with a "เข้าใจแล้ว?" tick button. `id` is the progress key **and** the URL anchor |
| `<P>{r`text with $x^2$ and **bold**`}</P>` | A paragraph. `$…$` is inline math, `**…**` is bold |
| `<M>{r`E=\frac{kQ}{r^2}`}</M>` | A display equation |
| `<Li>{r`…`}</Li>` | A list item (same `$…$` and `**…**` rules) |
| `<Note>{r`…`}</Note>` | A yellow note box |
| `<Analogy>…</Analogy>` | A "นึกภาพแบบ Minecraft" box (change the label with `tag="…"`) |
| `<Worked title="…">…</Worked>` | A fold-out worked example |
| `<W id="flux" />` | The widget registered as `flux` |
| `<Tex>{r`…`}</Tex>` | Inline math inside your own JSX |
| `<T>{'…'}</T>` | Text with `$…$` and `**…**`, without a `<p>` around it |

Things to know:

- **`r`…`` is `String.raw`.** Inside it, TeX backslashes need no escaping:
  `r`\frac{a}{b}`` rather than `'\\frac{a}{b}'`. Use it for anything containing TeX.
- **Long equations on phones.** In `<M>`, every `\qquad` starts a new line, and
  `\qquad\Rightarrow\qquad` becomes a new line starting with ⇒. So
  `<M>{r`qvB=\frac{mv^2}{r}\qquad\Rightarrow\qquad r=\frac{mv}{qB}`}</M>` stacks into two lines.
- **A dollar sign in plain text** would start math. The site doesn't need one, but if
  you do, write `\$` inside math instead.
- The page also exports a section list, e.g. `magnetismSections = [{ id, label }, …]`,
  which draws the chips at the top of the page. Keep it in the same order as the
  `<Section>`s, with the same ids.

### 5.4 The physics module

`src/physics/index.ts` (chapters 1–2) and `src/physics/magnetism.ts` (chapter 3) are
**pure functions**: numbers in, numbers out, no React, no randomness. `index.ts`
re-exports `magnetism.ts`, so everything is imported the same way:

```ts
import * as P from '../physics';
P.pointFieldMagnitude(4e-6, 0.14);   // 1.84e6 N/C
```

Conventions:

- **SI units inside.** Convert μC, cm and MeV before calling (`uC = 1e-6`, `P.MEV`).
- **Constants** are the ones the worksheet uses: `K = 9.0e9`, `EPS0 = 8.85e-12`,
  `MU0 = 4π×10⁻⁷`, `E_CHARGE = 1.6e-19`. `K` is used for point-charge style formulas and
  `EPS0` for flux and sheets, as the worksheet does (the two differ by 0.1%).
- **Chapter 3 coordinates:** x → right, y → up, z → **out of the page**.
  ⊙ means +z, ⊗ means −z. Directions are returned as signed components or `Vec3`.
- Some functions are cross-checked numerically in the tests, for example the closed-form
  wire fields against a brute-force Biot–Savart sum (`biotSavartPolyline`) and a numeric
  ∮B·ds (`circulation`).

To add physics: write the function with a one-line comment saying what it is and which
slide or worksheet question it comes from. Then add a test in the matching `.test.ts`
using the worksheet's or slide's own numbers and answer.

### 5.5 Widgets

A widget is a React component in `src/widgets/`, usually an SVG picture plus sliders and
number readouts. The shape is always the same. Here is a minimal one to copy:

```tsx
// =====================================================================
// Widget: <what it shows, in one line>.
// <what the student should notice>
// =====================================================================
import { useState } from 'react';
import { Readout, Slider, WidgetFrame } from '../components/ui';
import { fmt } from '../lib/format';
import { longWireField } from '../physics';

const W = 320;                         // SVG viewBox width: always 320 (fits 360 px phones)
const H = 200;
const init = { I: 5, rCm: 10 };        // starting values = what ↺ รีเซ็ต returns to

export function MyWidget() {
  const [I, setI] = useState(init.I);
  const [rCm, setRCm] = useState(init.rCm);
  const B = longWireField(I, rCm / 100);   // physics comes from src/physics

  return (
    <WidgetFrame
      title="ชื่อ widget"
      notice="สิ่งที่ควรสังเกต เช่น ระยะเพิ่ม 2 เท่า $B$ ลดเหลือครึ่งหนึ่ง"
      onReset={() => { setI(init.I); setRCm(init.rCm); }}
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="stage pan-y">
        {/* drawing */}
      </svg>
      <div className="controls">
        <Slider label="กระแส $I$" value={I} min={1} max={10} step={1} onChange={setI} show={`${I} A`} />
        <Slider label="ระยะ $r$" value={rCm} min={2} max={30} step={1} onChange={setRCm} show={`${rCm} cm`} />
      </div>
      <div className="readouts">
        <Readout k="$B=\mu_0I/2\pi r$" v={`${fmt(B)} T`} hl />
      </div>
    </WidgetFrame>
  );
}
```

Then register it in `src/widgets/all.ts`:

```ts
import { MyWidget } from './MyWidget';
widgets.myWidget = { title: 'ชื่อสั้น', C: MyWidget };
```

and use it on a page with `<W id="myWidget" />`. You can check it alone at `#/w/myWidget`.

Tools for widgets:

| Tool | Where | Use |
|---|---|---|
| `WidgetFrame` | ui.tsx | Blue frame with title, ลองสังเกต line, ↺ รีเซ็ต |
| `Slider`, `Seg`, `Toggle` | ui.tsx | Slider with value label; segmented buttons; on/off button |
| `Readout` | ui.tsx | A labelled number box (`hl` highlights it) |
| `Arrow` | ui.tsx | SVG arrow from (x1,y1) to (x2,y2); `cls` picks the colour |
| `ChargeDot` | ui.tsx | A + or − charge disc |
| `OutIn` | ui.tsx | ⊙ (`out`) or ⊗ symbol for field or current through the page |
| `Graph` | Graph.tsx | Small line graph of `fn(x)` with a moving marker |
| `useDrag` | lib/useDrag.ts | Drag points with mouse **or finger**; gives SVG coordinates |
| `fmt`, `tex`, `fmtSI`, `clamp` | lib/format.ts | `fmt(1.84e6)` → "1.84×10⁶"; `tex()` is the TeX version |

Dragging (see `PointField.tsx` for a full example):

```tsx
const onMove = useCallback((key: 'p', pt: { x: number; y: number }) => setP(pt), []);
const bind = useDrag(onMove);
<svg className="stage" {...bind('p')}>…</svg>
```

- Use `className="stage"` on an SVG with draggable things: it stops the page scrolling
  while a finger is on the picture.
- Add `pan-y` (`"stage pan-y"`) when nothing in it is draggable, so a finger can still
  scroll the page past it.
- **Drawing scale:** pick a constant like `PX_PER_M` and write it in a comment. When a
  length on screen stands for a physical size, say so in a comment, as `PointField.tsx`
  does for its arrows.

### 5.6 ฝึกโจทย์(สั้น): short practice questions

Short questions test **one step at a time**. Each question type is a **generator**: a
recipe that picks random numbers and returns a complete problem. (In the bank files raw
strings are written `String.raw`…``; it is the same as `r`…`` from `components/ui.tsx`.)

```ts
{
  id: 'long-wire',                 // unique; timed sets refer to it
  skill: 'biotSavart',             // which accuracy bar it counts toward
  title: 'สนามของลวดยาวมาก',
  make: (rng) => {
    const I = pick(rng, [2, 5, 10]);       // random helpers from common.ts
    const r = int(rng, 2, 20) / 100;
    const ans = P.longWireField(I, r);     // answer from the physics module
    return {
      prompt: r`ลวดตรงยาวมากมีกระแส ${I} A จงหาขนาดสนามแม่เหล็กที่ระยะ ${r * 100} cm`,
      units: U.tesla,                      // drop-down; first = unit the answer is shown in
      answer: ans,                         // SI
      scale: ans,                          // typical size (only matters if answer is 0)
      mistakes: [                          // wrong values typical slips give
        { id: 'no-2pi', value: P.MU0 * I / (4 * Math.PI * r) },
      ],
      hints: [r`…`, r`…`],                 // shown one at a time
      solution: [r`…`, r`…`],              // worked lines with THIS problem's numbers
    };
  },
}
```

- Random helpers in `common.ts`: `pick(rng, list)`, `int(rng, lo, hi)`, `nonzero(…)`,
  `s1(x)` ("+5.0"), and the constants as TeX (`K_TEX`, `E0_TEX`, `MU0_TEX`). Always use
  `rng`, never `Math.random()`, so a problem can be rebuilt from its seed (the tests rely
  on this).
- **Skills** are listed in `common.ts` (`Skill`, `skillNames`, `skillChapter`). A new
  skill needs an entry in all three.
- **Mistake ids** must exist in `mistakeText` in `common.ts`; that is the Thai sentence
  shown when the student's answer matches that slip.
- **Linking to a worksheet question:** add the generator id to `wsOf` in `questions.ts`
  (`'long-wire': 27`). The drill then shows "ส่วนหนึ่งของข้อ 27", and the worksheet page
  shows a "ฝึกทีละส่วน" button.
- **Timed sets** are `examSets` in `questions.ts`: each slot is a list of generator ids,
  and one of them is picked at random.
- **Accuracy** counts only the first attempt at each problem.

### 5.7 ตัวอย่างข้อสอบ: worksheet questions 21–40

The exam takes **6 of the 20 worksheet questions** with new numbers. This tab therefore
keeps each question exactly as written, with all its parts (ก, ข, …), and only changes the
numbers. Q21–27 are built. Q28–40 are listed in `planned` in `worksheet/index.ts` and get
built along with chapters 4–9.

A question is written with `defineQuestion` (see `worksheet/types.ts` and `ch1to3.ts`):

```ts
const q25 = defineQuestion<Q25>({
  q: 25,                                   // worksheet number
  chapter: 'potential',
  title: 'ตัวนำทรงกลม (ตัวเลข)',
  idea: 'ข้างนอกเหมือนจุดประจุ ข้างใน $E=0$',   // shown in the "แนวคิดหลัก" fold-out
  lesson: '#/potential/condV',             // "ทบทวนบทเรียน" link
  sheet: [r`V=k_e\dfrac{q}{r}`],           // formulas from the official exam sheet it uses
  notOnSheet: ['ข้างในตัวนำ $E=0$ …'],      // what it needs that is NOT on the sheet
  original: { Rcm: 10, Q: 4, rOut: 14, rIn: 5 },        // the worksheet's numbers
  random: (rng) => ({ … }),                // new numbers, same structure
  build: (n) => ({                         // numbers → the question
    prompt: r`…worksheet wording with ${n.Rcm}…`,
    figure: { id: 'q21', props: { … } },   // optional, see figures.tsx
    parts: [
      { label: 'ก', ask: '…', boxes: [ /* answer boxes */ ] },
      { label: 'ข', ask: '…', boxes: [ … ] },
    ],
    hints: [ … ],
    solution: [ … ],
  }),
});
```

There are two kinds of answer box:

- `{ kind: 'number', label, units, answer, scale, mistakes }`: checked like practice
  answers (§5.8).
- `{ kind: 'choice', label, options: [{ tex }, { tex, mistake }] }`: for symbolic answers
  such as Q24ก's Q = 4πε₀RV₀. **Write the correct option first**; the page shuffles them.
  `mistake` is a `mistakeText` id that explains why a wrong option is wrong.

Answers that are a multiple of a symbol (× σ/ε₀, × V₀, × μ₀I/2π) are number boxes with a
unit like `U.timesSigma`, and students may type fractions such as `3/2`.

Why `build` is separate from `random`: the test file calls `build(original)` and checks
the results against the worksheet's answer key. If a change breaks a question, `npm test`
names it.

To add a figure, write a small SVG component in `figures.tsx` taking the numbers as
`p`, and add it to the `figures` table under the id the question uses.

**Progress rule** (the list's status):

- One try = the first complete check of one set of numbers.
- "Clean" = every box right, with no hints and no solution opened.
- ✓ means clean once, ✓✓ พร้อมสอบ means clean twice.
- A mock-exam question counts as a try only if at least one box was answered.

### 5.8 Answer checking

`src/physics/answers.ts`.

`parseNumber` accepts `1.84e6`, `1.84×10^6`, `1.84x10^-6`, `1.84*10^6`, `10^-3`,
superscripts (`10⁻³`), a comma as the decimal point, simple fractions `1/6`, and `−` or `-`
for minus.

`checkAnswer(given, expected, mistakes, scale)` returns the first of these that fits:

1. **correct**: within 2% (an exact 0 uses `scale` as the yardstick)
2. **mistake**: matches one of the problem's known slips → its Thai sentence
3. **sign**: right size, wrong sign
4. **power10**: right digits, off by 10ⁿ (unit-conversion slip)
5. **wrong**

The Thai sentences for each verdict are in `feedback()` in `PracticePage.tsx`; the
worksheet tab reuses them.

### 5.9 Saved progress (localStorage)

`src/lib/store.ts`. Everything is saved under **one** key, `physicweb:v1`, in the
visitor's browser. Nothing is sent anywhere.

| Field | Holds |
|---|---|
| `theme` | `'light'`, `'dark'` or `null` (follow the device) |
| `done` | section id → ticked "เข้าใจแล้ว" |
| `skills` | skill id → `{ correct, total }` for short practice |
| `exams` | last 20 timed practice sets |
| `lastChapter` | for the บทเรียน tab |
| `ws` | worksheet question number → `{ tries, clean }` |
| `mocks` | last 20 mock exams |

Reading and writing:

```ts
const s = useStore();      // in a component; re-renders when the state changes
toggleDone('flux');        // write only through helpers like this one
```

**To add a saved field:** add it to `State` and to `empty` (its default), then write a
helper that calls `update(...)`. Old saves still load, because `load()` starts from `empty`
and copies the saved fields on top. Change the key's version only if old data can't be
read by the new shape (everyone's progress resets).

### 5.10 Styling, colours and dark mode

All CSS is in `src/styles.css`. There is no CSS framework.

- **Colour tokens** are at the top: `:root { --bg, --card, --ink, --accent, … }`, with the
  dark versions under `:root[data-theme='dark']`. `App.tsx` sets `data-theme` on `<html>`.
  Always use a token (`var(--accent)`), never a raw colour, so both themes work.
- **Physics colours:** `--pos`/`--neg` charges, `--field` E field, `--gauss` Gaussian
  surface. Chapter 3 uses `--bfield` (B, green), `--vel` (v, red), `--force` (F, blue)
  and `--cur` (current, purple), matching the slides.
- **SVG colour classes:** `s-<name>` sets the stroke and `f-<name>` the fill. For example
  `className="s-field"`, `f-pos`, `f-none s-gauss`. `Arrow cls="bfield"` uses both.
- **Layout classes you'll reuse:** `card`, `btn` / `btn ghost`, `btn-row`, `seg`, `chips` / `chip`,
  `controls`, `readouts`, `small` (smaller grey text), `mut` (grey text inside an SVG), `note`, `scroll` (a table that scrolls
  sideways), `scroll-x`.
- **Phone width:** test at 360 px. A long equation goes in `<M>` (it scrolls inside
  itself) or gets split with `\qquad`. A long inline formula in a list should be split into
  two items.

### 5.11 Home page and สูตร tab

- `pages/HomePage.tsx`: progress bars, a card per chapter (from `chapters.ts`), and the
  ตัวอย่างข้อสอบ progress card.
- `pages/CheatPage.tsx`: the สูตร tab. Students get an official formula sheet in the exam,
  so this page shows:
  1. the sheet's constants, as printed;
  2. `sheetBlocks`: the sheet's formulas as printed, for chapters with lessons;
  3. `notOnSheet`: what the lessons use that is **not** on the sheet, with where each
     comes from;
  4. the traps that cost marks;
  5. a Thai–English glossary.

  When you add a chapter, copy its block from the official sheet into `sheetBlocks` and
  list its derived results in `notOnSheet`.

---

## 6. Recipes: common changes step by step

**Fix a typo or change some text.** Find the text with your editor's search (Ctrl+Shift+F)
and edit it. Text is plain strings in the page files; `$…$` is math.

**Change a number in a lesson's worked example.** Change the text, and if a widget or a
test uses the same numbers, change those too. Then run `npm test`.

**Add a section to a chapter page.**
1. Add `<Section id="new-id" title="…">…</Section>` where it belongs in the page.
2. Add `{ id: 'new-id', label: 'ชื่อสั้น' }` to the page's `…Sections` list, in the same
   position. Ids must be unique across the whole site, because they are progress keys.

**Add a widget.** Follow §5.5: new file, register it in `all.ts`, place `<W id>` on the
page, check it at `#/w/<id>` at 360 px, and check that ↺ รีเซ็ต restores every value.

**Add a short practice question.**
1. If it needs new physics, add the function and a test first (§5.4).
2. Add a generator to the chapter's `bank….ts` (§5.6).
3. Any new mistake id goes in `mistakeText`, and a new skill goes in the three skill maps.
4. If it is a piece of a worksheet question, add it to `wsOf`.
5. Run `npm test`; the bank test runs your generator 200 times.

**Build a worksheet question (Q28–40).**
1. Physics function(s) + a test with the worksheet's numbers and answer.
2. `defineQuestion` in a chapter file in `src/worksheet/` (e.g. `ch4.ts`): `original`,
   `random`, `build`, `sheet`, `notOnSheet`, `idea`, `lesson`.
3. Add it to `built` in `worksheet/index.ts` and delete its line from `planned`.
4. Add an answer-key test in `worksheet.test.ts` (copy the Q25 one).
5. Optional: a figure in `figures.tsx`, and short practice pieces linked with `wsOf`.

**Add a chapter.**
1. Physics: `src/physics/<topic>.ts`, re-exported from `physics/index.ts`, plus a test.
2. Worksheet questions for that chapter (above). Do this first: they are what the exam asks.
3. Page: copy `MagnetismPage.tsx`, keep the `<Section>` / `<W>` pattern, export a
   `…Sections` list.
4. Register the page in `chapters.ts` and set `status: 'ready'`.
5. Widgets (§5.5), short practice questions (§5.6) and, if wanted, a timed set in `examSets`.
6. สูตร tab: copy the chapter's block from the exam sheet into `sheetBlocks`, and list
   the derived results in `notOnSheet`.

**Change a constant.** It is defined once at the top of `physics/index.ts` or
`physics/magnetism.ts`. Questions that state their own value (like Q26's mass) keep a
local constant on purpose, so leave those.

**Change a feedback sentence.** `mistakeText` in `practice/common.ts` (known slips) or
`feedback()` in `PracticePage.tsx` (sign, power of ten, wrong).

**Reset your own progress while testing.** Home page → "ล้างความคืบหน้า", or in the browser
console: `localStorage.removeItem('physicweb:v1')`.

---

## 7. Before you push: checklist

```bash
npm test
```

```bash
npm run build
```

Then, in the browser at **360 px wide**, check:

- [ ] The pages you touched don't scroll sideways.
- [ ] No red KaTeX text (a TeX error shows as red source text).
- [ ] Widgets: dragging works with a finger (or device-toolbar touch mode), and ↺ รีเซ็ต
      restores everything.
- [ ] Light **and** dark theme (🌙 / ☀️ button) both look right.
- [ ] No errors in the browser console.

GitHub runs `npm test` and `npm run build` again before publishing. If either fails, the
live site simply stays on the previous version.

---

## 8. Deploying

`.github/workflows/deploy.yml` tests, builds and publishes **every push to `main`**. Pushing
is all there is to deploying.

One-time setup, if the repository doesn't publish yet: **Settings → Pages → Build and
deployment → Source: GitHub Actions**. The site appears at
`https://<user>.github.io/<repo>/`.

- No path configuration is needed: `vite.config.ts` uses `base: './'` and the app uses hash
  routes, so it works under any repository name.
- **Keep only this one workflow.** A second "static content" workflow would publish the
  raw source instead of the built site, and the two would overwrite each other.
- To test the real build locally first: `npm run build`, then `npm run preview`.

---

## 9. Conventions

- **Comments:** every file opens with a block saying what it does and how to change it.
  Comment the *why* and anything a newcomer would trip on: units, scales, sign
  conventions, which slide or worksheet question a formula comes from.
- **Naming:** components `PascalCase`; ids in kebab-case (`m-force`, `long-wire`) or
  camelCase for widgets (`chargeInB`). Never rename a published chapter or section id:
  bookmarks and saved progress use it.
- **TypeScript is strict** and unused variables or imports fail the build. Delete what
  you don't use.
- **Physics wording:** use the slides' Thai terms (the glossary in `CheatPage.tsx`).
  Analogies are allowed but keep them everyday (Minecraft is fine, nothing obscure).
- **Commits:** short English summary line, details below it if needed.

---

## 10. Open questions and known limits

**Waiting for the professor's method.** Search the code for `TODO(professor-method)`.
These are lecture examples whose solutions the slides leave blank and that can be done more
than one way. The answers are the same either way; only the presentation may change.

- **Semicircle wire, curved part (slides 9–11):** solved by integrating over θ, with the
  "straight chord" shortcut as a check. Files: `src/pages/MagnetismPage.tsx`,
  `src/practice/bankMagnetism.ts`.
- **Finite straight wire (slides 13–15):** written as B = μ₀I/4πa · (sin θ₁ + sin θ₂) with
  both angles positive. Files: `src/physics/magnetism.ts` (`finiteWireField`),
  `src/pages/MagnetismPage.tsx`, `src/practice/bankMagnetism.ts`.

**Scope notes**

- Only what is in the lecture decks and the worksheet is covered. For example, the
  potential *inside* a uniformly charged insulating sphere isn't in that material, so the
  sphere widget shows V(r) for the insulator only outside.
- In ตัวอย่างข้อสอบ, Q21's random numbers sometimes put the asked point outside the shell
  instead of in the metal, Q23's charge can be negative, and Q27 keeps the worksheet's
  current directions. The structure always matches the worksheet.
- The mock exam currently picks from Q21–27 only, and the สูตร tab shows the sheet for
  chapters 1–3 only. Both grow as chapters are added.
- One wide equation on the Gauss page scrolls inside its own box on phones (by design).
- The build warns that the JavaScript bundle is over 500 kB (KaTeX is most of it). It
  loads fine; splitting it is optional.

---

## 11. Troubleshooting

**"Port 5173 is already in use."** Another dev server is running (maybe in another
terminal or VS Code). Stop it, or run `npm run dev -- --port 5174`.

**Git says "detected dubious ownership"** (common on a drive that doesn't record file
owners, like an exFAT USB or second drive). Add the folder once:

```bash
git config --global --add safe.directory E:/devstuff/PhysicWeb
```

**Math shows as red text.** That's a KaTeX error: the red text is the TeX source. Usual
causes: a string not wrapped in `r`…`` so a backslash got eaten, an unmatched `{`, or a
`$` too many in a `<P>`.

**My change doesn't show on the live site.** Open the repository's **Actions** tab. A red
✗ means a test or the build failed, so nothing was published; click it to see which. Your
phone may also be showing a cached copy, so reload.

**Progress disappeared.** It lives in that one browser only: another browser, private
mode or clearing site data starts empty. The dev server (localhost) and the live site
also keep separate progress.

**A test fails after I changed a formula.** Read the test's name: it says which worksheet
answer or slide example no longer matches. Fix the formula, not the test, unless the test
itself was copied wrong from the worksheet.
