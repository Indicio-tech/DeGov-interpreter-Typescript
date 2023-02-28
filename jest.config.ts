module.exports = {
  preset: "ts-jest",
  transform: {
    "^.+\\.(ts)?$": "ts-jest",
    "^.+\\.(js)$": "babel-jest",
  },
  transformIgnorePatterns: [],
  testPathIgnorePatterns: ["<rootDir>/src/__tests__/test.Governance.ts"],
};
