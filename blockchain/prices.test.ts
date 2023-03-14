import BigNumber from 'bignumber.js'
import { expect } from 'chai'
import { mockContextConnected } from 'helpers/mocks/context.mock'
import { getStateUnpacker } from 'helpers/testHelpers'
import moment from 'moment'
import { Observable, of, throwError } from 'rxjs'
import sinon from 'sinon'

import { createOraclePriceData$, createTokenPriceInUSD$, OraclePriceData } from './prices'

describe('createTokenPriceInUSD$', () => {
  const tokenTickers$ = of({
    'mkr-usd': new BigNumber('929.26'),
    'steth-lido-staked-ether': new BigNumber('1462.87'),
    'wrapped-steth': new BigNumber('1573.93'),
  })

  it('maps token price to coinbase ticker', () => {
    const tokenPrice$ = createTokenPriceInUSD$(of(null), tokenTickers$, ['MKR'])

    const tokenPrice = getStateUnpacker(tokenPrice$)

    expect(tokenPrice().MKR.toString()).eq('929.26')
  })

  it('maps token price to coin paprika ticker', () => {
    const tokenPrice$ = createTokenPriceInUSD$(of(null), tokenTickers$, ['STETH'])

    const tokenPrice = getStateUnpacker(tokenPrice$)

    expect(tokenPrice().STETH.toString()).eq('1462.87')
  })

  it('maps token price to coingecko ticker', () => {
    const tokenPrice$ = createTokenPriceInUSD$(of(null), tokenTickers$, ['WSTETH'])

    const tokenPrice = getStateUnpacker(tokenPrice$)

    expect(tokenPrice().WSTETH.toString()).eq('1573.93')
  })

  it('handles concurrent token price requests', () => {
    const tokenPrice$ = createTokenPriceInUSD$(of(null), tokenTickers$, ['MKR', 'STETH'])

    const tokenPrice = getStateUnpacker(tokenPrice$)

    expect(tokenPrice().MKR.toString()).eq('929.26')
    expect(tokenPrice().STETH.toString()).eq('1462.87')
  })

  describe('maps unknown quantities to undefined', () => {
    it('handles token with no ticker configured', () => {
      const tokenPrice$ = createTokenPriceInUSD$(of(null), tokenTickers$, ['BAT'])

      const tokenPrice = getStateUnpacker(tokenPrice$)

      expect(tokenPrice().BAT).is.undefined
    })

    it('handles no response from service', () => {
      const tokenPrice$ = createTokenPriceInUSD$(of(null), throwError('some error'), ['MKR'])

      const tokenPrice = getStateUnpacker(tokenPrice$)

      expect(tokenPrice().MKR).is.undefined
    })
  })
})

