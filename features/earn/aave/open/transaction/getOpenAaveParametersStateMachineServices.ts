import { combineLatest, Observable } from 'rxjs'
import { first, map } from 'rxjs/operators'

import { TxMetaKind } from '../../../../../blockchain/calls/txMeta'
import { ContextConnected } from '../../../../../blockchain/network'
import { TxHelpers } from '../../../../../components/AppContext'
import { HasGasEstimation } from '../../../../../helpers/form'
import { one, zero } from '../../../../../helpers/zero'
import { getOpenAaveParameters } from '../../../../aave'
import { openAavePosition } from '../pipelines/openAavePosition'
import {
  openAaveParametersStateMachine,
  OpenAaveParametersStateMachineType,
  PreTransactionSequenceMachineServices,
} from './openAaveParametersStateMachine'

/**
  This function is used to set up the parameters StateMachine
  It would be great if we could pass promises to that. Then we could return plain object of services
 **/
export function getOpenAaveParametersStateMachineServices$(
  context$: Observable<ContextConnected>,
  txHelpers$: Observable<TxHelpers>,
  gasEstimation$: (gas: number) => Observable<HasGasEstimation>,
): Observable<PreTransactionSequenceMachineServices> {
  return combineLatest(context$, txHelpers$).pipe(
    first(), // We only need the first one (for an account, per refresh)
    map(([{ account }, txHelpers]) => {
      return {
        getParameters: async (context) => {
          return await getOpenAaveParameters(
            account,
            context.amount || zero,
            context.multiply || 2,
            context.token,
          )
        },
        estimateGas: async (context) => {
          if (context.proxyAddress === undefined || (context.amount || zero) < one) {
            return Promise.resolve(0)
          }
          return await txHelpers
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
        estimateGasPrice: async (context) => {
          return await gasEstimation$(context.estimatedGas!).pipe(first()).toPromise()
        },
      }
    }),
  )
}

export function getOpenAaveParametersStateMachine$(
  services$: Observable<PreTransactionSequenceMachineServices>,
): Observable<OpenAaveParametersStateMachineType> {
  return services$.pipe(
    map((services) => {
      return openAaveParametersStateMachine.withConfig({
        services: {
          ...services,
        },
      })
    }),
  )
}
