const { join } = require('path')
const { existsSync } = require('fs')
const Enzyme = require('enzyme')
const Adapter = require('enzyme-adapter-react-16')
process.env.NODE_ENV = 'test'

// if test config exists in cwd prefer this one
const testTsconfigPath = join(process.cwd(), 'tsconfig.test.json')
if (existsSync(testTsconfigPath)) {
  process.env.TS_NODE_PROJECT = testTsconfigPath
}

// we need to transpile typescript files in node_modules because some dependencies are distributed as typescript files
// transpile pg_packet-stream because it's written in TS :O
process.env.TS_NODE_IGNORE = '/^node_modules/((?!pg-packet-stream).)*$/'

module.exports = {
  require: ['ts-node/register/transpile-only', 'tsconfig-paths/register'],
  extension: ['ts'],
  watchExtensions: ['ts'],
  spec: [
    './helpers/**/*.test.ts',
    './helpers/**/*.test.tsx',
    './components/**/*.test.ts',
    './features/**/*.test.ts',
    './blockchain/**/*.test.ts',
  ],
  timeout: 1000,
}

Enzyme.configure({ adapter: new Adapter() })

// do not import files that we don't care about
function noop() {
  return null
}
require.extensions['.svg'] = noop
require.extensions['.mdx'] = noop

// setup chai
var chai = require('chai')
var sinonChai = require('sinon-chai')
chai.use(sinonChai)
