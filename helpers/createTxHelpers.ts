import type { SendFunction } from '@oasisdex/transactions'
import type {
  TransactionDef } from 'blockchain/calls/callsHelpers';
import {
  createSendTransaction,
  createSendWithGasConstraints,
  estimateGas
} from 'blockchain/calls/callsHelpers'
import type { ContextConnected } from 'blockchain/network'
import type { GasPriceParams } from 'blockchain/prices'
import { getGasMultiplier } from 'helpers/getGasMultiplier'
import type { Observable } from 'rxjs'
import { filter, map } from 'rxjs/operators'

import type { TxData, TxHelpers$ } from './context/types'

export function createTxHelpers$(
  context$: Observable<ContextConnected>,
  send: SendFunction<TxData>,
  gasPrice$: Observable<GasPriceParams>,
): TxHelpers$ {
  return context$.pipe(
    filter(({ status }) => status === 'connected'),
    map((context) => ({
      send: createSendTransaction(send, context),
      sendWithGasEstimation: createSendWithGasConstraints(
        send,
        context,
        gasPrice$,
        getGasMultiplier(context),
      ),
      estimateGas: <B extends TxData>(def: TransactionDef<B>, args: B): Observable<number> => {
        return estimateGas(context, def, args, getGasMultiplier(context))
      },
    })),
  )
}
