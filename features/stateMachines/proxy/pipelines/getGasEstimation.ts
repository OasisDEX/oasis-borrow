import { amountFromWei } from '@oasisdex/utils'
import type { Context } from 'blockchain/network.types'
import type { NetworkIds } from 'blockchain/networks'
import type { GasPrice$, Tickers } from 'blockchain/prices.types'
import type { HasGasEstimation } from 'helpers/types/HasGasEstimation.types'
import { GasEstimationStatus } from 'helpers/types/HasGasEstimation.types'
import type { Observable } from 'rxjs'
import { combineLatest } from 'rxjs'
import { map, startWith } from 'rxjs/operators'

export function getGasEstimation$(
  context$: Observable<Context>,
  gasPrice$: (networkId: NetworkIds) => GasPrice$,
  tokenPriceInUSD$: Observable<Tickers> | Promise<Tickers>,
  estimatedGasQtyRequired: number,
): Observable<HasGasEstimation> {
  return combineLatest(context$).pipe(
    map(([context]) => {
      return combineLatest(gasPrice$(context.chainId), tokenPriceInUSD$).pipe(
        map(([gasPrice, { ETH: ETHUsd, DAI: DAIUsd }]) => {
          const gasCost = amountFromWei(gasPrice.maxFeePerGas.times(estimatedGasQtyRequired))
          const gasEstimationUsd = ETHUsd ? gasCost.times(ETHUsd) : undefined
          const gasEstimationDai =
            gasEstimationUsd && DAIUsd ? gasEstimationUsd.div(DAIUsd) : undefined

          return {
            gasEstimation: estimatedGasQtyRequired,
            gasEstimationUsd,
            gasEstimationStatus: GasEstimationStatus.calculated,
            gasEstimationDai,
            gasEstimationEth: gasCost,
          }
        }),
      )
    }),
    startWith({
      gasEstimationStatus: GasEstimationStatus.calculating,
    }),
  )
}
