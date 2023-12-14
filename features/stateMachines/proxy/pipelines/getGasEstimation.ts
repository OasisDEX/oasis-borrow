import { amountFromWei } from '@oasisdex/utils'
import type { GasPriceParams, Tickers } from 'blockchain/prices.types'
import type { HasGasEstimation } from 'helpers/types/HasGasEstimation.types'
import { GasEstimationStatus } from 'helpers/types/HasGasEstimation.types'
import type { Observable } from 'rxjs'
import { combineLatest } from 'rxjs'
import { map, startWith } from 'rxjs/operators'

export function getGasEstimation$(
  gasPrice$: Observable<GasPriceParams> | Promise<GasPriceParams>,
  tokenPriceInUSD$: Observable<Tickers> | Promise<Tickers>,
  estimatedGasQtyRequired: number,
): Observable<HasGasEstimation> {
  return combineLatest(gasPrice$, tokenPriceInUSD$).pipe(
    map(([gasPrice, { ETH: ETHUsd, DAI: DAIUsd }]) => {
      const gasCost = amountFromWei(gasPrice.maxFeePerGas.times(estimatedGasQtyRequired))
      const gasEstimationUsd = ETHUsd ? gasCost.times(ETHUsd) : undefined
      const gasEstimationDai = gasEstimationUsd && DAIUsd ? gasEstimationUsd.div(DAIUsd) : undefined

      return {
        gasEstimation: estimatedGasQtyRequired,
        gasEstimationUsd,
        gasEstimationStatus: GasEstimationStatus.calculated,
        gasEstimationDai,
        gasEstimationEth: gasCost,
      }
    }),
    startWith({
      gasEstimationStatus: GasEstimationStatus.calculating,
    }),
  )
}
