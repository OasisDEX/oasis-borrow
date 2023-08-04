import { SendFunction } from '@oasisdex/transactions'
import {
  createSendTransaction,
  createSendWithGasConstraints,
  estimateGas,
  TransactionDef,
} from 'blockchain/calls/callsHelpers'
import { ContextConnected } from 'blockchain/network'
import { GasPriceParams } from 'blockchain/prices'
import { getGasMultiplier } from 'helpers/getGasMultiplier'
import { Observable } from 'rxjs'
import { filter, map } from 'rxjs/operators'

import { TxData, TxHelpers$ } from './context/types'

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
