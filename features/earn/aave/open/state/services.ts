/* eslint-disable func-style */

import {
  createTransactionServices,
  createTransactionStateMachine,
} from '@oasis-borrow/state-machines/transaction'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { AnyStateMachine } from 'xstate'

import { TxMetaKind } from '../../../../../blockchain/calls/txMeta'
import { ContextConnected } from '../../../../../blockchain/network'
import { TokenBalances } from '../../../../../blockchain/tokens'
import { TxHelpers } from '../../../../../components/AppContext'
import { openAavePosition, OpenAavePositionData } from '../pipelines/openAavePosition'
import {
  OpenAaveContext,
  OpenAaveEvent,
  OpenAaveInvokeMachineService,
  OpenAaveObservableService,
} from './types'

export enum services {
  getProxyAddress = 'getProxyAddress',
  getBalance = 'getBalance',
  invokeProxyMachine = 'invokeProxyMachine',
  // invokeGetTransactionParametersMachine = 'invokeGetTransactionParametersMachine',
  createPosition = 'createPosition',
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
    [services.invokeProxyMachine]: (context: OpenAaveContext): AnyStateMachine =>
      context.dependencies.proxyStateMachine,

    [services.createPosition]: (context: OpenAaveContext): AnyStateMachine => {
      return createTransactionStateMachine(openAavePosition, {
        kind: TxMetaKind.operationExecutor,
        calls: context.transactionParameters!.calls as any,
        operationName: context.transactionParameters!.operationName,
        token: context.token,
        proxyAddress: context.proxyAddress!,
        amount: context.amount!,
      }).withConfig({
        services: {
          ...createTransactionServices<OpenAavePositionData>(txHelpers$, context$),
        },
      })
    },
  }
}
