import BigNumber from 'bignumber.js'
import {
  AaveUserAccountData,
  AaveUserAccountDataParameters,
} from 'blockchain/calls/aave/aaveLendingPool'
import { isEqual } from 'lodash'
import { combineLatest, iif, Observable, of } from 'rxjs'
import { distinctUntilChanged, filter, map, switchMap } from 'rxjs/operators'

import { TransactionDef } from '../../../../blockchain/calls/callsHelpers'
import { OperationExecutorTxMeta } from '../../../../blockchain/calls/operationExecutor'
import { ContextConnected } from '../../../../blockchain/network'
import { Tickers } from '../../../../blockchain/prices'
import { TokenBalances } from '../../../../blockchain/tokens'
import { UserDpmProxy } from '../../../../blockchain/userDpmProxies'
import { TxHelpers } from '../../../../components/AppContext'
import { allDefined } from '../../../../helpers/allDefined'
import { AllowanceStateMachine } from '../../../stateMachines/allowance'
import { DPMAccountStateMachine } from '../../../stateMachines/dpmAccount/state/createDPMAccountStateMachine'
import { ProxyStateMachine } from '../../../stateMachines/proxy/state'
import { TransactionStateMachine } from '../../../stateMachines/transaction'
import { TransactionParametersStateMachine } from '../../../stateMachines/transactionParameters'
import { UserSettingsState } from '../../../userSettings/userSettings'
import {
  IStrategyInfo,
  StrategyTokenAllowance,
  StrategyTokenBalance,
} from '../../common/BaseAaveContext'
import { getPricesFeed$ } from '../../common/services/getPricesFeed'
import { ProxyType } from '../../common/StrategyConfigTypes'
import { AaveProtocolData } from '../../manage/services'
import { OpenAaveParameters } from '../../oasisActionsLibWrapper'
import { createOpenAaveStateMachine, OpenAaveStateMachineServices } from '../state'

export function getOpenAavePositionStateMachineServices(
  context$: Observable<ContextConnected>,
  txHelpers$: Observable<TxHelpers>,
  tokenBalances$: Observable<TokenBalances>,
  connectedProxy$: Observable<string | undefined>,
  aaveUserAccountData$: (
    parameters: AaveUserAccountDataParameters,
  ) => Observable<AaveUserAccountData>,
  userSettings$: Observable<UserSettingsState>,
  prices$: (tokens: string[]) => Observable<Tickers>,
  strategyInfo$: (collateralToken: string) => Observable<IStrategyInfo>,
  aaveProtocolData$: (
    collateralToken: string,
    debtToken: string,
    proxyAddress: string,
  ) => Observable<AaveProtocolData>,
  tokenAllowance$: (token: string, spender: string) => Observable<BigNumber>,
  userDpmProxy$: Observable<UserDpmProxy | undefined>,
  hasProxyAddressActiveAavePosition$: (proxyAddress: string) => Observable<boolean>,
): OpenAaveStateMachineServices {
  const pricesFeed$ = getPricesFeed$(prices$)
  return {
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
          const strategyBalance: StrategyTokenBalance = {
            collateral: balances[context.tokens.collateral],
            debt: balances[context.tokens.debt],
            deposit: balances[context.tokens.deposit],
          }
          return strategyBalance
        }),
        map((balance) => ({
          type: 'SET_BALANCE',
          balance: balance,
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
      return strategyInfo$(context.tokens.collateral).pipe(
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
        map((proxy) => ({ type: 'DMP_PROXY_RECEIVED', userDpmProxy: proxy })),
        distinctUntilChanged(isEqual),
      )
    },
  }
}

export function getOpenAaveStateMachine(
  services: OpenAaveStateMachineServices,
  transactionParametersMachine: TransactionParametersStateMachine<OpenAaveParameters>,
  dsProxyMachine: ProxyStateMachine,
  dpmProxyMachine: DPMAccountStateMachine,
  allowanceMachine: AllowanceStateMachine,
  transactionStateMachine: (
    transactionParameters: OperationExecutorTxMeta,
    transactionDef: TransactionDef<OperationExecutorTxMeta>,
  ) => TransactionStateMachine<OperationExecutorTxMeta>,
) {
  return createOpenAaveStateMachine(
    transactionParametersMachine,
    dsProxyMachine,
    dpmProxyMachine,
    allowanceMachine,
    transactionStateMachine,
  ).withConfig({
    services: {
      ...services,
    },
  })
}
