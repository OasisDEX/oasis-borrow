import { SendFunction, TxMeta } from '@oasisdex/transactions'
import {
  call as callAbstractContext,
  CallDef as CallDefAbstractContext,
  createSendTransaction as createSendTransactionAbstractContext,
  createSendWithGasConstraints as createSendWithGasConstraintsAbstractContext,
  estimateGas as estimateGasAbstractContext,
  EstimateGasFunction as EstimateGasFunctionAbstractContext,
  SendTransactionFunction as SendTransactionFunctionAbstractContext,
  TransactionDef as TransactionDefAbstractContext,
} from '@oasisdex/transactions'
import { GasPrice$ } from 'components/blockchain/prices'

import { Context, ContextConnected } from '../network'

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

export function call<D, R>(context: ContextConnected, callDef: CallDef<D, R>) {
  return callAbstractContext<D, R, ContextConnected>(context, callDef)
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
