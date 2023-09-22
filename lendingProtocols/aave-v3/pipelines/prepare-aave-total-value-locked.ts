import BigNumber from 'bignumber.js'
import type { AaveV3ReserveDataReply } from 'blockchain/aave-v3'
import type { AaveLikeReserveData } from 'lendingProtocols/aave-like-common'
import type { Observable } from 'rxjs'
import { combineLatest } from 'rxjs'
import { map } from 'rxjs/operators'

export type PreparedAaveTotalValueLocked = {
  totalValueLocked: BigNumber
}

type PrepareAaveTVLProps = [AaveV3ReserveDataReply, AaveV3ReserveDataReply, BigNumber[]]

export function prepareAaveTotalValueLocked$(
  getAaveWstEthReserveData$: Observable<AaveLikeReserveData>,
  getAaveWEthReserveData$: Observable<AaveLikeReserveData>,
  getAaveLikeAssetsPrices$: Observable<BigNumber[]>,
): Observable<PreparedAaveTotalValueLocked> {
  return combineLatest(
    getAaveWstEthReserveData$,
    getAaveWEthReserveData$,
    getAaveLikeAssetsPrices$,
  ).pipe(
    map(([WSTETH_reserveData, ETH_reserveData, [ethPrice, wstEthPrice]]: PrepareAaveTVLProps) => {
      const wstEthAvailableLiquidity = new BigNumber(WSTETH_reserveData.availableLiquidity)
      const WETH_totalStableDebt = new BigNumber(ETH_reserveData.totalStableDebt)
      const WETH_totalVariableDebt = new BigNumber(ETH_reserveData.totalVariableDebt)

      const availableLiquidityInUsdc = wstEthAvailableLiquidity.times(wstEthPrice)
      const wethTotalDebt = WETH_totalStableDebt.plus(WETH_totalVariableDebt).times(ethPrice) // total debt in WETH in USDC
      const totalValueLocked = availableLiquidityInUsdc.minus(wethTotalDebt) // total value locked in USDC

      return {
        totalValueLocked,
      }
    }),
  )
}
