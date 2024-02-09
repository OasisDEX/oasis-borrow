import BigNumber from 'bignumber.js'
import type { AaveLikeReserveData } from 'lendingProtocols/aave-like-common'
import type { Observable } from 'rxjs'
import { combineLatest } from 'rxjs'
import { map } from 'rxjs/operators'

export type PreparedAaveTotalValueLocked = {
  totalValueLocked: BigNumber
}

type PrepareAaveTVLProps = [AaveLikeReserveData, AaveLikeReserveData, BigNumber[]]

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

      const availableLiquidityInUsdc = wstEthAvailableLiquidity.times(wstEthPrice)
      const wethTotalDebt = new BigNumber(ETH_reserveData.totalDebt).times(ethPrice) // total debt in WETH in USDC
      const totalValueLocked = availableLiquidityInUsdc.minus(wethTotalDebt) // total value locked in USDC

      return {
        totalValueLocked,
      }
    }),
  )
}
