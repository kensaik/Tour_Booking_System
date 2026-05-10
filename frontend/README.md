# Frontend

React + TypeScript + React Router app (Vite). Stack locked per
`plans/tour-booking/phase-00-foundation.md` §0.5.

This directory currently holds **lint configuration only**. The Vite app will
be scaffolded into this folder by Quân (Phase 0.5).

## Bootstrap (one-time, by Quân)

From the repo root:

```bash
# Scaffold Vite + React + TypeScript directly into frontend/
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install
```

When Vite prompts about overwriting, **keep** the existing files
(`eslint.config.mjs`, `.prettierrc.json`, `.prettierignore`, `README.md`,
`.gitkeep`). If Vite generates its own `eslint.config.js`, delete it in favor
of the `.mjs` flat config already in place.

Then add the locked-stack runtime deps and lint dev deps:

```bash
# Runtime
npm install react-router-dom @tanstack/react-query @tanstack/react-query-devtools \
            zustand axios

# Lint + format dev deps (matches eslint.config.mjs)
npm install -D eslint typescript-eslint @eslint/js \
               eslint-plugin-react eslint-plugin-react-hooks \
               eslint-plugin-react-refresh \
               eslint-config-prettier prettier globals
```

## Add scripts to `package.json`

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "format": "prettier --write .",
    "format:check": "prettier --check ."
  }
}
```

## Daily commands

```bash
npm run dev           # start dev server
npm run lint          # ESLint check
npm run lint:fix      # ESLint auto-fix
npm run format        # Prettier write
npm run format:check  # Prettier check (used in CI)
```

## Files in this folder

- `eslint.config.mjs` — ESLint v9 flat config, React + TS rules, Prettier-compatible.
- `.prettierrc.json` — Prettier rules (100-col, double quotes, trailing commas).
- `.prettierignore` — paths Prettier should skip.
- `.gitkeep` — placeholder until Vite scaffold lands.

## Testing

Two-layer regression suite — Vitest (unit/component) and Playwright (E2E). See `docs/test-plan.md §5.4.3` for the rationale and CI gates.

### Unit + component tests (Vitest)

```bash
npm run test:unit              # one-shot run
npm run test:unit:watch        # watch mode
npm run test:unit:coverage     # coverage gate (≥70% lines/statements)
```

Scope: pure logic (`src/lib/**`, `src/stores/**`) and high-risk forms (`RegisterPage`, `CheckoutPage`). Uses jsdom + RTL — no backend needed.

### E2E tests (Playwright)

Requires backend + frontend running locally.

```bash
# 1. Start backend (separate terminal)
cd ../backend
python -m database.seed   # idempotent — creates schema + seed users/tours
python run.py             # serves http://localhost:5000

# 2. Start frontend (separate terminal)
npm run dev               # serves http://localhost:5173 — or:
npm run build && npm run preview -- --port 5173

# 3. Install Playwright browsers (first time only)
npm run test:e2e:install

# 4. Run tests
npm run test:e2e          # headless Chromium
npm run test:e2e:ui       # Playwright UI mode
npm run test:e2e:headed   # headed Chromium (debug)
```

Specs live in `e2e/`:

- `auth.spec.ts` — login + role redirect
- `guest-booking.spec.ts` — guest booking happy path + error path (mocked 500)
- `company-crud.spec.ts` — company adds a tour
- `admin.spec.ts` — admin approves pending company
- `visual.spec.ts` — responsive screenshot smoke at 375 / 768 / 1280px

### Updating Playwright visual baselines

```bash
npm run test:e2e -- --update-snapshots
```

Inspect generated `e2e/visual.spec.ts-snapshots/*.png` before committing. Baselines are platform-specific — regenerate on Linux (CI runner) when layout changes meaningfully.

### CI

- `frontend-unit` — Vitest + 70% coverage gate (blocks PR if below)
- `frontend-e2e` — Playwright (5 specs) against real Flask + MySQL service container

Both jobs are required for merge to `main`.

