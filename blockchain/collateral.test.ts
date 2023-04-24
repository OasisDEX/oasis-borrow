import BigNumber from 'bignumber.js'
import { expect } from 'chai'
import { getStateUnpacker } from 'helpers/testHelpers'
import { Observable, of, throwError } from 'rxjs'

import { getTotalValueLocked$ } from './collateral'
import { OraclePriceData, OraclePriceDataArgs } from './prices'

describe('getTotalValueLocked$', () => {
  it('should return collateral times current price from oracle', () => {
    function getCollateralLocked$(ilk: string) {
      if (ilk === 'ilk') {
        return of({
          ilk: 'ilk',
          token: 'token',
          collateral: new BigNumber(3),
        })
      }
      return throwError(new Error('Not found'))
    }
    function mockOraclePriceData$({ token }: OraclePriceDataArgs): Observable<OraclePriceData> {
      if (token === 'token') {
        return of({
          currentPrice: new BigNumber(2),
        } as OraclePriceData)
      }
      return throwError(new Error('Not found'))
    }

    const result = getTotalValueLocked$(getCollateralLocked$, mockOraclePriceData$, 'ilk')

    const state = getStateUnpacker(result)()

    expect(state).to.eql({
      value: new BigNumber(6),
    })
  })
})
