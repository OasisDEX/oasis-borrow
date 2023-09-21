import type { SendFunction } from '@oasisdex/transactions'
import type { TransactionDef } from 'blockchain/calls/callsHelpers'
import {
  createSendTransaction,
  createSendWithGasConstraints,
  estimateGas,
} from 'blockchain/calls/callsHelpers'
import type { ContextConnected } from 'blockchain/network.types'
import type { GasPriceParams } from 'blockchain/prices.types'
import { getGasMultiplier } from 'helpers/getGasMultiplier'
import type { Observable } from 'rxjs'
import { filter, map } from 'rxjs/operators'

import type { TxData } from './context/TxData'
import type { TxHelpers$ } from './context/TxHelpers'

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
