module.exports = {
  preset: "ts-jest",
  transform: {
    "^.+\\.(ts)?$": "ts-jest",
    "^.+\\.(js)$": "babel-jest",
  },
  transformIgnorePatterns: [],
  testPathIgnorePatterns: ["./src/__tests__/test.Governance.ts", "./build"],
};
