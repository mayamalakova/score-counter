# Score Counter

A table tennis scoreboard for a phone or tablet propped next to the table. Tap a half of
the screen to give that player a point, tap minus to take one back. It tracks service,
games, ends and the match result, and saves the match so a reload doesn't lose it.

Built with Vue 3, Vite, TypeScript and Vitest.

## Setup

You need Node 22 (the version is pinned in `.nvmrc`).

```bash
npm install
```

## Scripts

| Command                | What it does                                                 |
| ---------------------- | ------------------------------------------------------------ |
| `npm run dev`          | Start the dev server with hot reload at localhost:5173       |
| `npm test`             | Run the tests once with Vitest                               |
| `npm run coverage`     | Run the tests with a coverage report (fails below 90%)       |
| `npm run typecheck`    | Type-check the project with vue-tsc                          |
| `npm run lint`         | Check the code with ESLint                                   |
| `npm run format`       | Format the code with Prettier (`format:check` only checks)   |
| `npm run build`        | Build the static site into `dist/`                           |
| `npm run preview`      | Serve the built `dist/` locally to check a build             |

## Deploy

The app is a static site hosted on Netlify. Build settings are in `netlify.toml`:

- Every push to `main` deploys the live site.
- Every pull request gets its own deploy preview URL, so a change can be tried on a phone
  before it is merged.

GitHub Actions (`.github/workflows/ci.yml`) runs lint, the format check, the typecheck,
the tests with coverage, and the build on every pull request.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for the workflow, where things live and how to
write tests. The roadmap and decided stack are in [CLAUDE.md](CLAUDE.md).
