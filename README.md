# Score Counter

A table tennis scoreboard for a phone or tablet propped next to the table. Tap a half of
the screen to give that player a point, tap minus to take one back. It tracks service,
games, ends and the match result.

Built with Vue 3, Vite, TypeScript and Vitest.

## Setup

You need Node 22 (the version is pinned in `.nvmrc`).

```bash
npm install
```

## Scripts

| Command             | What it does                                            |
| ------------------- | ------------------------------------------------------- |
| `npm run dev`       | Start the dev server with hot reload at localhost:5173 |
| `npm test`          | Run the tests once with Vitest                          |
| `npm run typecheck` | Type-check the project with vue-tsc                     |
| `npm run build`     | Build the static site into `dist/`                      |
| `npm run preview`   | Serve the built `dist/` locally to check a build        |

## Deploy

The app is a static site hosted on Netlify. Build settings are in `netlify.toml`:

- Every push to `main` deploys the live site.
- Every pull request gets its own deploy preview URL, so a change can be tried on a phone
  before it is merged.

GitHub Actions (`.github/workflows/ci.yml`) runs the typecheck, tests and build on every
pull request.
