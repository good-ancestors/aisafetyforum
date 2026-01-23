import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

/**
 * ESLint configuration optimized for:
 * - Next.js 16+ with App Router
 * - React 19+ with Server Components
 * - TypeScript 5 with strict mode
 * - AI-assisted coding (Claude Code) with clear, enforceable rules
 *
 * Philosophy: If a tool can enforce it, don't write prose about it.
 * These rules provide "backpressure" for AI-generated code, catching
 * common issues automatically so developers don't have to manually review.
 *
 * Thresholds are tuned for this codebase which has large form components
 * and admin pages that naturally exceed typical limits.
 */
const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  // Override default ignores
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "node_modules/**",
  ]),

  // TypeScript and code quality rules
  {
    files: ["**/*.ts", "**/*.tsx", "**/*.mts"],
    rules: {
      // === TypeScript Best Practices ===
      // Avoid 'any' - forces proper typing
      "@typescript-eslint/no-explicit-any": "warn",

      // Type definitions - off: type aliases are fine for this codebase
      "@typescript-eslint/consistent-type-definitions": "off",

      // Enforce using type imports for type-only imports
      "@typescript-eslint/consistent-type-imports": [
        "warn",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],

      // Prevent unused variables (but allow underscore prefix for intentional ignores)
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],

      // === Code Quality ===
      // Function length - off: form components are naturally long
      "max-lines-per-function": "off",

      // Limit cyclomatic complexity - warns on very complex functions
      complexity: ["warn", { max: 20 }],

      // Limit nesting depth - improves readability
      "max-depth": ["warn", { max: 5 }],

      // Magic numbers - off: too noisy for dates, styling, etc.
      "no-magic-numbers": "off",

      // === React Best Practices ===
      // Enforce exhaustive deps in useEffect/useMemo/useCallback
      "react-hooks/exhaustive-deps": "warn",

      // Ensure proper key usage in lists
      "react/jsx-key": ["error", { checkFragmentShorthand: true }],

      // Array index as key - warn only, sometimes necessary
      "react/no-array-index-key": "warn",

      // Self-closing components - auto-fixable
      "react/self-closing-comp": "warn",

      // === Import Organization ===
      // Enforce consistent import ordering (helps AI maintain consistency)
      "import/order": [
        "warn",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            ["parent", "sibling"],
            "index",
            "type",
          ],
          "newlines-between": "never",
          alphabetize: {
            order: "asc",
            caseInsensitive: true,
          },
        },
      ],

      // Prevent duplicate imports
      "import/no-duplicates": "warn",

      // === General JavaScript Best Practices ===
      // Prefer const over let
      "prefer-const": "error",

      // No var - use const/let
      "no-var": "error",

      // Prefer arrow functions for callbacks
      "prefer-arrow-callback": "warn",

      // Use template literals instead of string concatenation
      "prefer-template": "warn",

      // Enforce strict equality
      eqeqeq: ["error", "always", { null: "ignore" }],

      // Console - off: logging is acceptable
      "no-console": "off",

      // Async/await - off: Next.js patterns don't always use await
      "require-await": "off",
      "no-return-await": "off",
    },
  },

  // Relaxed rules for scripts
  {
    files: ["scripts/**/*.ts", "prisma/**/*.ts"],
    rules: {
      complexity: "off",
    },
  },

  // Config files
  {
    files: ["*.config.ts", "*.config.mjs", "*.config.js"],
    rules: {
      "import/order": "off",
    },
  },

  // Test files
  {
    files: ["**/*.test.ts", "**/*.test.tsx", "**/*.spec.ts", "**/*.spec.tsx"],
    rules: {
      complexity: "off",
    },
  },
]);

export default eslintConfig;
