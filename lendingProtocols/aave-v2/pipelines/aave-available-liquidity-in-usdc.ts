import BigNumber from 'bignumber.js'
import { AaveV2GetAssetPriceParameters, AaveV2ReserveDataReply } from 'blockchain/aave'
import { AaveV2ReserveDataParameters } from 'blockchain/aave/aaveV2ProtocolDataProvider'
import { combineLatest, Observable } from 'rxjs'
import { map } from 'rxjs/operators'

export function aaveAvailableLiquidityInUSDC$(
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
  )
}
