import { expect } from 'chai'
import { describe, it } from 'mocha'
import request from 'supertest'

import { destroyTestCtx, setupTestCtx, TestCtx } from '../test-utils'

describe('health/ handler', () => {
  let testCtx: TestCtx

  beforeEach(async () => {
    testCtx = await setupTestCtx({})
  })
  afterEach(() => destroyTestCtx(testCtx))

  it('responds 200 GET', async () => {
    const res = await request(testCtx.app).get('/api/health').send()
    expect(res.body).to.be.deep.eq({
      status: 200,
      message: 'Everything is okay!',
    })
  })
})
