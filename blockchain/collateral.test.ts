import BigNumber from 'bignumber.js'
import { expect } from 'chai'
import { Observable, of, throwError } from 'rxjs'

import { getStateUnpacker } from '../helpers/testHelpers'
import { getCollateralLocked$, getTotalValueLocked$ } from './collateral'
import { ContextConnected } from './network'
import { OraclePriceData, OraclePriceDataArgs } from './prices'

describe('getCollateralLocked$', () => {
  it('should return error when no ilk to token mappings', () => {
    const context = {
      joins: {},
    } as ContextConnected

    function ilkToToken$() {
      return throwError(new Error('Not found'))
    }
    function balance$() {
      return of(new BigNumber(1))
    }
    const ilk = 'ilk'

    const result = getCollateralLocked$(of(context), ilkToToken$, balance$, ilk)

    expect(getStateUnpacker(result)).to.throw()
  })
  it('should return balance of token for ilk', () => {
    const context = ({
      joins: { ilk: 'address' },
    } as unknown) as ContextConnected

    function ilkToToken$(ilk: string) {
      if (ilk === 'ilk') {
        return of('token')
      }
      return throwError(new Error('Not found'))
    }
    function balance$(token: string, address: string) {
      if (token === 'token' && address === 'address') {
        return of(new BigNumber(1))
      }
      return throwError(new Error('Not found'))
    }
    const ilk = 'ilk'

    const result = getCollateralLocked$(of(context), ilkToToken$, balance$, ilk)

    const state = getStateUnpacker(result)()

    expect(state).to.eql({
      ilk: 'ilk',
      token: 'token',
      collateral: new BigNumber(1),
    })
  })
})

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
