import { amountFromWei } from '@oasisdex/utils'
import { combineLatest, Observable } from 'rxjs'
import { map } from 'rxjs/operators'

import { GasPriceParams, Ticker } from '../../../blockchain/prices'
import { GasEstimationStatus, HasGasEstimation } from '../../../helpers/form'

export function getGasEstimation$(
  gasPrice$: Observable<GasPriceParams>,
  tokenPriceInUSD$: Observable<Ticker>,
  estimatedGasCost: number,
): Observable<HasGasEstimation> {
  return combineLatest(gasPrice$, tokenPriceInUSD$).pipe(
    map(([gasPrice, { ETH: ETHUsd, DAI: DAIUsd }]) => {
      const gasCost = amountFromWei(gasPrice.maxFeePerGas.times(estimatedGasCost))
      const gasEstimationUsd = ETHUsd ? gasCost.times(ETHUsd) : undefined
      const gasEstimationDai = gasEstimationUsd && DAIUsd ? gasEstimationUsd.div(DAIUsd) : undefined

      return {
        gasEstimation: estimatedGasCost,
        gasEstimationUsd,
        gasEstimationStatus: GasEstimationStatus.calculated,
        gasEstimationDai,
      }
    }),
  )
}
