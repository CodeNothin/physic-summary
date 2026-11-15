# กฎของเกาส์ & ศักย์ไฟฟ้า · 2304121

Interactive study site (in Thai) for Gauss's law and electric potential, built from the two
lecture decks and worksheet questions 21–25 of course 2304121.

- 11 touch-draggable widgets, one per concept
- Practice mode with randomised numbers, step-by-step hints, worked solutions,
  per-skill accuracy, a weakest-skill drill and a 20-minute timed set
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

Open http://localhost:5173. To try it on a phone on the same Wi-Fi, run
`npm run dev -- --host` and open the "Network" address it prints.

## Test

```bash
npm test
```

- `src/physics/physics.test.ts` checks the physics module against the worksheet answers
  (Q21 −5.0 / −15.0 μC and E = 0 in the metal, Q22 3σ/2ε₀, Q23 −9.0 V and 2.7×10⁻⁵ J,
  Q24 Q = 4πε₀RV₀ and V₀/6, Q25 1.84×10⁶ N/C, 2.57×10⁵ V, 3.6×10⁵ V) and the lecture examples.
- `src/practice/bank.test.ts` runs every question generator 200 times and checks that the
  exact answer is always accepted and never mistaken for a known slip.

## Build

```bash
npm run build
```

Type-checks, then writes the static site to `dist/`. `npm run preview` serves that build locally.

## Deploy to GitHub Pages

The repo includes `.github/workflows/deploy.yml`, which tests, builds and publishes on every
push to `main`.

1. Create a GitHub repository and push this folder to its `main` branch.
2. In the repository: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Push (or run the workflow manually from the Actions tab). The site appears at
   `https://<user>.github.io/<repo>/`.

No path configuration is needed: Vite is set to `base: './'` and the app uses hash routes
(`#/gauss`, `#/practice`, …), so it works under any repository name.

## Project layout

```
src/
  physics/index.ts     all physics, pure and typed (k = 9.0e9, ε0 = 8.85e-12)
  physics/answers.ts   answer parsing and checking (2% tolerance, sign / power of ten / known slips)
  widgets/             one file per widget; all.ts registers them
  pages/               Thai content pages (home, Gauss, potential, cheat sheet)
  practice/bank.ts     question generators; PracticePage.tsx is the UI
  components/          KaTeX helpers, widget frame, sliders, graph
  lib/                 localStorage store, drag hook, number formatting
Source/                (git-ignored) personal source material the site was built from
```

Rules the code follows:

- Widgets and practice answers never compute physics themselves; they call `src/physics`.
- Each widget has a "ลองสังเกต" (what to notice) line and a reset button.
- A single widget can be linked directly: `#/w/<id>` (for example `#/w/sandbox`).

## Scope notes

- Only what is in the lecture decks and worksheet Q21–25 is covered. The potential *inside* a
  uniformly charged insulating sphere is not in that material, so the sphere explorer shows
  V(r) for the insulator only outside the sphere.
- The worksheet's k and ε₀ differ by 0.1% (1/4πε₀ = 8.99×10⁹); the site uses k for
  point-charge-style formulas and ε₀ for flux and sheets, as the worksheet does.
