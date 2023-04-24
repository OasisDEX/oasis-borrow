import BigNumber from 'bignumber.js'
import {
  AaveV2ReserveDataParameters,
  AaveV2ReserveDataReply,
} from 'blockchain/aave/aaveV2ProtocolDataProvider'
import { zero } from 'helpers/zero'
import { combineLatest, Observable, of } from 'rxjs'
import { catchError, map } from 'rxjs/operators'

export function prepareAaveAvailableLiquidityInUSDC$(
  getAaveReserveData$: (token: AaveV2ReserveDataParameters) => Observable<AaveV2ReserveDataReply>,
  getTokenPrice$: (token: string) => Observable<BigNumber>,
  usdcEthPrice$: Observable<BigNumber>,
  reserveDataToken: AaveV2ReserveDataParameters,
): Observable<BigNumber> {
  return combineLatest(
    getAaveReserveData$(reserveDataToken),
    getTokenPrice$(reserveDataToken.token),
    usdcEthPrice$,
  ).pipe(
    map(([reserveData, priceTokenInEth, USDC_ETH_price]) => {
      const liquidityInEthPrice = reserveData.availableLiquidity.times(priceTokenInEth)
      const ETH_USDC_price = new BigNumber(1).div(USDC_ETH_price) // price of one ETH in USDC
      return liquidityInEthPrice.times(ETH_USDC_price)
    }),
    catchError((error) => {
      console.log(`Can't get Aave V2 available liquidity for ${reserveDataToken}`, error)
      return of(zero)
    }),
  )
}
