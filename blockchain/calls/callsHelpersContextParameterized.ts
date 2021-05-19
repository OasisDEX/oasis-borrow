import { SendFunction, TxMeta, TxState } from '@oasisdex/transactions'
import BigNumber from 'bignumber.js'
import { combineLatest, from, Observable } from 'rxjs'
import { first, map, switchMap } from 'rxjs/internal/operators'
import Web3 from 'web3'

type GasPrice$ = Observable<BigNumber>
export const DEFAULT_GAS = 6000000

export type Context = { status: string; web3: Web3; id: string }
export type ContextConnected = { account: string } & Context

export type TxOptions = { to?: string; value?: string; from?: string; gas?: number }
export type ArgsType = Array<string | number | boolean>

export interface CallDef<A, R, C extends Context> {
  call: (args: A, context: C, account?: string) => any
  prepareArgs: (args: A, context: C, account?: string) => any[]
  postprocess?: (r: R, a: A) => R
}

export interface TransactionDef<A extends TxMeta, CC extends ContextConnected> {
  call?: (args: A, context: CC, account?: string) => any
  prepareArgs: (args: A, context: CC, account?: string) => ArgsType
  options?: (args: A) => TxOptions
}

export function call<D, R, CC extends ContextConnected>(
  context: CC,
  { call, prepareArgs, postprocess }: CallDef<D, R, CC>,
): (args: D) => Observable<R> {
  return (args: D) => {
    return from<R>(
      call(
        args,
        context,
      )(...prepareArgs(args, context)).call(
        context.status === 'connected' ? { from: context.account } : {},
      ),
    ).pipe(map((i: R) => (postprocess ? postprocess(i, args) : i)))
  }
}

// we accommodate for the fact that blockchain state
// can be different when tx execute and it can take more gas
const GAS_ESTIMATION_MULTIPLIER = 1.5
export function estimateGas<A extends TxMeta, CC extends ContextConnected>(
  context: CC,
  { call, prepareArgs, options }: TransactionDef<A, CC>,
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

export type SendTransactionFunction<A extends TxMeta, CC extends ContextConnected> = <B extends A>(
  def: TransactionDef<B, CC>,
  args: B,
) => Observable<TxState<B>>

export type EstimateGasFunction<A extends TxMeta, CC extends ContextConnected> = <B extends A>(
  def: TransactionDef<B, CC>,
  args: B,
) => Observable<number>

export function createSendTransaction<A extends TxMeta, CC extends ContextConnected>(
  send: SendFunction<A>,
  context: CC,
): SendTransactionFunction<A, CC> {
  return <B extends A>(
    { call, prepareArgs, options }: TransactionDef<B, CC>,
    args: B,
  ): Observable<TxState<B>> => {
    return send(context.account, context.id, args, () =>
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

export function createSendWithGasConstraints<A extends TxMeta, CC extends ContextConnected>(
  send: SendFunction<A>,
  context: CC,
  gasPrice$: GasPrice$,
) {
  return <B extends A>(callData: TransactionDef<B, CC>, args: B): Observable<TxState<B>> => {
    return combineLatest(estimateGas(context, callData, args), gasPrice$).pipe(
      first(),
      switchMap(([gas, gasPrice]) => {
        return createSendTransaction(send, context)(
          {
            ...callData,
            options: (args1: B) => ({
              ...(callData.options ? callData.options(args1) : {}),
              gas,
              gasPrice,
            }),
          },
          args,
        )
      }),
    )
  }
}
