import BigNumber from 'bignumber.js'
import { AaveV3ReserveDataParameters, AaveV3ReserveDataReply } from 'blockchain/aave-v3'
import { amountFromWei } from 'blockchain/utils'
import { combineLatest, Observable, of } from 'rxjs'
import { catchError, map } from 'rxjs/operators'

import { zero } from '../../../helpers/zero'

type PrepareAaveAvailableLiquidityProps = [AaveV3ReserveDataReply, BigNumber[]]

export function prepareAaveAvailableLiquidityInUSDC$(
  getAaveReserveData$: (token: AaveV3ReserveDataParameters) => Observable<AaveV3ReserveDataReply>,
  getAaveAssetsPrices$: Observable<string[]>,
  reserveDataToken: AaveV3ReserveDataParameters,
): Observable<BigNumber> {
  return combineLatest(getAaveReserveData$(reserveDataToken), getAaveAssetsPrices$).pipe(
    map(([reserveData, [USDC_ETH_price]]: PrepareAaveAvailableLiquidityProps) => {
      const availableLiquidityInETH = amountFromWei(new BigNumber(reserveData.unbacked), 'ETH')
      const ETH_USDC_price = new BigNumber(1).div(USDC_ETH_price) // price of one ETH in USDC
      return availableLiquidityInETH.times(ETH_USDC_price)
    }),
    catchError((error) => {
      console.log(`Can't get Aave available liquidity for ${reserveDataToken}`, error)
      return of(zero)
    }),
  )
}
