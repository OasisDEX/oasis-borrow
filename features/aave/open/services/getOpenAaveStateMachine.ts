import {
  AaveUserAccountData,
  AaveUserAccountDataParameters,
  MINIMAL_COLLATERAL,
} from 'blockchain/calls/aave/aaveLendingPool'
import { isEqual } from 'lodash'
import { Observable } from 'rxjs'
import { distinctUntilChanged, filter, map, switchMap } from 'rxjs/operators'

import { OperationExecutorTxMeta } from '../../../../blockchain/calls/operationExecutor'
import { ContextConnected } from '../../../../blockchain/network'
import { Tickers } from '../../../../blockchain/prices'
import { TokenBalances } from '../../../../blockchain/tokens'
import { TxHelpers } from '../../../../components/AppContext'
import { ProxyStateMachine } from '../../../proxyNew/state'
import { TransactionStateMachine } from '../../../stateMachines/transaction'
import { TransactionParametersStateMachine } from '../../../stateMachines/transactionParameters'
import { UserSettingsState } from '../../../userSettings/userSettings'
import { IStrategyInfo } from '../../common/BaseAaveContext'
import { getPricesFeed$ } from '../../common/services/getPricesFeed'
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
    address: string,
  ) => Observable<AaveProtocolData>,
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
        map((balances) => balances[context.tokens.deposit]),
        map(({ balance, price }) => ({
          type: 'SET_BALANCE',
          tokenBalance: balance,
          tokenPrice: price,
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
    getHasOpenedPosition$: () => {
      return connectedProxy$.pipe(
        filter((address) => address !== undefined),
        switchMap((address) => aaveUserAccountData$({ address: address! })),
        map((accountData) => ({
          type: 'UPDATE_META_INFO',
          hasOpenedPosition: accountData.totalCollateralETH.gt(MINIMAL_COLLATERAL),
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
      return pricesFeed$(context.tokens.collateral)
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
  }
}

export function getOpenAaveStateMachine(
  services: OpenAaveStateMachineServices,
  transactionParametersMachine: TransactionParametersStateMachine<OpenAaveParameters>,
  proxyMachine: ProxyStateMachine,
  transactionStateMachine: (
    transactionParameters: OperationExecutorTxMeta,
  ) => TransactionStateMachine<OperationExecutorTxMeta>,
) {
  return createOpenAaveStateMachine(
    transactionParametersMachine,
    proxyMachine,
    transactionStateMachine,
  ).withConfig({
    services: {
      ...services,
    },
  })
}
