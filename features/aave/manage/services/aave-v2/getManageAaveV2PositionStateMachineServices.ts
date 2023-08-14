import BigNumber from 'bignumber.js'
import { createExecuteTransaction, DpmExecuteParameters } from 'blockchain/better-calls/dpm-account'
import { ensureEtherscanExist, getNetworkContracts } from 'blockchain/contracts'
import { Context } from 'blockchain/network'
import { Tickers } from 'blockchain/prices'
import { TokenBalances } from 'blockchain/tokens'
import { ProxiesRelatedWithPosition } from 'features/aave/helpers'
import { ManageAaveStateMachineServices } from 'features/aave/manage/state'
import { getPricesFeed$ } from 'features/aave/services'
import {
  contextToEthersTransactions,
  IStrategyConfig,
  IStrategyInfo,
  StrategyTokenAllowance,
  StrategyTokenBalance,
} from 'features/aave/types'
import { PositionId } from 'features/aave/types/position-id'
import { createEthersTransactionStateMachine } from 'features/stateMachines/transaction'
import { UserSettingsState } from 'features/userSettings/userSettings'
import { allDefined } from 'helpers/allDefined'
import { TxHelpers } from 'helpers/context/types'
import { ProtocolData } from 'lendingProtocols/aaveCommon'
import { isEqual } from 'lodash'
import { combineLatest, Observable } from 'rxjs'
import { distinctUntilChanged, filter, map, switchMap } from 'rxjs/operators'
import { interpret } from 'xstate'

export function getManageAaveV2PositionStateMachineServices(
  context$: Observable<Context>,
  txHelpers$: Observable<TxHelpers>,
  tokenBalances$: Observable<TokenBalances | undefined>,
  connectedProxyAddress$: Observable<string | undefined>,
  proxiesRelatedWithPosition$: (positionId: PositionId) => Observable<ProxiesRelatedWithPosition>,
  userSettings$: Observable<UserSettingsState>,
  prices$: (tokens: string[]) => Observable<Tickers>,
  strategyInfo$: (tokens: IStrategyConfig['tokens']) => Observable<IStrategyInfo>,
  aaveProtocolData$: (
    collateralToken: string,
    debtToken: string,
    proxyAddress: string,
  ) => Observable<ProtocolData>,
  tokenAllowance$: (token: string, spender: string) => Observable<BigNumber>,
): ManageAaveStateMachineServices {
  const pricesFeed$ = getPricesFeed$(prices$)
  return {
    runEthersTransaction: (context) => async (sendBack, _onReceive) => {
      const networkId = context.strategyConfig.networkId
      const contracts = getNetworkContracts(networkId)
      ensureEtherscanExist(networkId, contracts)

      const { etherscan } = contracts

      const machine = createEthersTransactionStateMachine<DpmExecuteParameters>().withContext({
        etherscanUrl: etherscan.url,
        transaction: createExecuteTransaction,
        transactionParameters: contextToEthersTransactions(context),
      })

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
        map((result) => result.dsProxy || result.dpmProxy?.proxy),
        filter((address) => !!address),
        switchMap((proxyAddress) =>
          aaveProtocolData$(context.tokens.collateral, context.tokens.debt, proxyAddress!),
        ),
        map((aaveProtocolData) => ({
          type: 'CURRENT_POSITION_CHANGED',
          currentPosition: aaveProtocolData.position,
        })),
      )
    },
    protocolData$: (context) => {
      return proxiesRelatedWithPosition$(context.positionId).pipe(
        map((result) => result.dsProxy || result.dpmProxy?.proxy),
        filter((address) => !!address),
        switchMap((proxyAddress) =>
          aaveProtocolData$(context.tokens.collateral, context.tokens.debt, proxyAddress!),
        ),
        map((aaveProtocolData) => ({
          type: 'UPDATE_PROTOCOL_DATA',
          protocolData: aaveProtocolData,
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
  }
}
