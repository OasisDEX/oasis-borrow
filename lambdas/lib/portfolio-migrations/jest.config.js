/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  workerThreads: true,
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
