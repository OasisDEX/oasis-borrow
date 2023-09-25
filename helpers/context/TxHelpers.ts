import type { EstimateGasFunction, SendTransactionFunction } from 'blockchain/calls/callsHelpers'
import type { Observable } from 'rxjs'

import type { TxData } from './TxData'

export interface TxHelpers {
  send: SendTransactionFunction<TxData>
  sendWithGasEstimation: SendTransactionFunction<TxData>
  estimateGas: EstimateGasFunction<TxData>
}
export type TxHelpers$ = Observable<TxHelpers>
