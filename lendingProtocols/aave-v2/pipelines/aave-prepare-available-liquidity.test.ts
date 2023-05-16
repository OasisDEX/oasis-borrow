import BigNumber from 'bignumber.js'
import {
  AaveV2ReserveDataParameters,
  AaveV2ReserveDataReply,
} from 'blockchain/aave/aaveV2ProtocolDataProvider'
import { zero } from 'helpers/zero'
import { of, throwError } from 'rxjs'

import { aaveAvailableLiquidityInUSDC$ } from './aave-available-liquidity-in-usdc'

describe('prepareAaveAvailableLiquidityInUSDC$', () => {
  it('should return the correct value', (done) => {
    const getAaveReserveData$ = () =>
      of({
        availableLiquidity: new BigNumber(10),
      } as AaveV2ReserveDataReply)
    const getTokenPrice$ = () => of(new BigNumber(2))
    const usdcEthPrice$ = of(new BigNumber(1))
    const reserveDataToken = { token: 'TEST' } as AaveV2ReserveDataParameters

    aaveAvailableLiquidityInUSDC$(
      getAaveReserveData$,
      getTokenPrice$,
      usdcEthPrice$,
      reserveDataToken,
    ).subscribe((value) => {
      expect(value.toString()).toEqual(new BigNumber(20).toString())
      done()
    })
  })

  it('should return zero on error', (done) => {
    const getAaveReserveData$ = () => throwError(new Error('Test error'))

    const getTokenPrice$ = () => of(new BigNumber(2))
    const usdcEthPrice$ = of(new BigNumber(1))
    const reserveDataToken = { token: 'TEST' } as AaveV2ReserveDataParameters

    aaveAvailableLiquidityInUSDC$(
      getAaveReserveData$,
      getTokenPrice$,
      usdcEthPrice$,
      reserveDataToken,
    ).subscribe((value) => {
      expect(value).toEqual(zero)
      done()
    })
  })
})
