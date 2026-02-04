/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest/presets/default-esm", // Quan trọng: Preset cho ESM
  testEnvironment: "node",
  extensionsToTreatAsEsm: [".ts"], // Báo Jest coi .ts là ESM
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1", // Map import .js -> .ts
  },
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        useESM: true, // Kích hoạt mode ESM trong ts-jest
      },
    ],
  },
};
