/** @type {import('jest').Config} */
module.exports = {
  moduleFileExtensions: ["js", "json", "ts"],
  rootDir: "src",
  testRegex: ".*\\.spec\\.ts$",
  transform: {
    "^.+\\.(t|j)s$": [
      "ts-jest",
      {
        tsconfig: "<rootDir>/../tsconfig.json",
      },
    ],
  },
  collectCoverageFrom: ["**/*.(t|j)s", "!**/*.spec.ts", "!main.ts"],
  coverageDirectory: "../coverage",
  testEnvironment: "node",
  clearMocks: true,
  moduleNameMapper: {
    "^@invite/shared$": "<rootDir>/../../packages/shared/src/index.ts",
  },
};
