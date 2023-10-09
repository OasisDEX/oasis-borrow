import type { Config } from '@jest/types'
import nextJest from 'next/jest'

const config: Config.InitialOptions = {
  transform: {
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/file-transformer.js',
  },
  moduleDirectories: ['node_modules', '<rootDir>'],

  testTimeout: 1000,
  testEnvironment: 'jest-environment-jsdom',
  setupFiles: ['jest-canvas-mock'],
  setupFilesAfterEnv: ['<rootDir>/test-configs/setup.ts'],
  collectCoverage: true,
}

const createJestConfig = nextJest({
  dir: './',
})

const finalConfig = async (): Promise<Config.InitialOptions> => {
  const nextConfig: Config.InitialOptions = await createJestConfig(config)()
  return {
    ...nextConfig,
    transformIgnorePatterns: [
      '/node_modules/(?!(@web3-onboard|nanoid|ramda|uint8arrays|multiformats|@walletconnect)/)',
    ],
  }
}

export default finalConfig
