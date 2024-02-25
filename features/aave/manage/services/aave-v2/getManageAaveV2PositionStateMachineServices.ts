import { getOnChainPosition } from 'actions/aave-like'
import type BigNumber from 'bignumber.js'
import type { DpmExecuteOperationExecutorActionParameters } from 'blockchain/better-calls/dpm-account'
import { createExecuteOperationExecutorTransaction } from 'blockchain/better-calls/dpm-account'
import { ensureEtherscanExist, getNetworkContracts } from 'blockchain/contracts'
import type { Context } from 'blockchain/network.types'
import type { NetworkIds } from 'blockchain/networks'
import type { Tickers } from 'blockchain/prices.types'
import type { TokenBalances } from 'blockchain/tokens.types'
import type { AddressesRelatedWithPosition } from 'features/aave/helpers'
import type { ManageAaveStateMachineServices } from 'features/aave/manage/state'
import { getPricesFeed$, xstateReserveDataService } from 'features/aave/services'
import type {
  IStrategyConfig,
  IStrategyInfo,
  StrategyTokenAllowance,
  StrategyTokenBalance,
} from 'features/aave/types'
import { contextToEthersTransactions } from 'features/aave/types'
import type { PositionId } from 'features/aave/types/position-id'
import type {
  AaveCumulativeData,
  AaveHistoryEvent,
} from 'features/omni-kit/protocols/aave/history/types'
import { createEthersTransactionStateMachine } from 'features/stateMachines/transaction'
import type { UserSettingsState } from 'features/userSettings/userSettings.types'
import { allDefined } from 'helpers/allDefined'
import type { TxHelpers } from 'helpers/context/TxHelpers'
import type { AaveLikeReserveData } from 'lendingProtocols/aave-like-common'
import { isEqual } from 'lodash'
import type { Observable } from 'rxjs'
import { combineLatest, of } from 'rxjs'
import { distinctUntilChanged, filter, map, switchMap } from 'rxjs/operators'
import type { EventObject } from 'xstate'
import { interpret } from 'xstate'

export function getManageAaveV2PositionStateMachineServices(
  context$: Observable<Context>,
  txHelpers$: Observable<TxHelpers>,
  tokenBalances$: Observable<TokenBalances | undefined>,
  connectedProxyAddress$: Observable<string | undefined>,
  proxiesRelatedWithPosition$: (
    positionId: PositionId,
    networkId: NetworkIds,
  ) => Observable<AddressesRelatedWithPosition>,
  userSettings$: Observable<UserSettingsState>,
  prices$: (tokens: string[]) => Observable<Tickers>,
  strategyInfo$: (tokens: IStrategyConfig['tokens']) => Observable<IStrategyInfo>,
  tokenAllowance$: (token: string, spender: string) => Observable<BigNumber>,
  getHistoryEvents: (
    proxyAccount: string,
    networkId: NetworkIds,
  ) => Promise<{
    events: AaveHistoryEvent[]
    positionCumulatives?: AaveCumulativeData
  }>,
  aaveReserveData$: (args: { token: string }) => Observable<AaveLikeReserveData>,
): ManageAaveStateMachineServices {
  const pricesFeed$ = getPricesFeed$(prices$)
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
            transactionParameters: contextToEthersTransactions(context),
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
        map((contextConnected) => ({
          type: 'WEB3_CONTEXT_CHANGED',
          web3Context: contextConnected,
        })),
      )
    },
    getBalance: (context, _) => {
      return tokenBalances$.pipe(
        map((balances) => {
          if (!balances) {
            return {}
          } else {
            const strategyBalance: StrategyTokenBalance = {
              collateral: balances[context.tokens.collateral],
              debt: balances[context.tokens.debt],
              deposit: balances[context.tokens.deposit],
            }
            return strategyBalance
          }
        }),
        map((balances) => ({
          type: 'SET_BALANCE',
          balance: balances,
        })),
      )
    },
    connectedProxyAddress$: () => {
      return connectedProxyAddress$.pipe(
        distinctUntilChanged<string>(isEqual),
        map((address) => ({
          type: 'CONNECTED_PROXY_ADDRESS_RECEIVED',
          connectedProxyAddress: address,
        })),
      )
    },
    positionProxyAddress$: (context) => {
      return proxiesRelatedWithPosition$(context.positionId, context.strategyConfig.networkId).pipe(
        map((result) => ({
          type: 'POSITION_PROXY_ADDRESS_RECEIVED',
          proxyAddress: result.dsProxy || result.dpmProxy?.proxy,
          ownerAddress: result.walletAddress,
        })),
        distinctUntilChanged(isEqual),
      )
    },
    userSettings$: (_) => {
      return userSettings$.pipe(
        distinctUntilChanged(isEqual),
        map((settings) => ({ type: 'USER_SETTINGS_CHANGED', userSettings: settings })),
      )
    },
    prices$: (context) => {
      return pricesFeed$(context.tokens.collateral, context.tokens.debt)
    },
    strategyInfo$: (context) => {
      return strategyInfo$(context.tokens).pipe(
        map((strategyInfo) => ({
          type: 'UPDATE_STRATEGY_INFO',
          strategyInfo,
        })),
      )
    },
    currentPosition$: (context) => {
      return proxiesRelatedWithPosition$(context.positionId, context.strategyConfig.networkId).pipe(
        map((result) => result.dsProxy || result.dpmProxy?.proxy),
        filter((address) => !!address),
        switchMap((proxyAddress) =>
          getOnChainPosition({
            networkId: context.strategyConfig.networkId,
            proxyAddress: proxyAddress!,
            debtToken: context.tokens.debt,
            protocol: context.strategyConfig.protocol,
            collateralToken: context.tokens.collateral,
          }),
        ),
        map((position) => ({
          type: 'CURRENT_POSITION_CHANGED',
          currentPosition: position,
        })),
      )
    },
    allowance$: (context) => {
      return proxiesRelatedWithPosition$(context.positionId, context.strategyConfig.networkId).pipe(
        map((result) => result.dsProxy || result.dpmProxy?.proxy),
        filter(allDefined),
        switchMap((proxyAddress) => {
          return combineLatest([
            tokenAllowance$(context.tokens.deposit, proxyAddress),
            tokenAllowance$(context.tokens.collateral, proxyAddress),
            tokenAllowance$(context.tokens.debt, proxyAddress),
          ])
        }),
        map(
          ([deposit, collateral, debt]): StrategyTokenAllowance => ({
            collateral,
            debt,
            deposit,
          }),
        ),
        map((allowance) => ({
          type: 'UPDATE_ALLOWANCE',
          allowance: allowance,
        })),
        distinctUntilChanged(isEqual),
      )
    },
    savePositionToDb$: () => {
      // TODO: replace with actual implementation.
      return of({ type: 'SWITCH_SUCCESS' })
    },
    historyCallback: (context) => (callback, _onReceive) => {
      const isProxyReceiveEvent = (
        event: EventObject,
      ): event is { type: 'PROXY_RECEIVED'; proxyAddress: string } => {
        return event.type === 'PROXY_RECEIVED'
      }
      _onReceive(async (event) => {
        if (isProxyReceiveEvent(event)) {
          const historyData = await getHistoryEvents(
            event.proxyAddress,
            context.strategyConfig.networkId,
          )
          callback({
            type: 'HISTORY_UPDATED',
            historyEvents: historyData.events,
            cumulatives: historyData.positionCumulatives,
          })
        }
      })
    },
    reserveData$: xstateReserveDataService(aaveReserveData$),
  }
}
