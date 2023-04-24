import { amountFromWei } from '@oasisdex/utils'
import { GasPriceParams, Tickers } from 'blockchain/prices'
import { GasEstimationStatus, HasGasEstimation } from 'helpers/form'
import { combineLatest, Observable } from 'rxjs'
import { map, startWith } from 'rxjs/operators'

export function getGasEstimation$(
  gasPrice$: Observable<GasPriceParams>,
  tokenPriceInUSD$: Observable<Tickers>,
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
