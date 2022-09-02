/* eslint-disable func-style */

import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

import { TxMetaKind } from '../../../../../blockchain/calls/txMeta'
import { ContextConnected } from '../../../../../blockchain/network'
import { TokenBalances } from '../../../../../blockchain/tokens'
import { TxHelpers } from '../../../../../components/AppContext'
import { OpenAavePositionData } from '../pipelines/openAavePosition'
import {
  OpenAaveContext,
  OpenAaveEvent,
  OpenAaveInvokeMachineService,
  OpenAaveObservableService,
} from './types'
import { AaveReserveConfigurationData } from '../../../../../blockchain/calls/aaveProtocolDataProvider'
import { BigNumber } from 'bignumber.js'

export enum services {
  getProxyAddress = 'getProxyAddress',
  getBalance = 'getBalance',
  maxMultiple = 'maxMultiple',
  // createPosition = 'createPosition',
}

export type OpenAaveStateMachineServices = {
  [key in services]: OpenAaveObservableService | OpenAaveInvokeMachineService
}

export function getOpenAavePositionStateMachineServices(
  context$: Observable<ContextConnected>,
  txHelpers$: Observable<TxHelpers>,
  tokenBalances$: Observable<TokenBalances>,
  proxyAddress$: Observable<string | undefined>,
  aaveReserveConfigurationData$: Observable<AaveReserveConfigurationData>,
): OpenAaveStateMachineServices {
  return {
    [services.getBalance]: (context, _): Observable<OpenAaveEvent> => {
      return tokenBalances$.pipe(
        map((balances) => balances[context.token!]),
        map(({ balance, price }) => ({
          type: 'SET_BALANCE',
          balance: balance,
          tokenPrice: price,
        })),
      )
    },
    [services.getProxyAddress]: (): Observable<OpenAaveEvent> => {
      return proxyAddress$.pipe(
        map((address) => ({
          type: 'PROXY_ADDRESS_RECEIVED',
          proxyAddress: address,
        })),
      )
    },
    [services.maxMultiple]: (): Observable<OpenAaveEvent> => {
      return aaveReserveConfigurationData$.pipe(
        map(({ ltv, liquidationThreshold }) => {
          // ltv = 6900
          const minColRatio = new BigNumber(1).div(ltv.div(100)).times(100)
          const maxMultiple = new BigNumber(1).div(minColRatio.minus(1)).plus(1)
          return {
            type: 'SET_MAX_MULTIPLE',
            maxMultiple,
            liquidationThreshold: liquidationThreshold,
          }
        }),
      )
    },
  }
}

export function contextToTransactionParameters(context: OpenAaveContext): OpenAavePositionData {
  return {
    kind: TxMetaKind.operationExecutor,
    calls: context.transactionParameters!.calls as any,
    operationName: context.transactionParameters!.operationName,
    token: context.token,
    proxyAddress: context.proxyAddress!,
    amount: context.amount!,
  }
}
