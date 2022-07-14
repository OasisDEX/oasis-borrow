import BigNumber from 'bignumber.js'
import { expect } from 'chai'
import { of, throwError } from 'rxjs'

import { getStateUnpacker } from '../helpers/testHelpers'
import { createOraclePriceData$, createTokenPriceInUSD$ } from './prices'
import { mockContext, mockContextConnected } from '../helpers/mocks/context.mock'
import sinon from 'sinon'

describe('createTokenPriceInUSD$', () => {
  function coinbaseOrderBook$() {
    return of({
      bids: [['1']] as [string][],
      asks: [['2']] as [string][],
    })
  }

  const coinPaprikaTicker$ = of({ 'steth-lido-staked-ether': new BigNumber('31605.56989258439') })

  function coinGeckoTicker$() {
    return of(new BigNumber('1947.78'))
  }

  it('maps token price from coinbase', () => {
    const tokenPrice$ = createTokenPriceInUSD$(
      of(null),
      coinbaseOrderBook$,
      coinPaprikaTicker$,
      coinGeckoTicker$,
      ['MKR'],
    )

    const tokenPrice = getStateUnpacker(tokenPrice$)

    expect(tokenPrice().MKR.toString()).eq('1.5')
  })

  it('maps token price from coinpaprika', () => {
    const tokenPrice$ = createTokenPriceInUSD$(
      of(null),
      coinbaseOrderBook$,
      coinPaprikaTicker$,
      coinGeckoTicker$,
      ['STETH'],
    )

    const tokenPrice = getStateUnpacker(tokenPrice$)

    expect(tokenPrice().STETH.toString()).eq('31605.56989258439')
  })

  it('maps token price from coingecko', () => {
    const tokenPrice$ = createTokenPriceInUSD$(
      of(null),
      coinbaseOrderBook$,
      coinPaprikaTicker$,
      coinGeckoTicker$,
      ['WSTETH'],
    )

    const tokenPrice = getStateUnpacker(tokenPrice$)

    expect(tokenPrice().WSTETH.toString()).eq('1947.78')
  })

  it('handles concurrent token price requests', () => {
    const tokenPrice$ = createTokenPriceInUSD$(
      of(null),
      coinbaseOrderBook$,
      coinPaprikaTicker$,
      coinGeckoTicker$,
      ['MKR', 'STETH'],
    )

    const tokenPrice = getStateUnpacker(tokenPrice$)

    expect(tokenPrice().MKR.toString()).eq('1.5')
    expect(tokenPrice().STETH.toString()).eq('31605.56989258439')
  })

  describe('mapping unknown quantities to undefined', () => {
    it('handles token with no ticker configured', () => {
      const tokenPrice$ = createTokenPriceInUSD$(
        of(null),
        coinbaseOrderBook$,
        coinPaprikaTicker$,
        coinGeckoTicker$,
        ['BAT'],
      )

      const tokenPrice = getStateUnpacker(tokenPrice$)

      expect(tokenPrice().BAT).is.undefined
    })

    it('handles no response from service', () => {
      const tokenPrice$ = createTokenPriceInUSD$(
        of(null),
        () => throwError('some error'),
        throwError('some error'),
        coinGeckoTicker$,
        ['MKR'],
      )

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
    expect(result.currentPriceUpdate?.toString()).eq(
      'Thu Jul 14 2022 16:18:52 GMT+0100 (British Summer Time)',
    )
    expect(result.nextPriceUpdate?.toString()).eq(
      'Thu Jul 14 2022 17:18:52 GMT+0100 (British Summer Time)',
    )
    expect(result.priceUpdateInterval?.toString()).eq('3600000')
    expect(result.isStaticPrice).eq(false)
    expect(result.percentageChange?.toString()).eq('99999')
  })

  describe('only calling what it needs', () => {
    it('only calls peek$ for currentPrice', () => {
      const peek$ = sinon.stub().returns(of(['1000', true]))
      const peep$ = sinon.stub().returns(of(['100000000', true]))
      const zzz$ = sinon.stub().returns(of(new BigNumber('1657811932000')))
      const hop$ = sinon.stub().returns(of(new BigNumber('3600000')))
      const oraclePriceData$ = createOraclePriceData$(
        of(mockContextConnected),
        peek$,
        peep$,
        zzz$,
        hop$,
        {
          token: 'ETH',
          requestedData: ['currentPrice'],
        },
      )

      const result = getStateUnpacker(oraclePriceData$)()

      expect(peek$).to.have.been.calledOnce
      expect(peep$).not.to.have.been.called
      expect(zzz$).not.to.have.been.called
      expect(hop$).not.to.have.been.called
      expect(result.currentPrice?.toString()).eq('0.000000000000001')
    })

    it('calls peek$ and peep$ for nextPrice', () => {
      const peek$ = sinon.stub().returns(of(['1000', true]))
      const peep$ = sinon.stub().returns(of(['100000000', true]))
      const zzz$ = sinon.stub().returns(of(new BigNumber('1657811932000')))
      const hop$ = sinon.stub().returns(of(new BigNumber('3600000')))
      const oraclePriceData$ = createOraclePriceData$(
        of(mockContextConnected),
        peek$,
        peep$,
        zzz$,
        hop$,
        {
          token: 'ETH',
          requestedData: ['nextPrice'],
        },
      )

      const result = getStateUnpacker(oraclePriceData$)()

      expect(peek$).to.have.been.calledOnce
      expect(peep$).to.have.been.calledOnce
      expect(zzz$).not.to.have.been.called
      expect(hop$).not.to.have.been.called

      expect(result.nextPrice?.toString()).eq('0.0000000001')
    })
  })
})
