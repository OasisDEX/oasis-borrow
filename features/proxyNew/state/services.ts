/* eslint-disable func-style */
import { TxStatus } from '@oasisdex/transactions'
import { iif, of } from 'rxjs'
import { filter, first, map, switchMap } from 'rxjs/operators'

import { createDsProxy, CreateDsProxyData } from '../../../blockchain/calls/proxy'
import { TxMetaKind } from '../../../blockchain/calls/txMeta'
import { transactionToX } from '../../../helpers/form'
import { ProxyContext, ProxyEvent, ProxyObservableService } from './types'

const createProxy: ProxyObservableService = ({ dependencies }: ProxyContext, _: ProxyEvent) => {
  const {
    proxyAddress$,
    safeConfirmations,
    txHelper: { sendWithGasEstimation },
  } = dependencies

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
      (txState) =>
        proxyAddress$.pipe(
          filter((proxyAddress) => !!proxyAddress),
          switchMap((proxyAddress) =>
            iif(
              () => (txState as any).confirmations > 0,
              of({
                type: 'CONFIRMED',
                proxyConfirmations: (txState as any).confirmations,
              }),
              of({
                type: 'SUCCESS',
                proxyAddress: proxyAddress!,
              }),
            ),
          ),
        ),
      safeConfirmations,
    ),
  )
}

const estimateGas: ProxyObservableService = ({ dependencies }: ProxyContext, _: ProxyEvent) => {
  return dependencies.txHelper.estimateGas(createDsProxy, { kind: TxMetaKind.createDsProxy }).pipe(
    switchMap((gasData) => dependencies.getGasEstimation$(gasData)),
    first(),
    map((gas) => ({ type: 'GAS_COST_ESTIMATION', gasData: gas })),
  )
}

export const services = {
  createProxy,
  estimateGas,
}
