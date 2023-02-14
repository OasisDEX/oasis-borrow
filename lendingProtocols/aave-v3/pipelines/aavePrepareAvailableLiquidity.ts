import BigNumber from 'bignumber.js'
import { AaveV3ReserveDataParameters, AaveV3ReserveDataReply } from 'blockchain/aave-v3'
import { amountFromWei } from 'blockchain/utils'
import { zero } from 'helpers/zero'
import { combineLatest, Observable, of } from 'rxjs'
import { catchError, map } from 'rxjs/operators'

type PrepareAaveAvailableLiquidityProps = [AaveV3ReserveDataReply, BigNumber[], BigNumber]

export function prepareaaveAvailableLiquidityInUSDC$(
  getAaveReserveData$: (token: AaveV3ReserveDataParameters) => Observable<AaveV3ReserveDataReply>,
  getAaveAssetsPrices$: Observable<BigNumber[]>,
  reserveDataToken: AaveV3ReserveDataParameters,
): Observable<BigNumber> {
  // THIS IS NOT IN USDC, THIS IS IN USD
  // Aave V3 Oracle prices are in USD
  return combineLatest(getAaveReserveData$(reserveDataToken), getAaveAssetsPrices$).pipe(
    map(([reserveData, [USD_in_WETH_price]]: PrepareAaveAvailableLiquidityProps) => {
      const availableLiquidityInETH = amountFromWei(
        new BigNumber(reserveData.availableLiquidity),
        'ETH',
      )
      return availableLiquidityInETH.times(USD_in_WETH_price)
    }),
    catchError((error) => {
      console.log(
        `Can't get Aave V3 available liquidity for ${JSON.stringify(reserveDataToken, null, 2)}`,
        error,
      )
      return of(zero)
    }),
  )
}
