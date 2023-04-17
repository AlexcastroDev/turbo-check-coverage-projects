const customJestConfig = {
  testEnvironment: "jsdom",
  transform: {
    "\\.ts$": ["babel-jest", { configFile: "./config/babel.config.js" }],
    "\\.tsx$": ["babel-jest", { configFile: "./config/babel.config.js" }],
  },
  modulePathIgnorePatterns: ["<rootDir>/node_modules/"],
  collectCoverageFrom: ["**/*.ts", "**/*.tsx"],
  collectCoverage: true,
  coverageReporters: ["json-summary", "text", "lcov", "cobertura"],
  coverageThreshold: {
    global: {
      branches: 36,
      functions: 47,
      lines: 53,
      statements: 53,
    },
  },
};

module.exports = customJestConfig;
