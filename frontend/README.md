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
