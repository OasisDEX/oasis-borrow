import type { SendFunction, TxMeta, TxState } from '@oasisdex/transactions'
import type BigNumber from 'bignumber.js'
import { getNetworkContracts } from 'blockchain/contracts'
import type { Context, ContextConnected } from 'blockchain/network.types'
import { NetworkIds } from 'blockchain/networks'
import type { GasPrice$ } from 'blockchain/prices.types'
import type { Observable } from 'rxjs'
import { combineLatest, from } from 'rxjs'
import { first, map, switchMap } from 'rxjs/operators'

export type TxOptions = { to?: string; value?: string; from?: string; gas?: number }
export type ArgsType = Array<string | string[] | number | number[] | boolean>

export interface CallDefAbstractContext<A, R, C extends Context> {
  call: (args: A, context: C, account?: string) => any
  prepareArgs: (args: A, context: C, account?: string) => any[]
  postprocess?: (r: R, a: A) => R
}

export interface TransactionDefAbstractContext<A extends TxMeta, CC extends ContextConnected> {
  call?: (args: A, context: CC, account?: string) => any
  prepareArgs: (args: A, context: CC, account?: string) => ArgsType
  options?: (args: A) => TxOptions
}

export type EstimateGasFunctionAbstractContext<A extends TxMeta, CC extends ContextConnected> = <
  B extends A,
>(
  def: TransactionDefAbstractContext<B, CC>,
  args: B,
) => Observable<number>

export type CallDef<A, R> = CallDefAbstractContext<A, R, Context>

export type TransactionDef<A extends TxMeta> = TransactionDefAbstractContext<A, ContextConnected>

export type EstimateGasFunction<A extends TxMeta> = EstimateGasFunctionAbstractContext<
  A,
  ContextConnected
>
export type SendTransactionFunctionAbstractContext<
  A extends TxMeta,
  CC extends ContextConnected,
> = <B extends A>(def: TransactionDefAbstractContext<B, CC>, args: B) => Observable<TxState<B>>

export type SendTransactionFunction<A extends TxMeta> = SendTransactionFunctionAbstractContext<
  A,
  ContextConnected
>

type GasPriceParams = {
  maxFeePerGas: BigNumber
  maxPriorityFeePerGas: BigNumber
}
type GasPrice1559$ = Observable<GasPriceParams>

export function createSendTransactionAbstractContext<A extends TxMeta, CC extends ContextConnected>(
  send: SendFunction<A>,
  context: CC,
): SendTransactionFunctionAbstractContext<A, CC> {
  return <B extends A>(
    { call, prepareArgs, options }: TransactionDefAbstractContext<B, CC>,
    args: B,
  ): Observable<TxState<B>> => {
    return send(context.account, context.chainId as unknown as string, args, () =>
      call
        ? call(
            args,
            context,
            context.account,
          )(...prepareArgs(args, context, context.account)).send({
            from: context.account,
            ...(options ? options(args) : {}),
          })
        : context.web3.eth.sendTransaction({
            from: context.account,
            ...(options ? options(args) : {}),
          }),
    ) as Observable<TxState<B>>
  }
}

export function createSendWithGasConstraintsAbstractContext<
  A extends TxMeta,
  CC extends ContextConnected,
>(send: SendFunction<A>, context: CC, gasPrice$: GasPrice1559$, gasMultiplier?: number) {
  return <B extends A>(
    callData: TransactionDefAbstractContext<B, ContextConnected>,
    args: B,
  ): Observable<TxState<B>> => {
    return combineLatest(estimateGas(context, callData, args, gasMultiplier), gasPrice$).pipe(
      first(),
      switchMap(([gas, gasPrice]) => {
        return createSendTransaction(send, context)(
          {
            ...callData,
            options: (args1: B) => ({
              ...(callData.options ? callData.options(args1) : {}),
              gas,
              maxPriorityFeePerGas: gasPrice.maxPriorityFeePerGas.toFixed(0),
              maxFeePerGas: gasPrice.maxFeePerGas.toFixed(0),
            }),
          },
          args,
        )
      }),
    )
  }
}

export function estimateGasAbstractContext<A extends TxMeta, CC extends ContextConnected>(
  context: CC,
  { call, prepareArgs, options }: TransactionDefAbstractContext<A, CC>,
  args: A,
  gasMultiplier?: number,
): Observable<number> {
  const result = from<number[]>(
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
      return gasMultiplier ? Math.floor(e * gasMultiplier) : Math.floor(e)
    }),
  )

  return result as Observable<number>
}

export function callAbstractContext<D, R, CC extends Context>(
  context: CC,
  { call, prepareArgs, postprocess }: CallDefAbstractContext<D, R, Context>,
): (args: D) => Observable<R> {
  return (args: D) => {
    return from<R>(
      call(
        args,
        context,
      )(...prepareArgs(args, context)).call(
        // spot neccessary to read osms in readonly
        { from: getNetworkContracts(NetworkIds.MAINNET, context.chainId).mcdSpot.address },
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
  gasMultiplier?: number,
) {
  return estimateGasAbstractContext<A, ContextConnected>(context, txDef, args, gasMultiplier)
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
  gasMultiplier?: number,
) {
  return createSendWithGasConstraintsAbstractContext<A, ContextConnected>(
    send,
    context,
    gasPrice$,
    gasMultiplier,
  )
}
