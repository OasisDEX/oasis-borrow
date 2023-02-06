import BigNumber from 'bignumber.js'
import {
  AaveV2ReserveDataParameters,
  AaveV2ReserveDataReply,
} from 'blockchain/aave/aaveV2ProtocolDataProvider'
import { amountFromWei } from 'blockchain/utils'
import { zero } from 'helpers/zero'
import { combineLatest, Observable, of } from 'rxjs'
import { catchError, map } from 'rxjs/operators'

type PrepareAaveAvailableLiquidityProps = [AaveV2ReserveDataReply, BigNumber[]]

export function prepareAaveAvailableLiquidityInUSDC$(
  getAaveReserveData$: (token: AaveV2ReserveDataParameters) => Observable<AaveV2ReserveDataReply>,
  getAaveAssetsPrices$: Observable<string[]>,
  reserveDataToken: AaveV2ReserveDataParameters,
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
      console.log(`Can't get Aave V2 available liquidity for ${reserveDataToken}`, error)
      return of(zero)
    }),
  )
}
