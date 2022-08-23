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

export enum services {
  getProxyAddress = 'getProxyAddress',
  getBalance = 'getBalance',
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
