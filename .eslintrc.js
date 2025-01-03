module.exports = {
  parser: "@typescript-eslint/parser", // Use the TypeScript parser
  parserOptions: {
    ecmaVersion: "latest", // Or 2021, 2022, etc.
    sourceType: "module", // or 'script' if you’re not using ES modules
    // project: ["./tsconfig.json"], // Ensures rules like "no-floating-promises" work
  },
  env: {
    es2021: true,
    node: true, // Node.js global variables & Node.js scoping
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    // ^ enables the recommended rules from the @typescript-eslint/eslint-plugin
  ],
  rules: {
    // Add your own custom rules here
    // e.g. "@typescript-eslint/no-explicit-any": "off",
  },
};
