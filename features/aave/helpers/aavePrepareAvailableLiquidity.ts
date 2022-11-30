import BigNumber from 'bignumber.js'
import {
  AaveReserveDataParameters,
  AaveReserveDataReply,
} from 'blockchain/calls/aave/aaveProtocolDataProvider'
import { amountFromWei } from 'blockchain/utils'
import { combineLatest, Observable, of } from 'rxjs'
import { catchError, map } from 'rxjs/operators'

import { zero } from '../../../helpers/zero'

type PrepareAaveAvailableLiquidityProps = [AaveReserveDataReply, BigNumber[]]

export function prepareAaveAvailableLiquidityInUSDC$(
  getAaveReserveData$: (token: AaveReserveDataParameters) => Observable<AaveReserveDataReply>,
  getAaveAssetsPrices$: Observable<string[]>,
  reserveDataToken: AaveReserveDataParameters,
): Observable<BigNumber> {
  return combineLatest(getAaveReserveData$(reserveDataToken), getAaveAssetsPrices$).pipe(
    map(([reserveData, [USDC_ETH_price]]: PrepareAaveAvailableLiquidityProps) => {
      const availableLiquidityInETH = amountFromWei(
        new BigNumber(reserveData.availableLiquidity),
        'ETH',
      )
      const ETH_USDC_price = new BigNumber(1).div(USDC_ETH_price) // price of one ETH in USDC
      return availableLiquidityInETH.times(ETH_USDC_price)
    }),
    catchError((error) => {
      console.log(`Can't get Aave available liquidity for ${reserveDataToken}`, error)
      return of(zero)
    }),
  )
}
