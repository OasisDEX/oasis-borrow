import { getOnChainPosition } from 'actions/aave-like'
import BigNumber from 'bignumber.js'
import type { DpmExecuteOperationExecutorActionParameters } from 'blockchain/better-calls/dpm-account'
import { createExecuteOperationExecutorTransaction } from 'blockchain/better-calls/dpm-account'
import { ensureEtherscanExist, getNetworkContracts } from 'blockchain/contracts'
import type { Context } from 'blockchain/network.types'
import type { NetworkIds } from 'blockchain/networks'
import type { Tickers } from 'blockchain/prices.types'
import type { TokenBalances } from 'blockchain/tokens.types'
import { getPositionIdFromDpmProxy$ } from 'blockchain/userDpmProxies'
import type { AddressesRelatedWithPosition } from 'features/aave/helpers/getProxiesRelatedWithPosition'
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
  AaveLikeCumulativeData,
  AaveLikeHistoryEvent,
} from 'features/omni-kit/protocols/aave-like/history/types'
import { jwtAuthGetToken } from 'features/shared/jwt'
import { saveVaultUsingApi$ } from 'features/shared/vaultApi'
import { createEthersTransactionStateMachine } from 'features/stateMachines/transaction'
import type { UserSettingsState } from 'features/userSettings/userSettings.types'
import { allDefined } from 'helpers/allDefined'
import type { TxHelpers } from 'helpers/context/TxHelpers'
import { productToVaultType } from 'helpers/productToVaultType'
import type { AaveLikeReserveData } from 'lendingProtocols/aave-like-common'
import { isEqual } from 'lodash'
import type { Observable } from 'rxjs'
import { combineLatest, of, throwError } from 'rxjs'
import { catchError, distinctUntilChanged, filter, map, switchMap } from 'rxjs/operators'
import type { EventObject } from 'xstate'
import { interpret } from 'xstate'

export function getManageAaveV3PositionStateMachineServices(
  context$: Observable<Context>,
  txHelpers$: Observable<TxHelpers>,
  tokenBalances$: Observable<TokenBalances | undefined>,
  connectedProxyAddress$: Observable<string | undefined>,
  proxiesRelatedWithPosition$: (positionId: PositionId) => Observable<AddressesRelatedWithPosition>,
  userSettings$: Observable<UserSettingsState>,
  prices$: (tokens: string[]) => Observable<Tickers>,
  strategyInfo$: (tokens: IStrategyConfig['tokens']) => Observable<IStrategyInfo>,
  tokenAllowance$: (token: string, spender: string) => Observable<BigNumber>,
  getHistoryEvents: (
    proxyAccount: string,
    networkId: NetworkIds,
  ) => Promise<{
    events: AaveLikeHistoryEvent[]
    positionCumulatives?: AaveLikeCumulativeData
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
      return proxiesRelatedWithPosition$(context.positionId).pipe(
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
      return proxiesRelatedWithPosition$(context.positionId).pipe(
        map((result) => {
          const proxy = result.dsProxy || result.dpmProxy?.proxy
          if (proxy === undefined && context.positionId.external) {
            return result.walletAddress
          }
          return proxy
        }),
        filter((address): address is string => !!address),
        switchMap((proxyAddress) =>
          getOnChainPosition({
            networkId: context.strategyConfig.networkId,
            proxyAddress: proxyAddress,
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
      return proxiesRelatedWithPosition$(context.positionId).pipe(
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
    savePositionToDb$: (context) => {
      const chainId = context.strategyConfig.networkId

      if (!chainId) {
        return throwError(new Error('No chainId available - save position unsuccessful'))
      }

      const user = context.ownerAddress
      const proxy = context.proxyAddress
      if (!proxy) {
        return throwError(new Error('No proxy available - save position unsuccessful'))
      }

      const updatedVaultType = productToVaultType(context.strategyConfig.type)

      return getPositionIdFromDpmProxy$(of({ chainId }), proxy).pipe(
        switchMap((positionId) => {
          if (!positionId || !updatedVaultType || !proxy || !user) {
            return throwError(new Error('No enough data provided to save position'))
          }

          const token = jwtAuthGetToken(user)

          if (!token) {
            return throwError(new Error('No token available - save position unsuccessful'))
          }
          return saveVaultUsingApi$(
            new BigNumber(positionId),
            token,
            updatedVaultType,
            chainId,
            context.strategyConfig.protocol,
          )
        }),
        map(() => ({ type: 'SWITCH_SUCCESS', productType: updatedVaultType })),
        catchError((error) => {
          console.error('Error saving to the DB:', error)
          return throwError(error)
        }),
      )
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
