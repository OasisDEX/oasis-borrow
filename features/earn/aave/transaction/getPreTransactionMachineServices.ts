import { Observable } from 'rxjs'
import { first, map } from 'rxjs/operators'

import { TxMetaKind } from '../../../../blockchain/calls/txMeta'
import { TxHelpers } from '../../../../components/AppContext'
import { HasGasEstimation } from '../../../../helpers/form'
import { zero } from '../../../../helpers/zero'
import { getOpenAaveParameters } from '../../../aave'
import { openAavePosition } from '../open/pipelines/openAavePosition'
import {
  preTransactionSequenceMachine,
  PreTransactionSequenceMachineServices,
  PreTransactionSequenceMachineType,
} from './preTransactionSequenceMachine'

/*
  This function is used to set up the preTransactionSequenceMachine
  It would be great if we could pass promises to that. Then we could return plain object of services
 */
export function getPreTransactionMachineServices$(
  txHelpers$: Observable<TxHelpers>,
  gasEstimation$: (gas: number) => Observable<HasGasEstimation>,
): Observable<PreTransactionSequenceMachineServices> {
  return txHelpers$.pipe(
    first(), // We only need the first one (for an account, per refresh)
    map((txHelpers) => {
      return {
        getParameters: (context) => {
          return getOpenAaveParameters(context.amount || zero, context.multiply || 2, context.token)
        },
        estimateGas: (context) => {
          return txHelpers
            .estimateGas(openAavePosition, {
              kind: TxMetaKind.operationExecutor,
              calls: context.transactionParameters!.calls as any,
              operationName: context.transactionParameters!.operationName,
              token: context.token!,
              amount: context.amount!,
              proxyAddress: context.proxyAddress!,
            })
            .pipe(first())
            .toPromise()
        },
        estimateGasPrice: (context) => {
          return gasEstimation$(context.estimatedGas!).pipe(first()).toPromise()
        },
      }
    }),
  )
}

export function getPreTransactionMachine$(
  services$: Observable<PreTransactionSequenceMachineServices>,
): Observable<PreTransactionSequenceMachineType> {
  return services$.pipe(
    map((services) => {
      return preTransactionSequenceMachine.withConfig({
        services: {
          ...services,
        },
      })
    }),
  )
}
