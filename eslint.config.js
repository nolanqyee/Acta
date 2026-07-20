/**
 * @fileoverview Root ESLint flat config for the Acta Next.js app. Applies the
 * baseline: ESLint + typescript-eslint recommended rules, React Hooks rules for
 * the app's client components under `src/`, and eslint-config-prettier last so
 * formatting is owned by Prettier (ESLint checks correctness, Prettier checks
 * style). Type-aware linting and the Next plugin are intentionally deferred —
 * this is the fast baseline.
 */

import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import prettier from "eslint-config-prettier";

export default tseslint.config(
  {
    ignores: [
      "**/.next/**",
      "**/dist/**",
      "**/coverage/**",
      "**/node_modules/**",
      "next-env.d.ts",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      // TypeScript resolves identifiers; the core rule double-flags globals.
      "no-undef": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
  {
    files: ["src/**/*.{ts,tsx}"],
    plugins: { "react-hooks": reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
    },
  },
  prettier,
);
