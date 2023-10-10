import type BigNumber from 'bignumber.js'
import type { DpmExecuteParameters } from 'blockchain/better-calls/dpm-account'
import { createExecuteTransaction } from 'blockchain/better-calls/dpm-account'
import { ensureEtherscanExist, getNetworkContracts } from 'blockchain/contracts'
import type { Context } from 'blockchain/network.types'
import type { Tickers } from 'blockchain/prices.types'
import type { TokenBalances } from 'blockchain/tokens.types'
import type { UserDpmAccount } from 'blockchain/userDpmProxies.types'
import type { OpenAaveStateMachineServices } from 'features/aave/open/state'
import { getPricesFeed$ } from 'features/aave/services'
import type {
  IStrategyInfo,
  StrategyTokenAllowance,
  StrategyTokenBalance,
} from 'features/aave/types'
import { contextToEthersTransactions, ProxyType } from 'features/aave/types'
import type { IStrategyConfig } from 'features/aave/types/strategy-config'
import { createEthersTransactionStateMachine } from 'features/stateMachines/transaction'
import type { UserSettingsState } from 'features/userSettings/userSettings.types'
import { allDefined } from 'helpers/allDefined'
import type { TxHelpers } from 'helpers/context/TxHelpers'
import type {
  AaveLikeProtocolData,
  AaveLikeReserveConfigurationData,
  AaveLikeReserveConfigurationDataParams,
  AaveLikeUserAccountData,
  AaveLikeUserAccountDataArgs,
} from 'lendingProtocols/aave-like-common'
import { isEqual } from 'lodash'
import type { Observable } from 'rxjs'
import { combineLatest, iif, of } from 'rxjs'
import { distinctUntilChanged, filter, map, switchMap } from 'rxjs/operators'
import { interpret } from 'xstate'

export function getOpenAaveV2PositionStateMachineServices(
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
  aaveLikeProtocolData$: (
    collateralToken: string,
    debtToken: string,
    proxyAddress: string,
  ) => Observable<AaveLikeProtocolData>,
  tokenAllowance$: (token: string, spender: string) => Observable<BigNumber>,
  userDpmProxy$: Observable<UserDpmAccount | undefined>,
  hasProxyAddressActiveAavePosition$: (proxyAddress: string) => Observable<boolean>,
  aaveReserveConfiguration$: (
    args: AaveLikeReserveConfigurationDataParams,
  ) => Observable<AaveLikeReserveConfigurationData>,
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
          aaveLikeProtocolData$(context.tokens.collateral, context.tokens.debt, proxyAddress!),
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
