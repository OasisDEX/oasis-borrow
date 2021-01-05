const { join } = require('path')
const { existsSync } = require('fs')
process.env.NODE_ENV = 'test'

require('dotenv-flow').config({ path: join(__dirname, '../') })

// if test config exists in cwd prefer this one
const testTsconfigPath = join(process.cwd(), 'tsconfig.test.json')
if (existsSync(testTsconfigPath)) {
  process.env.TS_NODE_PROJECT = testTsconfigPath
}

module.exports = {
  require: ['ts-node/register/transpile-only', 'tsconfig-paths/register', 'earljs/mocha'],
  extension: ['ts'],
  watchExtensions: ['ts'],
  spec: ['server-test-e2e/**/*.test.ts'],
  timeout: 10000,
}

// setup chai
var chai = require('chai')
var chaiSubset = require('chai-subset')
chai.use(chaiSubset)
