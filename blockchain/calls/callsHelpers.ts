import { SendFunction, TxMeta } from '@oasisdex/transactions'
import {
  CallDef as CallDefAbstractContext,
  createSendTransaction as createSendTransactionAbstractContext,
  createSendWithGasConstraints1559 as createSendWithGasConstraintsAbstractContext,
  estimateGas as estimateGasAbstractContext,
  EstimateGasFunction as EstimateGasFunctionAbstractContext,
  SendTransactionFunction as SendTransactionFunctionAbstractContext,
  TransactionDef as TransactionDefAbstractContext,
} from '@oasisdex/transactions'
import { from, Observable } from 'rxjs'
import { map } from 'rxjs/operators'

import { Context, ContextConnected } from '../network'
import { GasPrice$ } from '../prices'

export type CallDef<A, R> = CallDefAbstractContext<A, R, Context>

export type TransactionDef<A extends TxMeta> = TransactionDefAbstractContext<A, ContextConnected>

export type EstimateGasFunction<A extends TxMeta> = EstimateGasFunctionAbstractContext<
  A,
  ContextConnected
>
export type SendTransactionFunction<A extends TxMeta> = SendTransactionFunctionAbstractContext<
  A,
  ContextConnected
>

export function callAbstractContext<D, R, CC extends Context>(
  context: CC,
  { call, prepareArgs, postprocess }: CallDefAbstractContext<D, R, CC>,
): (args: D) => Observable<R> {
  return (args: D) => {
    return from<R>(
      call(
        args,
        context,
      )(...prepareArgs(args, context)).call(
        // spot neccessary to read osms in readonly
        { from: context.mcdSpot.address },
      ),
    ).pipe(map((i: R) => (postprocess ? postprocess(i, args) : i)))
  }
}

export function call<D, R>(context: Context, callDef: CallDef<D, R>) {
  return callAbstractContext<D, R, Context>(context, callDef)
}

export function estimateGas<A extends TxMeta>(
  context: ContextConnected,
  txDef: TransactionDef<A>,
  args: A,
) {
  return estimateGasAbstractContext<A, ContextConnected>(context, txDef, args)
}

export function createSendTransaction<A extends TxMeta>(
  send: SendFunction<A>,
  context: ContextConnected,
): SendTransactionFunction<A> {
  return createSendTransactionAbstractContext<A, ContextConnected>(send, context)
}

export function createSendWithGasConstraints<A extends TxMeta>(
  send: SendFunction<A>,
  context: ContextConnected,
  gasPrice$: GasPrice$,
) {
  return createSendWithGasConstraintsAbstractContext<A, ContextConnected>(send, context, gasPrice$)
}
