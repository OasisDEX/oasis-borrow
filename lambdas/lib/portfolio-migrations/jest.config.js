/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  maxWorkers: 1,
  testTimeout: 10000,
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    // '^.+\\.[tj]sx?$' to process js/ts with `ts-jest`
    // '^.+\\.m?[tj]sx?$' to process js/ts/mjs/mts with `ts-jest`
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: {
        }
      },
    ],
  },
};
