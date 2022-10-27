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
  aaveProtocolData$: (collateralToken: string, address: string) => Observable<AaveProtocolData>,
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
        map((balances) => balances[context.token!]),
        map(({ balance, price }) => ({
          type: 'SET_BALANCE',
          tokenBalance: balance,
          tokenPrice: price,
        })),
      )
    },
    connectedProxyAddress$: () => {
      return connectedProxy$.pipe(
        distinctUntilChanged<string>(isEqual),
        map((address) => ({
          type: 'CONNECTED_PROXY_ADDRESS_RECEIVED',
          connectedProxyAddress: address,
        })),
      )
    },
    getHasOpenedPosition$: ({ connectedProxyAddress }) => {
      return aaveUserAccountData$({ address: connectedProxyAddress }).pipe(
        map((accountData) => ({
          type: 'UPDATE_META_INFO',
          hasOpenedPosition: accountData.totalCollateralETH.gt(MINIMAL_COLLATERAL),
        })),
      )
    },
    userSettings$: (_) => {
      return userSettings$.pipe(
        distinctUntilChanged(isEqual),
        map((settings) => ({ type: 'USER_SETTINGS_CHANGED', userSettings: settings })),
      )
    },
    prices$: (context) => {
      return pricesFeed$(context.collateralToken)
    },
    strategyInfo$: (context) => {
      return strategyInfo$(context.collateralToken).pipe(
        map((strategyInfo) => ({
          type: 'UPDATE_STRATEGY_INFO',
          strategyInfo,
        })),
      )
    },
    protocolData$: (context) => {
      return connectedProxy$.pipe(
        filter((address) => address !== undefined),
        switchMap((proxyAddress) => aaveProtocolData$(context.collateralToken, proxyAddress!)),
        map((aaveProtocolData) => ({
          type: 'UPDATE_PROTOCOL_DATA',
          protocolData: aaveProtocolData,
        })),
      )
    },
  }
}

export function getOpenAaveStateMachine(
  services: OpenAaveStateMachineServices,
  parametersMachine: TransactionParametersStateMachine<OpenAaveParameters>,
  proxyMachine: ProxyStateMachine,
  transactionStateMachine: (
    transactionParameters: OperationExecutorTxMeta,
  ) => TransactionStateMachine<OperationExecutorTxMeta>,
) {
  return createOpenAaveStateMachine(
    parametersMachine,
    proxyMachine,
    transactionStateMachine,
  ).withConfig({
    services: {
      ...services,
    },
  })
}
