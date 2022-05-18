import BigNumber from 'bignumber.js'
import { expect } from 'chai'
import { of, throwError } from 'rxjs'

import { getStateUnpacker } from '../helpers/testHelpers'
import { createTokenPriceInUSD$ } from './prices'

describe('createTokenPriceInUSD$', () => {
  function coinbaseOrderBook$() {
    return of({
      bids: [['1']] as [string][],
      asks: [['2']] as [string][],
    })
  }

  function coinPaprikaTicker$() {
    return of(new BigNumber('31605.56989258439'))
  }

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
        () => throwError('some error'),
        coinGeckoTicker$,
        ['MKR'],
      )

      const tokenPrice = getStateUnpacker(tokenPrice$)

      expect(tokenPrice().MKR).is.undefined
    })
  })
})
