import { combineLatest, Observable } from 'rxjs'
import { first, map } from 'rxjs/operators'

import { callOperationExecutor } from '../../../../../blockchain/calls/operationExecutor'
import { TxMetaKind } from '../../../../../blockchain/calls/txMeta'
import { ContextConnected } from '../../../../../blockchain/network'
import { TxHelpers } from '../../../../../components/AppContext'
import { HasGasEstimation } from '../../../../../helpers/form'
import { getCloseAaveParameters } from '../../../../aave'
import { UserSettingsState } from '../../../../userSettings/userSettings'
import {
  ClosePositionParametersStateMachineServices,
  createClosePositionParametersStateMachine,
} from '../state'

export function getClosePositionParametersStateMachineServices$(
  context$: Observable<ContextConnected>,
  txHelpers$: Observable<TxHelpers>,
  gasEstimation$: (gas: number) => Observable<HasGasEstimation>,
  userSettings$: Observable<UserSettingsState>,
): Observable<ClosePositionParametersStateMachineServices> {
  return combineLatest(context$, txHelpers$, userSettings$).pipe(
    first(),
    map(([contextConnected, txHelpers, userSettings]) => {
      return {
        getParameters: async (context) => {
          if (!context.proxyAddress) return undefined

          return await getCloseAaveParameters(
            contextConnected,
            context.position.collateral.amount,
            userSettings.slippage,
            context.proxyAddress,
            context.position,
          )
        },
        estimateGas: async (context) => {
          if (context.transactionParameters === undefined) return 0
          return await txHelpers
            .estimateGas(callOperationExecutor, {
              kind: TxMetaKind.operationExecutor,
              calls: context.transactionParameters!.calls as any,
              operationName: 'CustomOperation',
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

export function getClosePositionParametersStateMachine$(
  services$: Observable<ClosePositionParametersStateMachineServices>,
) {
  return services$.pipe(
    map((services) => {
      return createClosePositionParametersStateMachine.withConfig({
        services: {
          ...services,
        },
        actions: {
          notifyParent: () => {},
        },
      })
    }),
  )
}
