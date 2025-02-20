/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  testEnvironment: "node",
  reporters: [
    ["jest-simple-dot-reporter", {"color": true}]
  ],
  transform: {
    "^.+.tsx?$": [
      "ts-jest",
      {
        tsconfig: 'tsconfig.json'
      }
    ],
  },
};