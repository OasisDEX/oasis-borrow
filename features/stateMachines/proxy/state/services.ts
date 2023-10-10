/* eslint-disable func-style */
import { TxStatus } from '@oasisdex/transactions'
import type { CreateDsProxyData } from 'blockchain/calls/proxy'
import { createDsProxy } from 'blockchain/calls/proxy'
import { TxMetaKind } from 'blockchain/calls/txMeta'
import { getNetworkContracts } from 'blockchain/contracts'
import type { ContextConnected } from 'blockchain/network.types'
import { NetworkIds } from 'blockchain/networks'
import type { TxHelpers } from 'helpers/context/TxHelpers'
import { transactionToX } from 'helpers/form'
import { isEqual } from 'lodash'
import { of } from 'rxjs'
import { distinctUntilChanged, filter, map, switchMap } from 'rxjs/operators'

import type { ProxyContext, ProxyEvent, ProxyObservableService } from './types'

const createProxy: ProxyObservableService = (
  { dependencies, contextConnected, txHelpers }: ProxyContext,
  _: ProxyEvent,
) => {
  const { proxyAddress$ } = dependencies

  const safeConfirmations = getNetworkContracts(
    NetworkIds.MAINNET,
    contextConnected!.chainId,
  ).safeConfirmations
  const sendWithGasEstimation = txHelpers!.sendWithGasEstimation

  return sendWithGasEstimation(createDsProxy, {
    kind: TxMetaKind.createDsProxy,
  }).pipe(
    transactionToX<ProxyEvent, CreateDsProxyData>(
      {
        type: 'WAITING_FOR_APPROVAL',
      },
      (txState) =>
        of({
          type: 'IN_PROGRESS',
          proxyTxHash: (txState as any).txHash as string,
        }),
      (txState) =>
        of({
          type: 'FAILURE',
          txError:
            txState.status === TxStatus.Error || txState.status === TxStatus.CancelledByTheUser
              ? txState.error
              : undefined,
        }),
      () =>
        proxyAddress$.pipe(
          filter((proxyAddress) => !!proxyAddress),
          map((proxyAddress) => ({
            type: 'SUCCESS',
            proxyAddress: proxyAddress!,
          })),
        ),
      safeConfirmations,
    ),
  )
}

const estimateGas: ProxyObservableService = (
  { dependencies, txHelpers }: ProxyContext,
  _: ProxyEvent,
) => {
  return txHelpers!.estimateGas(createDsProxy, { kind: TxMetaKind.createDsProxy }).pipe(
    distinctUntilChanged<number>(isEqual),
    switchMap((gasData) => dependencies.getGasEstimation$(gasData)),
    map((gas) => ({ type: 'GAS_COST_ESTIMATION', gasData: gas })),
  )
}

const context$: ProxyObservableService = ({ dependencies }: ProxyContext, _: ProxyEvent) => {
  return dependencies.context$.pipe(
    distinctUntilChanged<ContextConnected>(isEqual),
    map((context) => ({
      type: 'CONNECTED_CONTEXT_CHANGED',
      contextConnected: context,
    })),
  )
}

const txHelpers$: ProxyObservableService = ({ dependencies }: ProxyContext, _: ProxyEvent) => {
  return dependencies.txHelpers$.pipe(
    distinctUntilChanged<TxHelpers>(),
    map((txHelpers) => ({
      type: 'TX_HELPERS_CHANGED',
      txHelpers,
    })),
  )
}

export const services = {
  createProxy,
  estimateGas,
  context$,
  txHelpers$,
}
