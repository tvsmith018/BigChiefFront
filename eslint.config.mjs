import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { FlatCompat } from "@eslint/eslintrc";
import boundaries from "eslint-plugin-boundaries";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "public/assets/**",
      "src/_utilities/datePicker/*.js",
    ],
  },
  ...compat.extends(
    "next/core-web-vitals",
    "next/typescript",
    "plugin:jsx-a11y/recommended",
  ),
  {
    files: ["src/**/*.{ts,tsx}"],
    plugins: {
      boundaries,
    },
    settings: {
      "boundaries/elements": [
        { type: "app", pattern: "src/app/**" },
        { type: "views", pattern: "src/_views/**" },
        { type: "services", pattern: "src/_services/**" },
        { type: "network", pattern: "src/_network/**" },
        { type: "store", pattern: "src/_store/**" },
        { type: "navigation", pattern: "src/_navigation/**" },
        { type: "core", pattern: "src/_core/**" },
        { type: "utilities", pattern: "src/_utilities/**" },
        { type: "queries", pattern: "src/_queries/**" },
        { type: "types", pattern: "src/_types/**" },
      ],
    },
    rules: {
      "boundaries/element-types": [
        "error",
        {
          default: "allow",
          rules: [
            {
              from: "network",
              disallow: ["app", "views"],
              message:
                "Network layer should stay infrastructure-only; do not depend on route/view layer.",
            },
            {
              from: "store",
              disallow: ["app", "views"],
              message:
                "Store layer should be framework-agnostic; avoid direct imports from app/views.",
            },
          ],
        },
      ],
      "boundaries/no-private": "error",
    },
  },
  {
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/_navigation/*"],
              message: "Import navigation only via @/_navigation",
            },
          ],
        },
      ],
    },
  },
];

export default eslintConfig;
