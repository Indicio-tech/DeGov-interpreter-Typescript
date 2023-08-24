module.exports = {
  preset: "ts-jest",
  transform: {
    "^.+\\.(ts)?$": "ts-jest",
  },
  transformIgnorePatterns: [],
  testPathIgnorePatterns: ["./src/__tests__/test.Governance.ts", "./build"],
}
