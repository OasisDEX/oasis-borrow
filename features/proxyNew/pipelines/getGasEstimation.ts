import { amountFromWei } from '@oasisdex/utils'
import { combineLatest, Observable } from 'rxjs'
import { map } from 'rxjs/operators'

import { GasPriceParams, Tickers } from '../../../blockchain/prices'
import { GasEstimationStatus, HasGasEstimation } from '../../../helpers/form'

export function getGasEstimation$(
  gasPrice$: Observable<GasPriceParams>,
  tokenPriceInUSD$: Observable<Tickers>,
  estimatedGasCost: number,
): Observable<HasGasEstimation> {
  return combineLatest(gasPrice$, tokenPriceInUSD$).pipe(
    map(([gasPrice, { ETH: ETHUsd, DAI: DAIUsd }]) => {
      const gasCost = amountFromWei(gasPrice.maxFeePerGas.times(estimatedGasCost))
      const gasEstimationUsd = ETHUsd ? gasCost.times(ETHUsd) : undefined
      const gasEstimationDai = gasEstimationUsd && DAIUsd ? gasEstimationUsd.div(DAIUsd) : undefined
      console.log('estimated gas cost...',estimatedGasCost.toString() )
      console.log('gas cost...',gasCost.toString() )
      console.log('DAIUsd', DAIUsd.toString())
      console.log('ETHUsd', ETHUsd.toString())
      return {
        gasEstimation: estimatedGasCost,
        gasEstimationUsd,
        gasEstimationStatus: GasEstimationStatus.calculated,
        gasEstimationDai,
      }
    }),
  )
}
