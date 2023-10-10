import type BigNumber from 'bignumber.js'
import type { AaveV3ReserveDataParameters, AaveV3ReserveDataReply } from 'blockchain/aave-v3'
import { zero } from 'helpers/zero'
import type { Observable } from 'rxjs'
import { combineLatest, of } from 'rxjs'
import { catchError, map } from 'rxjs/operators'

type PrepareAaveAvailableLiquidityProps = [AaveV3ReserveDataReply, BigNumber]

export function prepareaaveAvailableLiquidityInUSDC$(
  getAaveLikeReserveData$: (
    token: AaveV3ReserveDataParameters,
  ) => Observable<AaveV3ReserveDataReply>,
  getWETHPrice$: Observable<BigNumber>,
  reserveDataToken: AaveV3ReserveDataParameters,
): Observable<BigNumber> {
  // THIS IS NOT IN USDC, THIS IS IN USD
  // Aave V3 Oracle prices are in USD
  return combineLatest(getAaveLikeReserveData$(reserveDataToken), getWETHPrice$).pipe(
    map(([reserveData, USD_in_WETH_price]: PrepareAaveAvailableLiquidityProps) => {
      const availableLiquidityInETH = reserveData.availableLiquidity
      return availableLiquidityInETH.times(USD_in_WETH_price)
    }),
    catchError((error) => {
      console.error(
        `Can't get Aave V3 available liquidity for ${JSON.stringify(reserveDataToken, null, 2)}`,
        error,
      )
      return of(zero)
    }),
  )
}
