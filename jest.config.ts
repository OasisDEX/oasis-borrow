import type { Config } from '@jest/types'
const config: Config.InitialOptions = {
  verbose: true,
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/fileTransformer.js',
  },
  moduleDirectories: ['node_modules', '<rootDir>'],
  setupFiles: ['<rootDir>/testConfigs/setup.ts'],
}

export default config
