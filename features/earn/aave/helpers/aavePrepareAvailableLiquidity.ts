import BigNumber from 'bignumber.js'
import { AaveReserveDataReply } from 'blockchain/calls/aave/aaveProtocolDataProvider'
import { TokenSymbolType } from 'blockchain/tokensMetadata'
import { amountFromWei } from 'blockchain/utils'
import { combineLatest, Observable, of } from 'rxjs'
import { catchError, map } from 'rxjs/operators'

import { zero } from '../../../../helpers/zero'

type PrepareAaveAvailableLiquidityProps = [AaveReserveDataReply, BigNumber[]]

export function prepareAaveAvailableLiquidityInUSD$(
  token: TokenSymbolType,
): (
  getAaveReserveData$: Observable<AaveReserveDataReply>,
  getAaveAssetsPrices$: Observable<string[]>,
) => Observable<BigNumber> {
  return (getAaveReserveData$, getAaveAssetsPrices$) =>
    combineLatest(getAaveReserveData$, getAaveAssetsPrices$).pipe(
      map(([reserveData, [USDC_ETH_price]]: PrepareAaveAvailableLiquidityProps) => {
        const availableLiquidityInETH = amountFromWei(
          new BigNumber(reserveData.availableLiquidity),
          token,
        )
        const ETH_USDC_price = new BigNumber(1).div(USDC_ETH_price) // price of one ETH in USDC
        return availableLiquidityInETH.times(ETH_USDC_price)
      }),
      catchError((error) => {
        console.log(`Can't get Aave available liquidity for ${token}`, error)
        return of(zero)
      }),
    )
}
