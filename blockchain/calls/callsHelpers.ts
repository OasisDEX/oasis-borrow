import { SendFunction, TxMeta } from '@oasisdex/transactions'
import {
  CallDef as CallDefAbstractContext,
  createSendTransaction as createSendTransactionAbstractContext,
  createSendWithGasConstraints as createSendWithGasConstraintsAbstractContext,
  //estimateGas as estimateGasAbstractContext,
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
        context.status === 'connected'
          ? { from: (context as any).account }
          : // spot neccessary to read osms in readonly
            { from: context.mcdSpot.address },
      ),
    ).pipe(map((i: R) => (postprocess ? postprocess(i, args) : i)))
  }
}

export function call<D, R>(context: Context, callDef: CallDef<D, R>) {
  return callAbstractContext<D, R, Context>(context, callDef)
}

// export function estimateGas<A extends TxMeta>(
//   context: ContextConnected,
//   txDef: TransactionDef<A>,
//   args: A,
// ) {
//   return estimateGasAbstractContext<A, ContextConnected>(context, txDef, args)
// }

// we accommodate for the fact that blockchain state
// can be different when tx execute and it can take more gas
const GAS_ESTIMATION_MULTIPLIER = 1.5

export function estimateGas<A extends TxMeta, CC extends ContextConnected>(
  context: CC,
  { call, prepareArgs, options }: TransactionDefAbstractContext<A, CC>,
  args: A,
): Observable<number> {
  const result = from<number>(
    (call
      ? call(
          args,
          context,
          context.status === 'connected' ? context.account : undefined,
        )(...prepareArgs(args, context, context.account))
      : context.web3.eth
    ).estimateGas({
      from: context.account,
      ...(options ? options(args) : {}),
    }),
  ).pipe(
    map((e: number) => {
      return Math.floor(e * GAS_ESTIMATION_MULTIPLIER)
    }),
  )

  return result
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
