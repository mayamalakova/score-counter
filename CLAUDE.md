# Score Counter

A table tennis scoreboard for a phone or tablet propped next to the table. Two players,
tap a half of the screen to add a point, minus to take one back. Tracks service, games,
ends and the match result. Personal project by Maya Malakova, first written in 2018–2019,
now being modernized.

## Working agreements

- Work one phase at a time, one PR per phase (or per feature from Phase 6 on). Don't
  pull work forward from later phases, even when it's tempting.
- Small, focused commits with messages that explain why, not just what.
- Planned work is tracked in GitHub issues and on the project board (repo's Projects tab).
  Start from an issue, and close it from the PR with `Closes #N`.
- Behaviour changes need a test. Refactors must keep existing tests green.
- Ask before adding a dependency that isn't listed under "Target stack".
- Keep the known-bugs list below up to date: add bugs you find, strike them when fixed,
  and say in the PR which ones it fixes.
- Claude may push feature branches and open PRs; only Maya merges. Claude never merges,
  enables auto-merge, pushes to the default branch or changes repository settings.

## Target stack (decided)

- Vue 3 (latest 3.x), Composition API with `<script setup lang="ts">` for new code
- Vite for dev server and build
- TypeScript, pinned to 6.0.x: `vue-tsc` relies on the TypeScript JS API, which the
  7.x native port doesn't provide the same way. Revisit when vue-tsc supports 7.
- Vitest + @vue/test-utils + jsdom for tests, @vitest/coverage-v8 for coverage (90% floor)
- ESLint (recommended JS, typescript-eslint, eslint-plugin-vue) and Prettier (4 spaces,
  no semicolons, single quotes; config in `.prettierrc.json`)
- @fontsource for self-hosted fonts
- uqr for QR codes (tiny, no dependencies, SVG output)
- Node 22 (see `.nvmrc`)
- Hosting: Netlify (static site, deploy on push to `main`, preview URL per PR),
  configured through `netlify.toml` in the repo. Why:
  - After Phase 1 the app is purely static, so it needs no server. The old Heroku
    setup is gone anyway (free dynos were discontinued in 2022).
  - Netlify is the closest to the Heroku workflow Maya liked: connect the repo once,
    push to deploy.
  - Every PR gets its own preview URL, so each change can be tried on a phone next to
    a real table before merging. This fits the one-PR-per-phase/feature workflow.
  - Build settings live in `netlify.toml`, in code rather than in a dashboard.
  - The free tier comfortably covers a hobby app.
  - Alternatives considered: GitHub Pages (no extra account, but no PR previews
    without extra setup); Vercel and Cloudflare Pages (roughly equivalent, Netlify
    chosen for the Heroku-like feel). Render, Railway or Fly.io only become relevant
    if a backend is added later (e.g. shared history or a live second screen).
- CI: GitHub Actions running lint, format check, typecheck, tests with coverage and
  build on every PR

## Roadmap

1. **Toolchain migration (done).** Move the existing app to Vue 3, Vite, TypeScript
   and Vitest with no intentional behaviour or visual changes. Scope:
   - Replace webpack 4 configs, mocha-webpack, chai and the Heroku setup
     (`server.js`, `Procfile`, `node-static`, `express`, `heroku-postbuild`).
   - Remove unused dependencies (`express`, `vue-router`).
   - Port components to Vue 3 with the smallest changes that work: `.sync` becomes
     `v-model:prop`, `emits` declared, `new Vue()` becomes `createApp`. Keeping Options
     API and Stylus is fine in this phase; converting files to TypeScript is optional.
   - Port `test/appSpec.js` to Vitest and keep all its cases passing.
   - Add `netlify.toml` and a GitHub Actions workflow (typecheck, test, build).
   - Update the README with setup, scripts and deploy notes.
   - Known bugs are **not** fixed in this phase unless the port forces it; note any
     that the port happens to change.
2. **Scoring engine (done).** Extract all rules from `App.vue` into a pure TypeScript module
   that stores the match as an event log (point / next game / server correction) and
   derives score, server, ends and winner. Undo = drop the last event. Adds configurable
   11 or 21 points, best of 1/3/5/7, and the deciding-game change of ends.
3. **UI rebuild and redesign (done).** Typed props and emits, no `$parent`, real `<button>`s,
   SVG icons instead of the icomoon font. Design direction: ITTF
   table blue background with white edge and net lines; player colours (blue #2e6bc6,
   red #df373d) follow the player, not the side; Big Shoulders Display for scores,
   Atkinson Hyperlegible for UI text (self-hosted via @fontsource); the server indicator
   is a ball that hops over the net when service changes. Held upright, the halves stack
   with the net across the middle.
4. **Resilience (done).** Autosave the match to localStorage and restore it on reload,
   plus an "End match" action (with confirmation) to abandon a match, since reloading no
   longer does. Wake lock and the PWA moved to Phase 6.
5. **Repo hygiene (done).** Component tests for the main flows, contributor docs.
6. **Features, one PR each (current).** Doubles (done, see below), keyboard shortcuts (moved from Phase 3), screen wake lock
   during play and installable offline PWA (both moved from Phase 4), match history and
   rematch, timeouts, optional spoken score, second-screen display mode.

   Context for features: the app is used for Czech amateur league nights (4–5 players a
   team, singles chosen by the captain plus two doubles, several tables at once, a
   volunteer umpire per match). The signed paper protocol stays the official record and
   some players score on paper, so the app is a helper, never the only way to score.
   Ideas agreed in principle, after doubles: a fixture mode for the captain (results
   scored in the app, handed over by QR code, or typed in and validated; a protocol view
   for copying onto the paper sheet), and a Czech UI.

   **Doubles (decided):**
   - Board: centre line, four name tags in their half-courts (same style, pair colour),
     the ball marks the server. No line or highlight for the receiver.
   - Positions assume the phone is always on the same long side of the table: the screen's
     bottom edge is the table edge nearest the phone (upright, the picture is turned a
     quarter turn). So a player's right half-court is the bottom half at the left end and
     the top half at the right end, and the serve runs bottom-left to top-right.
   - Later games rotate automatically (who received first serves first, to who served to
     them); the edit panel corrects it if a pair chooses differently.
   - Set-up only asks who serves first; the other pair's first-listed player receives
     first. The edit panel corrects it if the pair chooses differently.

## Scoring rules (ITTF)

- A game is won at 11 (or 21) with a two-point lead.
- Service changes every 2 points (every 5 in games to 21), and every point once both
  players reach 10–10 (20–20).
- The player who served first in a game receives first in the next.
- Players change ends after each game, and in the last possible game of the match
  when the first player reaches 5 (10 in games to 21).
- Doubles: the server serves from their right half-court diagonally to the receiver's.
  At each change of service the previous receiver becomes the server and the previous
  server's partner becomes the receiver. In game 1 the serving pair chooses its first
  server and the receiving pair its first receiver; in later games the first receiver is
  the player who served to them in the previous game. In the last possible game the
  receiving pair swaps its order when a pair first reaches 5 (10 in games to 21).

## Known bugs (legacy app)

- ~~Empty player names break the match. The game winner is stored as the player's name,
  so `''` is falsy: the game never ends, scoring continues past 11, and every point
  after 11 pushes a duplicate entry into `gameScores`. The match can never finish.~~
  Fixed in Phase 2: winners are players A/B, not names.
- ~~New match doesn't reset `swapServer`, while setup always shows the left player
  serving, so a new match can silently start with the wrong server.~~ Fixed in Phase 2.
- ~~Restart sets `swapServer = false`, but the flag is match-wide, so restarting a game
  can flip the server for the rest of the match.~~ Fixed in Phase 2: restart only drops
  the current game's events.
- ~~Minus at 0 reopens the previous game even when the other player has points in the
  current game (e.g. at 0-3), throwing those points away.~~ Found and fixed in Phase 2:
  it only reopens at 0-0.
- ~~Match point can't be undone: the summary only offers "New match".~~ Fixed in Phase 3:
  the summary has "Undo last point".
- ~~The winning point of a game can't be corrected in place; the full-screen Next overlay
  blocks the minus buttons.~~ Fixed in Phase 3: a small bar with Undo and Next game
  replaces the overlay.
- ~~`match-summary.vue` puts `<thead>` inside `<tr>` (invalid HTML).~~ Fixed in Phase 3.
- ~~`@keyup.enter` on the container `div` never fires (a div isn't focusable).~~ Removed in
  Phase 3; keyboard shortcuts are planned for Phase 6.
- ~~Missing rules: no deciding-game change of ends; 11 points and best of 5 are hardcoded.~~
  Fixed in Phase 2: the engine changes ends in the deciding game, and set-up offers 11
  or 21 points and best of 1/3/5/7.

## Code notes

- `docs/architecture.md` has Mermaid diagrams of the data model and the UI model. Update
  them in the same PR whenever the data model or the component tree changes.

- The rules live in `src/scoring/match.ts` (event log, pure functions, players A/B).
  Doubles serve order and positions are in `src/scoring/doubles.ts`, derived from the
  same log; scores, winners and ends stay per team (`DoublesTeam`, the same A/B).
- A doubles player is a `DoublesPlayer` object with `team` and `position` (1 or 2), plus
  `partner()` and an `id` such as 'A1' for keys and form values. Compare players with
  `equals()`, never `===`: two objects for the same player are different objects.
- `App.vue` holds the match and maps players to left/right for the components, which
  get everything through typed props and emits.
- `src/sharing/result.ts` packs a finished match's result into a link (`#result=…`, versioned)
  for sharing as a QR code, and validates a received one against the rules.
- `src/storage.ts` saves the app state to localStorage after every change and restores it
  on start. The save is versioned: bump `VERSION` when its shape changes, and older saves
  are ignored. Tests clear localStorage in `test/setup.ts`.
- UI tests go through `test/driver.ts` (`AppDriver`), which types and taps like a player
  and reads only what's on screen; engine rules are unit-tested in `test/scoring/`. See
  `CONTRIBUTING.md`.
- Global tokens (colours, fonts) are in `src/assets/app.css`; component styles are
  scoped. Layout switches on `(orientation: portrait)`.
