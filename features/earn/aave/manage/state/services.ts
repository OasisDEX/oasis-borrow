/* eslint-disable func-style */

import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

import { TxMetaKind } from '../../../../../blockchain/calls/txMeta'
import { ContextConnected } from '../../../../../blockchain/network'
import { TokenBalances } from '../../../../../blockchain/tokens'
import { TxHelpers } from '../../../../../components/AppContext'
import { ManageAavePositionData } from '../pipelines/manageAavePosition'
import {
  ManageAaveContext,
  ManageAaveEvent,
  ManageAaveInvokeMachineService,
  ManageAaveObservableService,
} from './types'

export enum services {
  getProxyAddress = 'getProxyAddress',
  // getBalance = 'getBalance',
  // createPosition = 'createPosition',
}

export type ManageAaveStateMachineServices = {
  [key in services]: ManageAaveObservableService | ManageAaveInvokeMachineService
}

export function getManageAavePositionStateMachineServices(
  context$: Observable<ContextConnected>,
  txHelpers$: Observable<TxHelpers>,
  tokenBalances$: Observable<TokenBalances>,
  proxyAddress$: Observable<string | undefined>,
): ManageAaveStateMachineServices {
  return {
    // [services.getBalance]: (context, _): Observable<ManageAaveEvent> => {
    //   return tokenBalances$.pipe(
    //     map((balances) => {
    //       return balances[context.token!]
    //     }),
    //     map(({ balance, price }) => ({
    //       type: 'SET_BALANCE',
    //       balance: balance,
    //       tokenPrice: price,
    //     })),
    //   )
    // },
    [services.getProxyAddress]: (): Observable<ManageAaveEvent> => {
      return proxyAddress$.pipe(
        map((address) => ({
          type: 'PROXY_ADDRESS_RECEIVED',
          proxyAddress: address,
        })),
      )
    },
  }
}

export function contextToTransactionParameters(context: ManageAaveContext): ManageAavePositionData {
  return {
    kind: TxMetaKind.operationExecutor,
    calls: context.transactionParameters!.calls as any,
    operationName: context.transactionParameters!.operationName,
    token: context.token,
    proxyAddress: context.proxyAddress!,
    amount: context.amount!,
  }
}
