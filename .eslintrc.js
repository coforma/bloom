module.exports = {
  parser: "@typescript-eslint/parser", // Specifies the ESLint parser
  parserOptions: {
    project: ["./tsconfig.json", "./sites/public/tsconfig.json", "./sites/partners/tsconfig.json"],
    ecmaVersion: 2018, // Allows for the parsing of modern ECMAScript features
    sourceType: "module", // Allows for the use of imports
    tsconfigRootDir: ".",
  },
  plugins: ["react", "@typescript-eslint"],
  extends: [
    "eslint:recommended", // the set of rules which are recommended for all projects by the ESLint Team
    "plugin:@typescript-eslint/eslint-recommended", // conflict resolution between above and below rulesets.
    "plugin:@typescript-eslint/recommended", // Uses the recommended rules from the @typescript-eslint/eslint-plugin
    "plugin:@typescript-eslint/recommended-requiring-type-checking", // additional rules that take a little longer to run
    "plugin:import/errors", // check for imports not resolving correctly
    "plugin:import/warnings",
    "plugin:import/typescript",
    "plugin:react-hooks/recommended", // Make sure we follow https://reactjs.org/docs/hooks-rules.html
    "prettier/@typescript-eslint", // Uses eslint-config-prettier to disable ESLint rules from @typescript-eslint/eslint-plugin that would conflict with prettier
    "plugin:prettier/recommended", // Enables eslint-plugin-prettier and displays prettier errors as ESLint errors. Make sure this is always the last configuration in the extends array.
  ],
  rules: {
    // Place to specify ESLint rules. Can be used to overwrite rules specified from the extended configs
    "@typescript-eslint/camelcase": "off",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-unused-vars": "warn",
    "react/jsx-uses-vars": "warn",
    "react/jsx-uses-react": "warn",
    "@typescript-eslint/restrict-template-expressions": [
      "error",
      {
        allowNumber: true,
        allowAny: true,
      },
    ],
    // These rules catches various usecases of variables typed as "any", since they won't be flagged by the TS
    // compiler and thus are potential sources of issues. The current codebase has too many uses of `any` to make
    // these effective rules though, so disabling them for now.
    "@typescript-eslint/no-unsafe-member-access": "off",
    "@typescript-eslint/no-unsafe-call": "off",
    "@typescript-eslint/no-unsafe-assignment": "off",
    "@typescript-eslint/no-unsafe-return": "off",
    "max-lines": [
      "error",
      {
        max: 400,
      },
    ],
    "max-lines-per-function": [
      "error",
      {
        max: 140,
      },
    ],
  },
  overrides: [
    {
      files: [
        "backend/core/test/**/*.ts",
        "backend/core/types/**/*.ts",
        "backend/core/src/seeder/**/*.ts",
        "backend/core/src/listings/tests/**/*.ts",
        "sites/partners/cypress/integration/**/*.ts",
        "sites/public/cypress/**/*.{ts,js}",
        "sites/public/pages/applications/**/*.tsx",
      ],
      rules: {
        "max-lines": "off",
        "max-lines-per-function": "off",
      },
    },
  ],
  ignorePatterns: [
    "node_modules",
    "storybook-static",
    ".next",
    "dist",
    "migration/",
    "**/*.stories.tsx",
    "**/.eslintrc.js",
    "**/*.test.*",
  ],
}