describe('createOraclePriceData$', () => {
  let getCodeStub: sinon.SinonStub
  beforeEach(() => {
    getCodeStub = sinon
      .stub(mockContextConnected.web3.eth, 'getCode')
      // @ts-ignore
      .callsFake((address, callback?: (error: Error, code: string) => void) => {
        // @ts-ignore
        callback && callback(null, Array(6001).fill(0).join(''))
      })
  })
  afterEach(() => {
    getCodeStub.restore()
  })
  it('does not regress', () => {
    const oraclePriceData$ = createOraclePriceData$(
      of(mockContextConnected),
      () => of(['1000', true]),
      () => of(['100000000', true]),
      () => of(new BigNumber('1657811932000')),
      () => of(new BigNumber('3600000')),
      {
        token: 'ETH',
        requestedData: [
          'currentPrice',
          'nextPrice',
          'currentPriceUpdate',
          'nextPriceUpdate',
          'priceUpdateInterval',
          'isStaticPrice',
          'percentageChange',
        ],
      },
    )
    const result = getStateUnpacker(oraclePriceData$)()

    expect(result.currentPrice?.toString()).eq('0.000000000000001')
    expect(result.nextPrice?.toString()).eq('0.0000000001')
    expect(moment(result.currentPriceUpdate).unix()).eq(1657811932)
    expect(moment(result.nextPriceUpdate).unix()).eq(1657815532)
    expect(result.priceUpdateInterval?.toString()).eq('3600000')
    expect(result.isStaticPrice).eq(false)
    expect(result.percentageChange?.toString()).eq('99999')
  })

  describe('only calling what it needs', () => {
    let pipes: {
      peek$: () => Observable<[string, boolean]>
      peep$: () => Observable<[string, boolean]>
      zzz$: () => Observable<BigNumber>
      hop$: () => Observable<BigNumber>
    }
    beforeEach(() => {
      pipes = {
        peek$: sinon.stub().returns(of(['1000', true])),
        peep$: sinon.stub().returns(of(['100000000', true])),
        zzz$: sinon.stub().returns(of(new BigNumber('1657811932000'))),
        hop$: sinon.stub().returns(of(new BigNumber('3600000'))),
      }
    })

    type TestCase = {
      requestedValue: keyof OraclePriceData
      runAssertion: (result: Partial<OraclePriceData>) => void
      streamsNotCalled: Array<keyof typeof pipes>
      streamsCalled: Array<keyof typeof pipes>
    }

    function runTest({ requestedValue, runAssertion, streamsCalled, streamsNotCalled }: TestCase) {
      const oraclePriceData$ = createOraclePriceData$(
        of(mockContextConnected),
        pipes.peek$,
        pipes.peep$,
        pipes.zzz$,
        pipes.hop$,
        {
          token: 'ETH',
          requestedData: [requestedValue],
        },
      )

      const result = getStateUnpacker(oraclePriceData$)()

      streamsCalled.forEach((stream$) => {
        expect(pipes[stream$], stream$).to.have.been.calledOnce
      })

      streamsNotCalled.forEach((stream$) => {
        expect(pipes[stream$], stream$).not.to.have.been.called
      })
      runAssertion(result)
    }

    it('only calls peek$ for currentPrice', () => {
      runTest({
        requestedValue: 'currentPrice',
        runAssertion: (result) => expect(result.currentPrice?.toString()).eq('0.000000000000001'),
        streamsCalled: ['peek$'],
        streamsNotCalled: ['peep$', 'zzz$', 'hop$'],
      })
    })

    it('calls peek$ and peep$ for nextPrice', () => {
      runTest({
        requestedValue: 'nextPrice',
        runAssertion: (result) => expect(result.nextPrice?.toString()).eq('0.0000000001'),
        streamsCalled: ['peek$', 'peep$'],
        streamsNotCalled: ['zzz$', 'hop$'],
      })
    })

    it('calls zzz for currentPriceUpdate', () => {
      runTest({
        requestedValue: 'currentPriceUpdate',
        runAssertion: (result) => expect(moment(result.currentPriceUpdate).unix()).eq(1657811932),
        streamsCalled: ['zzz$'],
        streamsNotCalled: ['hop$', 'peek$', 'peep$'],
      })
    })

    it('calls zzz$ and hop$ for currentPriceUpdate', () => {
      runTest({
        requestedValue: 'nextPriceUpdate',
        runAssertion: (result) => expect(moment(result.nextPriceUpdate).unix()).eq(1657815532),
        streamsCalled: ['zzz$', 'hop$'],
        streamsNotCalled: ['peek$', 'peep$'],
      })
    })

    it('calls zzz$ and hop$ for priceUpdateInterval', () => {
      runTest({
        requestedValue: 'priceUpdateInterval',
        runAssertion: (result) => expect(result.priceUpdateInterval?.toString()).eq('3600000'),
        streamsCalled: ['hop$'],
        streamsNotCalled: ['zzz$', 'peek$', 'peep$'],
      })
    })

    it('calls peek$ and peep$ for percentageChange', () => {
      runTest({
        requestedValue: 'percentageChange',
        runAssertion: (result) => expect(result.percentageChange?.toString()).eq('99999'),
        streamsCalled: ['peek$', 'peep$'],
        streamsNotCalled: ['zzz$', 'hop$'],
      })
    })
  })
})
