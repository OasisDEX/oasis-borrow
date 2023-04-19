import nextJest from 'next/jest'
import type { JestConfigWithTsJest } from 'ts-jest'

const config: JestConfigWithTsJest = {
  verbose: true,
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transform: {
    // 'node_modules/(@web3-onboard)/.+\\.(js|jsx|ts|tsx)$': [
    //   'ts-jest',
    //   { tsconfig: 'tsconfig.test.json', diagnostics: true },
    // ],
    // '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }],
    // '^.+\\.(j|t)sx?$': ['ts-jest', { tsconfig: 'tsconfig.test.json', diagnostics: true }],
    '^.+\\.(js|jsx|ts|tsx)$': ['ts-jest', { tsconfig: 'tsconfig.test.json', diagnostics: true }],
    '\\.(mdx|jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/file-transformer.js',
  },
  moduleDirectories: ['node_modules', '<rootDir>'],
  //transformIgnorePatterns: ['<rootDir>/node_modules/((?!@web3-onboard).)*$/'],
  // transformIgnorePatterns: [],
  // moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  setupFilesAfterEnv: ['<rootDir>/test-configs/setup.ts'],
  testTimeout: 1000,
  // moduleNameMapper: {
  //   '@web3-onboard/react': require.resolve('@web3-onboard/react'),
  // },
  // testEnvironment: 'jsdom',
  // transform: {
  //   'node_modules/(@web3-onboard)/.+\\.(j|t)sx?$': ['babel-jest', { presets: ['next/babel'] }],
  //   '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }],
  //   '\\.(mdx|jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
  //     '<rootDir>/file-transformer.js',
  // },
}

const createJestConfig = nextJest({
  dir: './',
})

export default createJestConfig(config)
