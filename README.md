# สรุปฟิสิกส์ · 2304121

Interactive study site (in Thai) for course 2304121, built from the lecture decks and the
worksheet (questions 21–40). Ready so far:

| Chapter | Topic | Worksheet |
|---|---|---|
| 1 | Gauss's law for electric field | Q21–22 |
| 2 | Electric potential | Q23–25 |
| 3 | Biot–Savart law and Ampère's law | Q26–27 |

Chapters 4–9 are listed on the home page as "เร็ว ๆ นี้" until they are written.

- 21 touch-draggable widgets (11 for chapters 1–2, 10 for chapter 3)
- Practice mode with randomised numbers, step-by-step hints, worked solutions,
  per-skill accuracy, a weakest-skill drill, a chapter filter, and a 20-minute timed set per chapter group
- Static site: Vite + React + TypeScript, KaTeX for math, SVG/Canvas for visuals
- Progress is stored in `localStorage` only (key `physicweb:v1`)

## Run

Requires Node 20 or newer.

```bash
npm install
```

```bash
npm run dev
```

Open http://localhost:5173. Saving a file updates the page in about a second.
To try it on a phone on the same Wi-Fi, run `npm run dev -- --host` and open the
"Network" address it prints. To look at one widget alone, open `#/w/<id>`
(ids are in `src/widgets/all.ts`), for example http://localhost:5173/#/w/solenoid.

## Test

```bash
npm test
```

- `src/physics/physics.test.ts` — chapters 1–2 against worksheet Q21–25 and the lecture examples.
- `src/physics/magnetism.test.ts` — chapter 3 against Q26 (r = 0.98 m), Q27
  (B = μ₀I/2π · (1/3 î + 1/2 ĵ)) and the slide examples (semicircle ±2IRB, slide 20's
  2μ₀I/3πL, thick wire, solenoid). It also checks the closed-form formulas against
  brute-force numerical Biot–Savart sums and a numerical ∮B·ds.
- `src/practice/questions.test.ts` — runs every question generator 200 times and checks that the
  exact answer is always accepted and never mistaken for a known slip.

## Build

```bash
npm run build
```

Type-checks, then writes the static site to `dist/`. `npm run preview` serves that build locally.

## Deploy to GitHub Pages

`.github/workflows/deploy.yml` tests, builds and publishes on every push to `main`.

1. In the repository: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
2. Push to `main` (or run the workflow from the Actions tab). The site appears at
   `https://<user>.github.io/<repo>/`.

Keep only this one workflow. A second "static content" workflow would publish the raw
source files instead of the built site, and the two would overwrite each other.

No path configuration is needed: Vite uses `base: './'` and the app uses hash routes
(`#/gauss`, `#/practice`, …), so it works under any repository name.

## Project layout

```
src/
  chapters.ts            the list of chapters: add a new chapter here
  App.tsx                top bar, page router (#/...), bottom tab bar
  physics/
    index.ts             chapters 1–2 physics (k = 9.0e9, ε0 = 8.85e-12)
    magnetism.ts         chapter 3 physics (μ0 = 4π×10⁻⁷, e = 1.60e-19)
    answers.ts           answer parsing and checking (2% tolerance, sign / power of ten / known slips)
  pages/                 one file per chapter page, plus home and the formula sheet
  widgets/               one file per widget; all.ts registers them
  practice/
    common.ts            skill list, feedback texts, random helpers, unit lists
    bankElectric.ts      question generators for chapters 1–2
    bankMagnetism.ts     question generators for chapter 3
    questions.ts         joins the banks; timed exam sets
    PracticePage.tsx     the practice screens
  components/            KaTeX helpers, widget frame, sliders, graph, ⊙/⊗ symbol
  lib/                   localStorage store, drag hook, number formatting
Source/                  (git-ignored) personal source material
```

Every file starts with a comment explaining what it does and how to change it.

Rules the code follows:

- Widgets and practice answers never compute physics themselves; they call `src/physics`.
- Each widget has a "ลองสังเกต" (what to notice) line and a reset button.
- Chapter 3 uses x → right, y → up, z → out of the page (⊙ = +z, ⊗ = −z).

## Adding a chapter

1. Physics: a new file in `src/physics/` (re-export it from `index.ts`) plus a `.test.ts`
   using the worksheet answers.
2. Page: copy `src/pages/MagnetismPage.tsx`, keep its `<Section>` / `<W id>` pattern,
   and export a `…Sections` list.
3. Register the page in `src/chapters.ts` and set its `status` to `'ready'`.
4. Widgets: one file each in `src/widgets/`, registered in `src/widgets/all.ts`.
5. Practice: add skills in `src/practice/common.ts`, a `bank….ts` file of generators,
   and join it in `src/practice/questions.ts` (plus an exam set if wanted).

## Open questions (search for `TODO(professor-method)`)

The slides leave these solutions blank, and they can be written more than one way. The site
uses the version below for now; the answers are the same either way.

- **Semicircle wire, curved part (slides 9–11):** solved by integrating over θ, with the
  "straight chord" shortcut as a check. Files: `src/pages/MagnetismPage.tsx`,
  `src/practice/bankMagnetism.ts`.
- **Finite straight wire (slides 13–15):** written as B = μ₀I/4πa · (sin θ₁ + sin θ₂) with both
  angles positive. Files: `src/physics/magnetism.ts` (`finiteWireField`),
  `src/pages/MagnetismPage.tsx`, `src/practice/bankMagnetism.ts`.

## Scope notes

- Only what is in the lecture decks and the worksheet is covered. The potential inside a
  uniformly charged insulating sphere is not in that material, so the sphere explorer shows
  V(r) for the insulator only outside the sphere.
- The worksheet's k and ε₀ differ by 0.1% (1/4πε₀ = 8.99×10⁹); the site uses k for
  point-charge-style formulas and ε₀ for flux and sheets, as the worksheet does.
- Worksheet Q26 gives the proton mass as 1.66×10⁻²⁷ kg; the site uses that value.
