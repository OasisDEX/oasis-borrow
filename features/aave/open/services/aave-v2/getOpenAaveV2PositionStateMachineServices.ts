import BigNumber from 'bignumber.js'
import { createExecuteTransaction, DpmExecuteParameters } from 'blockchain/better-calls/dpm-account'
import { ensureEtherscanExist, getNetworkContracts } from 'blockchain/contracts'
import { Context } from 'blockchain/network'
import { Tickers } from 'blockchain/prices'
import { TokenBalances } from 'blockchain/tokens'
import { UserDpmAccount } from 'blockchain/userDpmProxies'
import { OpenAaveStateMachineServices } from 'features/aave/open/state'
import { getPricesFeed$ } from 'features/aave/services'
import {
  contextToEthersTransactions,
  IStrategyInfo,
  ProxyType,
  StrategyTokenAllowance,
  StrategyTokenBalance,
} from 'features/aave/types'
import { IStrategyConfig } from 'features/aave/types/strategy-config'
import { createEthersTransactionStateMachine } from 'features/stateMachines/transaction'
import { UserSettingsState } from 'features/userSettings/userSettings'
import { allDefined } from 'helpers/allDefined'
import { TxHelpers } from 'helpers/context/types'
import {
  AaveReserveConfigurationDataParams,
  ProtocolData,
  ReserveConfigurationData,
  UserAccountData,
  UserAccountDataArgs,
} from 'lendingProtocols/aaveCommon'
import { isEqual } from 'lodash'
import { combineLatest, iif, Observable, of } from 'rxjs'
import { distinctUntilChanged, filter, map, switchMap } from 'rxjs/operators'
import { interpret } from 'xstate'

export function getOpenAaveV2PositionStateMachineServices(
  context$: Observable<Context>,
  txHelpers$: Observable<TxHelpers>,
  tokenBalances$: Observable<TokenBalances | undefined>,
  connectedProxy$: Observable<string | undefined>,
  aaveUserAccountData$: (parameters: UserAccountDataArgs) => Observable<UserAccountData>,
  userSettings$: Observable<UserSettingsState>,
  prices$: (tokens: string[]) => Observable<Tickers>,
  strategyInfo$: (tokens: IStrategyConfig['tokens']) => Observable<IStrategyInfo>,
  aaveProtocolData$: (
    collateralToken: string,
    debtToken: string,
    proxyAddress: string,
  ) => Observable<ProtocolData>,
  tokenAllowance$: (token: string, spender: string) => Observable<BigNumber>,
  userDpmProxy$: Observable<UserDpmAccount | undefined>,
  hasProxyAddressActiveAavePosition$: (proxyAddress: string) => Observable<boolean>,
  aaveReserveConfiguration$: (
    args: AaveReserveConfigurationDataParams,
  ) => Observable<ReserveConfigurationData>,
): OpenAaveStateMachineServices {
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
        map((context) => ({
          type: 'WEB3_CONTEXT_CHANGED',
          web3Context: context,
        })),
      )
    },
    getBalance: (context, _) => {
      return tokenBalances$.pipe(
        map((balances) => {
          if (!balances) return {}
          const strategyBalance: StrategyTokenBalance = {
            collateral: balances[context.tokens.collateral],
            debt: balances[context.tokens.debt],
            deposit: balances[context.tokens.deposit],
          }
          return strategyBalance
        }),
        map((balances) => ({
          type: 'SET_BALANCE',
          balance: balances,
        })),
        distinctUntilChanged(isEqual),
      )
    },
    connectedProxyAddress$: () => {
      return connectedProxy$.pipe(
        map((address) => ({
          type: 'CONNECTED_PROXY_ADDRESS_RECEIVED',
          connectedProxyAddress: address,
        })),
        distinctUntilChanged(isEqual),
      )
    },
    getHasOpenedPosition$: (context) => {
      if (context.strategyConfig.proxyType === ProxyType.DpmProxy) {
        return of({ type: 'UPDATE_META_INFO', hasOpenedPosition: false })
      }

      return connectedProxy$.pipe(
        filter((address) => address !== undefined),
        switchMap((address) => hasProxyAddressActiveAavePosition$(address!)),
        map((hasPosition) => ({
          type: 'UPDATE_META_INFO',
          hasOpenedPosition: hasPosition,
        })),
      )
    },
    userSettings$: (_) => {
      return userSettings$.pipe(
        map((settings) => ({ type: 'USER_SETTINGS_CHANGED', userSettings: settings })),
        distinctUntilChanged(isEqual),
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
    protocolData$: (context) => {
      return connectedProxy$.pipe(
        filter((address) => address !== undefined),
        switchMap((proxyAddress) =>
          aaveProtocolData$(context.tokens.collateral, context.tokens.debt, proxyAddress!),
        ),
        map((aaveProtocolData) => ({
          type: 'UPDATE_PROTOCOL_DATA',
          protocolData: aaveProtocolData,
        })),
        distinctUntilChanged(isEqual),
      )
    },
    allowance$: (context) => {
      return iif(
        () => context.strategyConfig.proxyType === ProxyType.DpmProxy,
        userDpmProxy$.pipe(map((userDpmProxy) => userDpmProxy?.proxy)),
        connectedProxy$,
      ).pipe(
        filter(allDefined),
        switchMap((proxyAddress) => {
          return combineLatest([
            tokenAllowance$(context.tokens.deposit, proxyAddress!),
            tokenAllowance$(context.tokens.collateral, proxyAddress!),
            tokenAllowance$(context.tokens.debt, proxyAddress!),
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
    dpmProxy$: (_) => {
      return userDpmProxy$.pipe(
        map((proxy) => ({ type: 'DPM_PROXY_RECEIVED', userDpmAccount: proxy })),
        distinctUntilChanged(isEqual),
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
        distinctUntilChanged(isEqual),
      )
    },
    savePositionToDb$: () => {
      // TODO: replace with actual implementation.
      return of({ type: 'SWITCH_SUCCESS' })
    },
  }
}
