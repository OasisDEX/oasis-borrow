import { expect } from 'chai'
import { describe, it } from 'mocha'
import { nockTest } from 'server-test-e2e/test-utils/nockTest'
import request from 'supertest'

import { destroyTestCtx, setupTestCtx, TestCtx } from '../test-utils'

describe('onramp orders', () => {
  let testCtx: TestCtx

  beforeEach(async () => {
    testCtx = await setupTestCtx({})
  })
  afterEach(() => destroyTestCtx(testCtx))

  it(
    'creates wyre reservation',
    nockTest(async () => {
      const address = '0x1234567890123456789012345678901234567890'
      const body = {
        amount: '1',
        recipient: address,
        sourceCurrency: 'USD',
        destCurrency: 'DAI',
        network: 'kovan',
        redirectUrl: '',
        failureRedirectUrl: '',
      }
      const response = await request(testCtx.app).post(`/api/new_wyre_order`).send(body)
      expect(response.status).to.equal(201)
      expect(response.body.url).to.contain(address)
      expect(response.body.reservation).to.equal('FOO')
    }),
  )

  it('creates invalid wyre reservation', async () => {
    const response = await request(testCtx.app).post(`/api/new_wyre_order`).send()
    expect(response.status).to.equal(500)
  })

  it(
    'webhook creates wyre order',
    nockTest(async () => {
      const body = {
        accountId: process.env.TESTWYRE_ACCOUNT_ID,
        orderId: 'ABC',
        transferId: 'TF_XYZ',
        orderStatus: 'PROCESSING',
        reservation: 'RESERVATION_001',
      }
      const response = await request(testCtx.app)
        .post(`/api/wyre?type=testwyre&key=${process.env.WYRE_WEBHOOK_KEY}`)
        .send(body)
      expect(response.status).to.equal(201)
    }),
  )

  it('webhook creates wyre order without auth', async () => {
    const response = await request(testCtx.app).post(`/api/wyre?type=testwyre`).send()
    expect(response.status).to.equal(401)
  })

  it('webhook creates wyre order without type', async () => {
    const response = await request(testCtx.app)
      .post(`/api/wyre?key=${process.env.WYRE_WEBHOOK_KEY}`)
      .send()
    expect(response.status).to.equal(500)
  })

  it('gets orders for an address', async () => {
    const expectedResponse = {
      id: 'RESERVATION_002',
      status: 'pending',
      amount: '1',
      type: 'wyre',
    }
    const address = '0x1234567890123456789012345678901234567890'
    const response = await request(testCtx.app).get(`/api/order/${address}`).send()
    expect(response.status).to.equal(200)
    expect({ ...response.body[0], date: undefined }).to.containSubset(expectedResponse)
  })
})
