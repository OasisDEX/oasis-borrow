/* eslint-disable func-style */
import { TxStatus } from '@oasisdex/transactions'
import BigNumber from 'bignumber.js'
import { merge, of } from 'rxjs'
import { first, map, switchMap } from 'rxjs/operators'

import { createDsProxy } from '../../../../../blockchain/calls/proxy'
import { TxMetaKind } from '../../../../../blockchain/calls/txMeta'
import { transactionToX } from '../../../../../helpers/form'
import { getOpenAaveParameters } from '../../../../aave'
import { openAavePosition, OpenAavePositionData } from '../pipelines/openAavePosition'
import {
  OpenAaveCallbackService,
  OpenAaveEvent,
  OpenAaveMachineService,
  OpenAaveObservableService,
} from './types'

const getProxyAddress: OpenAaveObservableService = ({ dependencies }, _) => {
  return dependencies.proxyAddress$.pipe(
    map((address) => ({
      type: 'PROXY_ADDRESS_RECEIVED',
      proxyAddress: address,
    })),
  )
}

const getBalance: OpenAaveObservableService = ({ dependencies, token }, _) => {
  return dependencies.tokenBalances$.pipe(
    map((balances) => balances[token!]),
    map(({ balance, price }) => ({
      type: 'SET_BALANCE',
      balance: balance,
      tokenPrice: price,
    })),
  )
}

const getTransactionParameters: OpenAaveCallbackService = () => (callback, onReceive) => {
  onReceive(async (e) => {
    if (e.type === 'TRANSACTION_PARAMETERS_CHANGED') {
      const result = await getOpenAaveParameters(e.amount, e.multiply, e.token)
      callback({
        type: 'TRANSACTION_PARAMETERS_RECEIVED',
        parameters: result,
      })
    }
  })
}

const invokeProxyMachine: OpenAaveMachineService = ({ proxyStateMachine }) => proxyStateMachine!

const createPosition: OpenAaveObservableService = (context) => {
  const { sendWithGasEstimation } = context.dependencies.txHelper
  // @ts-ignore
  return sendWithGasEstimation(openAavePosition, {
    kind: TxMetaKind.operationExecutor,
    calls: context.transactionParameters!.calls,
    operationName: context.transactionParameters!.operationName,
    token: context.token!,
    proxyAddress: context.proxyAddress!,
  }).pipe(
    transactionToX<OpenAaveEvent, OpenAavePositionData>(
      {
        type: 'TRANSACTION_WAITING_FOR_APPROVAL',
      },
      (txState) =>
        of({
          type: 'TRANSACTION_IN_PROGRESS',
          txHash: (txState as any).txHash as string,
        }),
      (txState) =>
        of({
          type: 'TRANSACTION_FAILURE',
          txError:
            txState.status === TxStatus.Error || txState.status === TxStatus.CancelledByTheUser
              ? txState.error
              : undefined,
        }),
      (_) => {
        const id = new BigNumber(123)
        // saving the position

        return of({
          type: 'TRANSACTION_SUCCESS',
          vaultNumber: id,
        })
      },
    ),
  )
}

const estimateGas: OpenAaveObservableService = ({ dependencies }, _) => {
  return dependencies.txHelper.estimateGas(createDsProxy, { kind: TxMetaKind.createDsProxy }).pipe(
    switchMap((gasData) => dependencies.getGasEstimation$(gasData)),
    first(),
    map((gas) => ({ type: 'GAS_COST_ESTIMATION', gasData: gas })),
  )
}

export const initMachine: OpenAaveObservableService = (context, event) => {
  return merge(getBalance(context, event), getProxyAddress(context, event))
}

export const services = {
  getProxyAddress,
  getBalance,
  createPosition,
  initMachine,
  invokeProxyMachine,
  getTransactionParameters,
  estimateGas,
}

export type Services = typeof services
