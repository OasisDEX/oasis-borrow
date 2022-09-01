import BigNumber from 'bignumber.js'
import { combineLatest, Observable } from 'rxjs'
import { first, map } from 'rxjs/operators'

import { TxMetaKind } from '../../../../../blockchain/calls/txMeta'
import { ContextConnected } from '../../../../../blockchain/network'
import { TxHelpers } from '../../../../../components/AppContext'
import { HasGasEstimation } from '../../../../../helpers/form'
import { one, zero } from '../../../../../helpers/zero'
import { getOpenAaveParameters } from '../../../../aave'
import { UserSettingsState } from '../../../../userSettings/userSettings'
import { openAavePosition } from '../pipelines/openAavePosition'
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
            context.amount || zero,
            context.multiply || new BigNumber(2),
            userSettings.slippage,
            context.proxyAddress,
          )
        },
        estimateGas: async (context) => {
          if (context.proxyAddress === undefined || (context.amount || zero) < one) {
            return 0
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
          notifyParent: () => {},
        },
      })
    }),
  )
}
