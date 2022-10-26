import { OPERATION_NAMES } from '@oasisdex/oasis-actions'
import { combineLatest, Observable } from 'rxjs'
import { first, map } from 'rxjs/operators'

import { callOperationExecutor } from '../../../../blockchain/calls/operationExecutor'
import { TxMetaKind } from '../../../../blockchain/calls/txMeta'
import { ContextConnected } from '../../../../blockchain/network'
import { TxHelpers } from '../../../../components/AppContext'
import { HasGasEstimation } from '../../../../helpers/form'
import { one, zero } from '../../../../helpers/zero'
import { UserSettingsState } from '../../../userSettings/userSettings'
import { getOpenAaveParameters } from '../../oasisActionsLibWrapper'
import { createParametersStateMachine, ParametersStateMachineServices } from '../state'

export function getOpenAaveParametersStateMachineServices$(
  context$: Observable<ContextConnected>,
  txHelpers$: Observable<TxHelpers>,
  gasEstimation$: (gas: number) => Observable<HasGasEstimation>,
  userSettings$: Observable<UserSettingsState>,
): Observable<ParametersStateMachineServices> {
  return combineLatest(context$, txHelpers$, userSettings$).pipe(
    first(), // We only need the first one (for an account, per refresh)
    map(([contextConnected, txHelpers, userSettings]) => {
      return {
        getParameters: async (context) => {
          if (!context.proxyAddress) return undefined
          return await getOpenAaveParameters(
            contextConnected,
            context.amount!,
            context.riskRatio!,
            userSettings.slippage,
            context.proxyAddress,
          )
        },
        estimateGas: async (context) => {
          // estimates the quantity of gas required
          if (context.proxyAddress === undefined || (context.amount || zero) < one) {
            return 0
          }
          return await txHelpers
            .estimateGas(callOperationExecutor, {
              kind: TxMetaKind.operationExecutor,
              calls: context.transactionParameters!.calls as any,
              operationName: OPERATION_NAMES.aave.OPEN_POSITION,
              token: context.token!,
              amount: context.amount!,
              proxyAddress: context.proxyAddress!,
            })
            .pipe(first())
            .toPromise()
        },
        estimateGasPrice: async (context) => {
          // given the gas price and gas quantity, estimates the gas cost for the transaction
          return await gasEstimation$(context.estimatedGas!).pipe(first()).toPromise()
        },
      }
    }),
  )
}

export function getParametersStateMachine$(services$: Observable<ParametersStateMachineServices>) {
  return services$.pipe(
    map((services) => {
      return createParametersStateMachine.withConfig({
        services: {
          getParameters: services.getParameters,
          estimateGas: services.estimateGas,
          estimateGasPrice: services.estimateGasPrice,
        },
        actions: {
          notifyParent: () => {
            // overridden in parent when machine is consumed
          },
        },
      })
    }),
  )
}
