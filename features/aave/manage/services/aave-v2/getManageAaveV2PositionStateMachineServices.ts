import BigNumber from 'bignumber.js'
import { isEqual } from 'lodash'
import { combineLatest, Observable } from 'rxjs'
import { distinctUntilChanged, filter, map, switchMap } from 'rxjs/operators'

import { Context } from '../../../../../blockchain/network'
import { Tickers } from '../../../../../blockchain/prices'
import { TokenBalances } from '../../../../../blockchain/tokens'
import { TxHelpers } from '../../../../../components/AppContext'
import { allDefined } from '../../../../../helpers/allDefined'
import { AaveProtocolData } from '../../../../../lendingProtocols/aave-v2/pipelines'
import { UserSettingsState } from '../../../../userSettings/userSettings'
import {
  IStrategyInfo,
  StrategyTokenAllowance,
  StrategyTokenBalance,
} from '../../../common/BaseAaveContext'
import { getPricesFeed$ } from '../../../common/services/getPricesFeed'
import { ProxiesRelatedWithPosition } from '../../../helpers/getProxiesRelatedWithPosition'
import { PositionId } from '../../../types'
import { ManageAaveStateMachineServices } from '../../state'

export function getManageAaveV2PositionStateMachineServices(
  context$: Observable<Context>,
  txHelpers$: Observable<TxHelpers>,
  tokenBalances$: Observable<TokenBalances | undefined>,
  connectedProxyAddress$: Observable<string | undefined>,
  proxiesRelatedWithPosition$: (positionId: PositionId) => Observable<ProxiesRelatedWithPosition>,
  userSettings$: Observable<UserSettingsState>,
  prices$: (tokens: string[]) => Observable<Tickers>,
  strategyInfo$: (collateralToken: string) => Observable<IStrategyInfo>,
  aaveProtocolData$: (
    collateralToken: string,
    debtToken: string,
    proxyAddress: string,
  ) => Observable<AaveProtocolData>,
  tokenAllowance$: (token: string, spender: string) => Observable<BigNumber>,
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
      return strategyInfo$(context.tokens.collateral).pipe(
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
