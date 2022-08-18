import { combineLatest, Observable } from 'rxjs'
import { first, map } from 'rxjs/operators'

import { TxMetaKind } from '../../../../../blockchain/calls/txMeta'
import { ContextConnected } from '../../../../../blockchain/network'
import { TxHelpers } from '../../../../../components/AppContext'
import { HasGasEstimation } from '../../../../../helpers/form'
import { one, zero } from '../../../../../helpers/zero'
import { getOpenAaveParameters } from '../../../../aave'
import { UserSettingsState } from '../../../../userSettings/userSettings'
import { manageAavePosition } from '../pipelines/manageAavePosition'
import {
  manageAaveParametersStateMachine,
  ManageAaveParametersStateMachineType,
  PreTransactionSequenceMachineServices,
} from './manageAaveParametersStateMachine'

/**
  This function is used to set up the parameters StateMachine
  It would be great if we could pass promises to that. Then we could return plain object of services
 **/
export function getManageAaveParametersStateMachineServices$(
  context$: Observable<ContextConnected>,
  txHelpers$: Observable<TxHelpers>,
  gasEstimation$: (gas: number) => Observable<HasGasEstimation>,
  userSettings$: Observable<UserSettingsState>,
): Observable<PreTransactionSequenceMachineServices> {
  return combineLatest(context$, txHelpers$, userSettings$).pipe(
    first(), // We only need the first one (for an account, per refresh)
    map(([contextConnected, txHelpers, userSettings]) => {
      return {
        getParameters: async (context) => {
          if (!context.proxyAddress) return Promise.resolve()
          return await getOpenAaveParameters(
            contextConnected,
            context.amount || zero,
            context.multiply || 2,
            userSettings.slippage,
            context.proxyAddress,
          )
        },
        estimateGas: async (context) => {
          if (context.proxyAddress === undefined || (context.amount || zero) < one) {
            return Promise.resolve(0)
          }

          const gas = await txHelpers
            .estimateGas(manageAavePosition, {
              kind: TxMetaKind.operationExecutor,
              calls: context.transactionParameters!.calls as any,
              operationName: context.transactionParameters!.operationName,
              token: context.token!,
              amount: context.amount!,
              proxyAddress: context.proxyAddress!,
            })
            .pipe(first())
            .toPromise()

          return gas
        },
        estimateGasPrice: async (context) => {
          return await gasEstimation$(context.estimatedGas!).pipe(first()).toPromise()
        },
      }
    }),
  )
}

export function getManageAaveParametersStateMachine$(
  services$: Observable<PreTransactionSequenceMachineServices>,
): Observable<ManageAaveParametersStateMachineType> {
  return services$.pipe(
    map((services) => {
      return manageAaveParametersStateMachine.withConfig({
        services: {
          ...services,
        },
      })
    }),
  )
}
