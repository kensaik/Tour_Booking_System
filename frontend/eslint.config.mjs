// ESLint v9 flat config for the React + TypeScript + React Router frontend.
// Stack is locked per Phase 0.5: Vite + TypeScript + React Router + TanStack Query + Zustand.
//
// Install matching dev deps:
//   npm install -D eslint typescript-eslint @eslint/js eslint-plugin-react \
//                  eslint-plugin-react-hooks eslint-plugin-react-refresh \
//                  eslint-config-prettier globals
//
// Run:  npm run lint
//
import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import prettier from "eslint-config-prettier";

export default tseslint.config(
  // Ignore build artefacts and vendored output
  {
    ignores: [
      "dist",
      "build",
      "coverage",
      "node_modules",
      "*.config.js",
      "*.config.cjs",
    ],
  },

  // Base recommended rules (JS + TS)
  js.configs.recommended,
  ...tseslint.configs.recommended,

  // React-specific
  {
    files: ["**/*.{ts,tsx,js,jsx}"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: { ...globals.browser, ...globals.es2022 },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      react,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    settings: {
      react: { version: "detect" },
    },
    rules: {
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      "react/react-in-jsx-scope": "off", // Vite + React 17+ JSX runtime
      "react/prop-types": "off", // we use TypeScript
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/consistent-type-imports": [
        "warn",
        { prefer: "type-imports" },
      ],
    },
  },

  // Disable stylistic rules that conflict with Prettier — keep this LAST.
  prettier,
);
