import nock from 'nock'
import { join } from 'path'

function prepareScope(scope: any) {
  if (scope.filteringPath) scope.filteringPath = new RegExp(scope.filteringPath)
}

/**
 * When used all external HTTP calls need to be mocked by nock
 */
export function nockTest(test: Function) {
  return async function (this: any) {
    const name = this.test.fullTitle()

    nock.back.fixtures = join(__dirname, '../fixtures/nocks')
    nock.back.setMode('record')
    const { nockDone } = await nock.back(`${name}.json`, { before: prepareScope })

    // Allow localhost connections but block everything else
    nock.disableNetConnect()
    nock.enableNetConnect((h) => {
      return ['localhost', '127.0.0.1'].includes(h.split(':')[0])
    })

    await test()

    nockDone()
    nock.restore()
  }
}
