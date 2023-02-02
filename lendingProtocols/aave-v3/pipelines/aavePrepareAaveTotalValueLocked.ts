import BigNumber from 'bignumber.js'
import { AaveV3ReserveDataReply } from 'blockchain/aave-v3'
import { amountFromWei } from 'blockchain/utils'
import { combineLatest, Observable } from 'rxjs'
import { map } from 'rxjs/operators'

export type PreparedAaveTotalValueLocked = {
  totalValueLocked: BigNumber
}

type PrepareAaveTVLProps = [AaveV3ReserveDataReply, AaveV3ReserveDataReply, BigNumber[]]

export function prepareAaveTotalValueLocked$(
  getAaveWstEthReserveData$: Observable<AaveV3ReserveDataReply>,
  getAaveWEthReserveData$: Observable<AaveV3ReserveDataReply>,
  getAaveAssetsPrices$: Observable<string[]>,
): Observable<PreparedAaveTotalValueLocked> {
  return combineLatest(
    getAaveWstEthReserveData$,
    getAaveWEthReserveData$,
    getAaveAssetsPrices$,
  ).pipe(
    map(
      ([
        WSTETH_reserveData,
        ETH_reserveData,
        [usdcEthPrice, wstEthEthRatio],
      ]: PrepareAaveTVLProps) => {
        const ethUsdcPrice = new BigNumber(1).div(usdcEthPrice)
        const wstethEthPrice = wstEthEthRatio.times(ethUsdcPrice)

        const wstEthAvailableLiqudity = amountFromWei(
          new BigNumber(WSTETH_reserveData.availableLiquidity),
          'ETH',
        )

        const WETH_totalStableDebt = amountFromWei(
          new BigNumber(ETH_reserveData.totalStableDebt),
          'ETH',
        )

        const WETH_totalVariableDebt = amountFromWei(
          new BigNumber(ETH_reserveData.totalVariableDebt),
          'ETH',
        )

        const availableLiquidityInUsdc = wstEthAvailableLiqudity.times(wstethEthPrice)
        const wethTotalDebt = WETH_totalStableDebt.plus(WETH_totalVariableDebt).times(ethUsdcPrice) // total debt in WETH in USDC
        const totalValueLocked = availableLiquidityInUsdc.minus(wethTotalDebt) // total value locked in USDC

        return {
          totalValueLocked,
        }
      },
    ),
  )
}
