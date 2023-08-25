import BigNumber from 'bignumber.js'
import { createExecuteTransaction, DpmExecuteParameters } from 'blockchain/better-calls/dpm-account'
import { ensureEtherscanExist, getNetworkContracts } from 'blockchain/contracts'
import { Context } from 'blockchain/network'
import { Tickers } from 'blockchain/prices'
import { TokenBalances } from 'blockchain/tokens'
import { getPositionIdFromDpmProxy$, UserDpmAccount } from 'blockchain/userDpmProxies'
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
import { VaultType } from 'features/generalManageVault/vaultType'
import { jwtAuthGetToken } from 'features/shared/jwt'
import { saveVaultUsingApi$ } from 'features/shared/vaultApi'
import { createEthersTransactionStateMachine } from 'features/stateMachines/transaction'
import { UserSettingsState } from 'features/userSettings/userSettings'
import { allDefined } from 'helpers/allDefined'
import { TxHelpers } from 'helpers/context/types'
import { LendingProtocol } from 'lendingProtocols'
import {
  AaveLikeProtocolData,
  AaveLikeReserveConfigurationData,
  AaveLikeUserAccountData,
  AaveLikeUserAccountDataArgs,
  AaveReserveConfigurationDataParams,
} from 'lendingProtocols/aave-like-common'
import { isEqual } from 'lodash'
import { combineLatest, iif, Observable, of, throwError } from 'rxjs'
import { catchError, distinctUntilChanged, filter, map, switchMap } from 'rxjs/operators'
import { interpret } from 'xstate'

export function getOpenAaveV3PositionStateMachineServices(
  context$: Observable<Context>,
  txHelpers$: Observable<TxHelpers>,
  tokenBalances$: Observable<TokenBalances | undefined>,
  connectedProxy$: Observable<string | undefined>,
  aaveUserAccountData$: (
    parameters: AaveLikeUserAccountDataArgs,
  ) => Observable<AaveLikeUserAccountData>,
  userSettings$: Observable<UserSettingsState>,
  prices$: (tokens: string[]) => Observable<Tickers>,
  strategyInfo$: (tokens: IStrategyConfig['tokens']) => Observable<IStrategyInfo>,
  aaveProtocolData$: (
    collateralToken: string,
    debtToken: string,
    proxyAddress: string,
  ) => Observable<AaveLikeProtocolData>,
  tokenAllowance$: (token: string, spender: string) => Observable<BigNumber>,
  userDpmProxy$: Observable<UserDpmAccount | undefined>,
  hasProxyAddressActiveAavePosition$: (proxyAddress: string) => Observable<boolean>,
  aaveReserveConfiguration$: (
    args: AaveReserveConfigurationDataParams,
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
        distinctUntilChanged((a, b) => isEqual(a, b)),
      )
    },
    connectedProxyAddress$: () => {
      return connectedProxy$.pipe(
        map((address) => ({
          type: 'CONNECTED_PROXY_ADDRESS_RECEIVED',
          connectedProxyAddress: address,
        })),
        distinctUntilChanged((a, b) => isEqual(a, b)),
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
        distinctUntilChanged((a, b) => isEqual(a, b)),
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
        distinctUntilChanged((a, b) => isEqual(a, b)),
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
        distinctUntilChanged((a, b) => isEqual(a, b)),
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
    savePositionToDb$: (context) => {
      const chainId = context.strategyConfig.networkId

      if (!chainId) {
        return throwError(new Error('No chainId available - save position unsuccessful'))
      }

      const vaultType =
        context.strategyConfig.type === 'Borrow'
          ? VaultType.Borrow
          : context.strategyConfig.type === 'Multiply'
          ? VaultType.Multiply
          : context.strategyConfig.type === 'Earn'
          ? VaultType.Earn
          : undefined

      const proxy = context.userDpmAccount?.proxy
      const user = context.userDpmAccount?.user
      if (!proxy) {
        return throwError(new Error('No proxy available - save position unsuccessful'))
      }

      return getPositionIdFromDpmProxy$(of({ chainId }), proxy).pipe(
        switchMap((positionId) => {
          if (!positionId || !vaultType || !proxy || !user) {
            return throwError(new Error('No enough data provided to save position'))
          }
          const token = jwtAuthGetToken(user)
          if (!token) {
            return throwError(new Error('No token available - save position unsuccessful'))
          }
          return saveVaultUsingApi$(
            new BigNumber(positionId),
            token,
            vaultType,
            chainId,
            LendingProtocol.AaveV3,
          )
        }),
        map(() => ({ type: 'SAVE_POSITION_SUCCESS' })),
        catchError((error) => {
          console.error('Error saving to the DB:', error)
          return of({ type: 'SAVE_POSITION_ERROR', error })
        }),
      )
    },
  }
}
