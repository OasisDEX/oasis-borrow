import { getOnChainPosition } from 'actions/aave-like'
import type BigNumber from 'bignumber.js'
import type { DpmExecuteOperationExecutorActionParameters } from 'blockchain/better-calls/dpm-account'
import { createExecuteOperationExecutorTransaction } from 'blockchain/better-calls/dpm-account'
import { ensureEtherscanExist, getNetworkContracts } from 'blockchain/contracts'
import type { Context } from 'blockchain/network.types'
import type { Tickers } from 'blockchain/prices.types'
import type { TokenBalances } from 'blockchain/tokens.types'
import type { UserDpmAccount } from 'blockchain/userDpmProxies.types'
import type { MigrateAaveStateMachineServices } from 'features/aave/manage/state/migrateAaveStateMachine'
import { xstateReserveDataServiceForMigration } from 'features/aave/services'
import type { IStrategyInfo } from 'features/aave/types'
import { migrationContextToEthersTransactions } from 'features/aave/types'
import type { IStrategyConfig } from 'features/aave/types/strategy-config'
import { createEthersTransactionStateMachine } from 'features/stateMachines/transaction'
import type { UserSettingsState } from 'features/userSettings/userSettings.types'
import type { TxHelpers } from 'helpers/context/TxHelpers'
import type {
  AaveLikeReserveConfigurationData,
  AaveLikeReserveConfigurationDataParams,
  AaveLikeReserveData,
  AaveLikeUserAccountData,
  AaveLikeUserAccountDataArgs,
} from 'lendingProtocols/aave-like-common'
import { isEqual } from 'lodash'
import type { Observable } from 'rxjs'
import { of } from 'rxjs'
import { distinctUntilChanged, filter, map, switchMap } from 'rxjs/operators'
import { interpret } from 'xstate'

export function getMigrateAaveV3PositionStateMachineServices(
  context$: Observable<Context>,
  txHelpers$: Observable<TxHelpers>,
  tokenBalances$: Observable<TokenBalances | undefined>,
  connectedProxy$: Observable<string | undefined>,
  aaveLikeUserAccountData$: (
    parameters: AaveLikeUserAccountDataArgs,
  ) => Observable<AaveLikeUserAccountData>,
  userSettings$: Observable<UserSettingsState>,
  prices$: (tokens: string[]) => Observable<Tickers>,
  strategyInfo$: (tokens: IStrategyConfig['tokens']) => Observable<IStrategyInfo>,
  tokenAllowance$: (token: string, spender: string) => Observable<BigNumber>,
  userDpmProxy$: Observable<UserDpmAccount | undefined>,
  hasProxyAddressActiveAavePosition$: (proxyAddress: string) => Observable<boolean>,
  aaveReserveConfiguration$: (
    args: AaveLikeReserveConfigurationDataParams,
  ) => Observable<AaveLikeReserveConfigurationData>,
  aaveReserveData$: (args: { token: string }) => Observable<AaveLikeReserveData>,
): MigrateAaveStateMachineServices {
  return {
    runEthersTransaction: (context) => async (sendBack, _onReceive) => {
      const networkId = context.strategyConfig.networkId
      const contracts = getNetworkContracts(networkId)
      ensureEtherscanExist(networkId, contracts)

      const { etherscan } = contracts

      const machine =
        createEthersTransactionStateMachine<DpmExecuteOperationExecutorActionParameters>().withContext(
          {
            etherscanUrl: etherscan.url,
            transaction: createExecuteOperationExecutorTransaction,
            transactionParameters: migrationContextToEthersTransactions(context),
          },
        )

      const actor = interpret(machine, {
        id: 'ethersTransactionMachine',
      }).start()

      sendBack({ type: 'CREATED_MACHINE', refTransactionMachine: actor })

      actor.onTransition((state) => {
        if (state.matches('success')) {
          sendBack({ type: 'TRANSACTION_COMPLETED' })
        } else if (state.matches('failure')) {
          sendBack({ type: 'TRANSACTION_FAILED', error: state.context.txError })
        }
      })

      return () => {
        actor.stop()
      }
    },
    context$: (_) => {
      return context$.pipe(
        map((context) => ({
          type: 'WEB3_CONTEXT_CHANGED',
          web3Context: context,
        })),
      )
    },
    userSettings$: (_) => {
      return userSettings$.pipe(
        map((settings) => ({ type: 'USER_SETTINGS_CHANGED', userSettings: settings })),
        distinctUntilChanged((a, b) => isEqual(a, b)),
      )
    },
    allowance$: (context) => {
      // return EMPTY
      return aaveReserveData$({ token: context.strategyConfig.tokens.collateral }).pipe(
        switchMap((reserveData) =>
          userDpmProxy$.pipe(
            filter((dpm): dpm is UserDpmAccount => dpm !== undefined),
            map((dpm) => {
              return { reserveData, dpm }
            }),
          ),
        ),
        switchMap(({ reserveData, dpm }) => {
          return tokenAllowance$(reserveData.tokenAddress, dpm.proxy).pipe(
            map((allowance) => ({
              type: 'UPDATE_ALLOWANCE',
              allowanceForProtocolToken: allowance,
            })),
            distinctUntilChanged((a, b) => isEqual(a, b)),
          )
        }),
      )
    },
    dpmProxy$: (_) => {
      return userDpmProxy$.pipe(
        map((proxy) => ({ type: 'DPM_PROXY_RECEIVED', userDpmAccount: proxy })),
        distinctUntilChanged((a, b) => isEqual(a, b)),
      )
    },
    aaveReserveConfiguration$: (context) => {
      return aaveReserveConfiguration$({
        collateralToken: context.strategyConfig.tokens.collateral,
        debtToken: context.strategyConfig.tokens.debt,
      }).pipe(
        map((reserveConfig) => {
          return {
            type: 'RESERVE_CONFIG_UPDATED',
            reserveConfig,
          }
        }),
        distinctUntilChanged((a, b) => isEqual(a, b)),
      )
    },
    currentPosition$: (context) => {
      return of({}).pipe(
        switchMap(() =>
          getOnChainPosition({
            networkId: context.strategyConfig.networkId,
            proxyAddress: context.positionOwner,
            debtToken: context.strategyConfig.tokens.debt,
            protocol: context.strategyConfig.protocol,
            collateralToken: context.strategyConfig.tokens.collateral,
          }),
        ),
        map((position) => ({
          type: 'CURRENT_POSITION_CHANGED',
          currentPosition: position,
        })),
      )
    },
    reserveData$: xstateReserveDataServiceForMigration(aaveReserveData$),
  }
}
