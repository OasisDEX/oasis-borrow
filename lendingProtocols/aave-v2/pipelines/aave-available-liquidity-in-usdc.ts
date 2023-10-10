import BigNumber from 'bignumber.js'
import type { AaveV2GetAssetPriceParameters, AaveV2ReserveDataReply } from 'blockchain/aave'
import type { AaveV2ReserveDataParameters } from 'blockchain/aave/aaveV2ProtocolDataProvider'
import { zero } from 'helpers/zero'
import type { Observable } from 'rxjs'
import { combineLatest, of } from 'rxjs'
import { catchError, map } from 'rxjs/operators'

export function aaveLikeAvailableLiquidityInUSDC$(
  getReserveData$: (args: AaveV2ReserveDataParameters) => Observable<AaveV2ReserveDataReply>,
  getAssetPrice$: (args: AaveV2GetAssetPriceParameters) => Observable<BigNumber>,
  getUSDCPriceInEth$: Observable<BigNumber>,
  reserveDataToken: AaveV2ReserveDataParameters,
): Observable<BigNumber> {
  return combineLatest(
    getReserveData$(reserveDataToken),
    getAssetPrice$({ ...reserveDataToken }),
    getUSDCPriceInEth$,
  ).pipe(
    map(([reserveData, tokenPrice, usdcPrice]) => {
      const liquidityInEthPrice = reserveData.availableLiquidity.times(tokenPrice)
      const ETH_USDC_price = new BigNumber(1).div(usdcPrice) // price of one ETH in USDC
      return liquidityInEthPrice.times(ETH_USDC_price)
    }),
    catchError((error) => {
      console.error(
        `Can't get available liquidity for ${JSON.stringify(reserveDataToken, null, 2)}`,
        error,
      )
      return of(zero)
    }),
  )
}
