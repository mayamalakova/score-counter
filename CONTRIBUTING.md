# Contributing

Score Counter is a personal project by Maya Malakova. This guide is for anyone working on
it, including Claude Code sessions and future-Maya. The plan, the decided stack and the
known-bugs list live in [`CLAUDE.md`](CLAUDE.md); read it first.

## Setup

You need Node 22 (pinned in `.nvmrc`).

```bash
npm install
npm run dev
```

The dev server runs at http://localhost:5173.

## Before you push

Run what CI runs:

```bash
npm run lint
npm run format:check
npm run typecheck
npm run coverage
npm run build
```

`npm run format` fixes formatting, and `npm run lint -- --fix` fixes what ESLint can.

## Workflow

- **Planned work lives in GitHub issues**, tracked on the project board under the repo's
  [Projects tab](https://github.com/mayamalakova/score-counter/projects). Start from an
  issue (or open one first), and close it from the PR with `Closes #N` in the
  description.
- **One branch and one PR per phase**, or per feature from Phase 6 on. Don't pull work
  forward from later phases.
- **Only Maya merges.** Contributors, including Claude, push feature branches and open
  PRs; nobody else merges, enables auto-merge or pushes to `main`.
- **CI** (GitHub Actions) runs the checks above on every PR. **Netlify** builds a preview
  for every PR once the repo is connected; try changes on a phone next to a table.
- **Commits** are small and focused, and the message says why, not just what.
- **Dependencies:** ask before adding one that isn't listed under "Target stack" in
  `CLAUDE.md`.
- **Known bugs:** keep the list in `CLAUDE.md` current. Add bugs you find, strike them
  when fixed, and say in the PR which ones it fixes.

## Where things live

[docs/architecture.md](docs/architecture.md) has diagrams of the data model and the UI
model. Update them when either changes.

| Path                     | What it is                                                              |
| ------------------------ | ----------------------------------------------------------------------- |
| `src/scoring/match.ts`   | The scoring engine: a match is settings plus an event log, and pure functions derive score, winners, server and ends. No Vue. |
| `src/scoring/doubles.ts` | Doubles: who serves to whom and where each player stands, derived from the same log. |
| `src/App.vue`            | Holds the match, maps players A/B to left/right, and wires up the screens. |
| `src/components/`        | The screens and their parts. Typed props and emits, scoped styles.       |
| `src/sharing/result.ts` | Packs a result into a link for the QR code, and checks a received one. |
| `src/storage.ts`         | Autosave to `localStorage`, versioned and validated on load.             |
| `src/i18n/`              | Every text on screen in English, Czech and Bulgarian, and the language.  |
| `src/fullscreen.ts`      | Full screen through the browser's Fullscreen API, where it's supported.  |
| `src/wakeLock.ts`        | Keeps the screen on during play (Screen Wake Lock API), where supported. |
| `src/assets/app.css`     | Global tokens (colours, fonts) and base styles.                          |
| `test/scoring/`          | Unit tests for the engine.                                               |
| `test/driver.ts`         | Drives the app through its UI for the screen and flow tests.             |
| `test/*.spec.ts`         | Flow, screen, autosave and storage tests.                                |

## Tests

- **Behaviour changes need a test**, and refactors keep the existing tests green.
- **Rules** (scoring, service, ends) are tested on the engine in `test/scoring/`,
  without mounting anything. The `play(match, 'AAB')` helper scores points in order.
- **Anything a player sees or taps** is tested through `AppDriver` in `test/driver.ts`:
  it fills in set-up, taps points and buttons, and reads names, scores and the server
  from the screen. Don't reach into `App.vue`'s internals from tests.
- **Test isolation:** `test/setup.ts` clears `localStorage` before every test, because
  the app autosaves.
- **Coverage:** `npm run coverage` fails below 90%, and the HTML report lands in
  `coverage/`.

## Things that are easy to miss

- **Changing what's saved:** if you change the shape of the saved state in
  `src/storage.ts`, bump `VERSION`. Older saves are then ignored instead of misread.
- **Portrait layout:** it switches on `@media (orientation: portrait)`. Check both
  orientations when you change the scoreboard.
- **Doubles positions** assume the phone is on the table's near long side (the screen's
  bottom edge). A player's right half-court is the near half at the left end and the far
  half at the right end; upright, the picture is turned a quarter turn.
- **Comparing doubles players:** use `a.equals(b)`, not `a === b`. Saved and restored
  players are new objects, so `===` is false even for the same player.
- **Motion:** the server ball's hop respects `prefers-reduced-motion`; keep it that way
  for new animations.
- **Line endings:** `.gitattributes` stores text files with LF on every OS.
