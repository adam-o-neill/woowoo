import globals from "globals";
import pluginJs from "@eslint/js";

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    files: ["**/*.js"],
    languageOptions: {
      sourceType: "module",
      ecmaVersion: 2022,
      globals: {
        ...globals.node,
        ...globals.browser,
      },
    },
    rules: {
      semi: ["error", "always"],
      "no-unused-vars": "warn",
      "no-undef": "error",
    },
  },
  pluginJs.configs.recommended,
];
