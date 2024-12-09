/**
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

/** @type {import('jest').Config} */
const config = {
  preset: "ts-jest",
  testEnvironment: "node",
  verbose: true, // Optional: Enable verbose output
  collectCoverage: true, // Optional: Enable coverage reports
  setupFilesAfterEnv: ["<rootDir>/test/jest-setup.ts"],
};

module.exports = config;
