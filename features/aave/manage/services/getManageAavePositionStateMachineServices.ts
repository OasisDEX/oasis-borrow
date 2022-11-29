import { isEqual } from 'lodash'
import { Observable } from 'rxjs'
import { distinctUntilChanged, filter, map, switchMap } from 'rxjs/operators'

import { Context } from '../../../../blockchain/network'
import { Tickers } from '../../../../blockchain/prices'
import { TokenBalances } from '../../../../blockchain/tokens'
import { TxHelpers } from '../../../../components/AppContext'
import { UserSettingsState } from '../../../userSettings/userSettings'
import { IStrategyInfo } from '../../common/BaseAaveContext'
import { getPricesFeed$ } from '../../common/services/getPricesFeed'
import { ManageAaveStateMachineServices } from '../state'
import { AaveProtocolData } from './getAaveProtocolData'

export function getManageAavePositionStateMachineServices(
  context$: Observable<Context>,
  txHelpers$: Observable<TxHelpers>,
  tokenBalances$: Observable<TokenBalances>,
  connectedProxyAddress$: Observable<string | undefined>,
  proxyAddress$: (account: string) => Observable<string | undefined>,
  userSettings$: Observable<UserSettingsState>,
  prices$: (tokens: string[]) => Observable<Tickers>,
  strategyInfo$: (collateralToken: string) => Observable<IStrategyInfo>,
  aaveProtocolData$: (
    collateralToken: string,
    debtToken: string,
    address: string,
  ) => Observable<AaveProtocolData>,
): ManageAaveStateMachineServices {
  const pricesFeed$ = getPricesFeed$(prices$)
  return {
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
        map((balances) => balances[context.tokens.deposit]),
        map(({ balance, price }) => ({
          type: 'SET_BALANCE',
          tokenBalance: balance,
          tokenPrice: price,
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
      return proxyAddress$(context.address).pipe(
        distinctUntilChanged<string>(isEqual),
        map((address) => ({
          type: 'POSITION_PROXY_ADDRESS_RECEIVED',
          proxyAddress: address,
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
    currentPosition$: (context) => {
      return proxyAddress$(context.address).pipe(
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
      return proxyAddress$(context.address).pipe(
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
  }
}
