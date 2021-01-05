import BigNumber from 'bignumber.js'
import { UnreachableCaseError } from 'helpers/UnreachableCaseError'
import * as _ from 'lodash'
import { fromPairs } from 'ramda'
import {
  bindNodeCallback,
  combineLatest,
  defer,
  fromEvent,
  identity,
  merge,
  Observable,
  of,
  Subject,
  timer,
} from 'rxjs'
import { takeWhileInclusive } from 'rxjs-take-while-inclusive'
import { ajax } from 'rxjs/ajax'
import {
  catchError,
  filter,
  first,
  map,
  mergeMap,
  scan,
  shareReplay,
  startWith,
  switchMap,
  tap,
} from 'rxjs/operators'
import Web3 from 'web3'

import { ContextConnected } from './network'

export type TxMeta = {
  kind: any
  [key: string]: string | number | BigNumber
}

export enum TxStatus {
  WaitingForApproval = 'WaitingForApproval',
  CancelledByTheUser = 'CancelledByTheUser',
  Propagating = 'Propagating',
  WaitingForConfirmation = 'WaitingForConfirmation',
  Success = 'Success',
  Error = 'Error',
  Failure = 'Failure',
}

export enum TxRebroadcastStatus {
  speedup = 'speedup',
  cancel = 'cancel',
}

export type TxState<A extends TxMeta> = {
  account: string
  txNo: number
  networkId: string
  meta: A
  start: Date
  end?: Date
  lastChange: Date
  dismissed: boolean
} & (
  | {
      status: TxStatus.WaitingForConfirmation | TxStatus.Propagating
      txHash: string
      broadcastedAt: Date
    }
  | {
      status: TxStatus.WaitingForApproval
    }
  | {
      status: TxStatus.CancelledByTheUser
      error: any
    }
  | {
      status: TxStatus.Success
      txHash: string
      blockNumber: number
      receipt: any
      confirmations: number
      safeConfirmations: number
      rebroadcast?: TxRebroadcastStatus
    }
  | {
      status: TxStatus.Failure
      txHash: string
      blockNumber: number
      receipt: any
    }
  | {
      status: TxStatus.Error
      txHash: string
      error: any
    }
)

let txCounter: number = 1

export function isDone<A extends TxMeta>(state: TxState<A>) {
  return (
    [TxStatus.CancelledByTheUser, TxStatus.Error, TxStatus.Failure, TxStatus.Success].indexOf(
      state.status,
    ) >= 0
  )
}

export function isDoneButNotSuccessful<A extends TxMeta>(state: TxState<A>) {
  return [TxStatus.CancelledByTheUser, TxStatus.Error, TxStatus.Failure].indexOf(state.status) >= 0
}

export function isSuccess<A extends TxMeta>(state: TxState<A>) {
  return TxStatus.Success === state.status
}

export function getTxHash<A extends TxMeta>(state: TxState<A>): string | undefined {
  if (
    state.status === TxStatus.Success ||
    state.status === TxStatus.Failure ||
    state.status === TxStatus.Error ||
    state.status === TxStatus.WaitingForConfirmation
  ) {
    return state.txHash
  }
  return undefined
}

type NodeCallback<I, R> = (i: I, callback: (err: any, r: R) => any) => any

interface TransactionReceiptLike {
  transactionHash: string
  status: boolean
  blockNumber: number
}

type GetTransactionReceipt = NodeCallback<string, TransactionReceiptLike>

interface TransactionLike {
  hash: string
  nonce: number
  input: string
  blockHash: string
}

type GetTransaction = NodeCallback<string, TransactionLike | null>

function externalNonce2tx(
  onEveryBlock$: Observable<number>,
  context$: Observable<ContextConnected>,
  account: string,
): Observable<ExternalNonce2tx> {
  return combineLatest(context$, onEveryBlock$.pipe(first()), onEveryBlock$).pipe(
    switchMap(([context, firstBlock]) =>
      ajax({
        url:
          `${context.etherscan.apiUrl}?module=account` +
          `&action=txlist` +
          `&address=${account}` +
          `&startblock=${firstBlock}` +
          `&sort=desc` +
          `&apikey=${context.etherscan.apiKey}`,
      }),
    ),
    map(({ response }) => response.result),
    map((transactions: Array<{ hash: string; nonce: string; input: string }>) =>
      fromPairs(
        _.map(
          transactions,
          (tx) =>
            [tx.nonce, { hash: tx.hash, callData: tx.input }] as [
              string,
              { hash: string; callData: string },
            ],
        ),
      ),
    ),
    catchError((error) => {
      console.error(error)
      return of({})
    }),
    shareReplay(1),
  )
}

function txRebroadcastStatus(
  account: string,
  context$: Observable<ContextConnected>,
  onEveryBlock$: Observable<number>,
  { hash, nonce, input }: TransactionLike,
) {
  const externalNonce2tx$ = externalNonce2tx(onEveryBlock$, context$, account)
  return combineLatest(externalNonce2tx$, onEveryBlock$).pipe(
    map(([externalNonce2tx]) => {
      if (externalNonce2tx[nonce] && externalNonce2tx[nonce].hash !== hash) {
        return [
          externalNonce2tx[nonce].hash,
          input === externalNonce2tx[nonce].callData
            ? TxRebroadcastStatus.speedup
            : TxRebroadcastStatus.cancel,
        ]
      }
      return [hash, undefined]
    }),
  ) as Observable<[string, undefined | TxRebroadcastStatus]>
}

function successOrFailure<A extends TxMeta>(
  onEveryBlock$: Observable<number>,
  context$: Observable<ContextConnected>,
  txHash: string,
  receipt: TransactionReceiptLike,
  common: TxState<A>,
  rebroadcast?: TxRebroadcastStatus,
): Observable<TxState<A>> {
  const end = new Date()
  if (!receipt.status) {
    // TODO: failure should be confirmed!
    return of({
      ...common,
      txHash,
      receipt,
      end,
      lastChange: end,
      blockNumber: receipt.blockNumber,
      status: TxStatus.Failure,
    })
  }

  // TODO: error handling!
  return combineLatest(context$, onEveryBlock$).pipe(
    map(([context, blockNumber]) => {
      const x: TxState<A> = {
        ...common,
        txHash,
        receipt,
        end,
        rebroadcast,
        lastChange: new Date(),
        blockNumber: receipt.blockNumber,
        status: TxStatus.Success,
        confirmations: Math.max(0, blockNumber - receipt.blockNumber),
        safeConfirmations: context.safeConfirmations,
      }
      return x
    }),
  )
}

function monitorTransaction<A extends TxMeta>(
  account: string,
  onEveryBlock$: Observable<number>,
  context$: Observable<ContextConnected>,
  web3: Web3,
  txHash: string,
  broadcastedAt: Date,
  common: TxState<A>,
): Observable<TxState<A>> {
  return timer(0, 1000).pipe(
    switchMap(() => bindNodeCallback(web3.eth.getTransaction as GetTransaction)(txHash)),
    filter((transaction) => !!transaction),
    first(),
    mergeMap((transaction: TransactionLike) =>
      txRebroadcastStatus(account, context$, onEveryBlock$, transaction).pipe(
        switchMap(
          ([hash, rebroadcast]) =>
            bindNodeCallback(web3.eth.getTransactionReceipt as GetTransactionReceipt)(hash).pipe(
              filter((receipt) => receipt && !!receipt.blockNumber),
              map((receipt) => [receipt, rebroadcast]),
            ) as Observable<[TransactionReceiptLike, TxRebroadcastStatus]>,
        ),
        first(),
        mergeMap(([receipt, rebroadcast]) =>
          successOrFailure(
            onEveryBlock$,
            context$,
            (receipt as any).transactionHash,
            receipt,
            common,
            rebroadcast,
          ),
        ),
        takeWhileInclusive(
          (state) =>
            !isDone(state) ||
            (state.status === TxStatus.Success && state.confirmations < state.safeConfirmations),
        ),
        startWith({
          ...common,
          broadcastedAt,
          txHash,
          status: TxStatus.WaitingForConfirmation,
        }),
        catchError((error) =>
          of({
            ...common,
            error,
            txHash: transaction.hash,
            end: new Date(),
            lastChange: new Date(),
            status: TxStatus.Error,
          }),
        ),
      ),
    ),
    startWith({
      ...common,
      broadcastedAt,
      txHash,
      status: TxStatus.Propagating,
    }),
  )
}

function send<A extends TxMeta>(
  onEveryBlock$: Observable<number>,
  context$: Observable<ContextConnected>,
  change: (change: NewTransactionChange<A>) => void,
  account: string,
  networkId: string,
  meta: A,
  method: (...args: any[]) => any, // Any contract method
): Observable<TxState<A>> {
  const common = {
    account,
    networkId,
    meta,
    txNo: txCounter += 1,
    start: new Date(),
    lastChange: new Date(),
    dismissed: false,
  }

  const promiEvent = method()
  const result: Observable<TxState<A>> = context$.pipe(
    first(),
    switchMap(({ web3 }) =>
      merge(fromEvent(promiEvent, 'transactionHash'), promiEvent).pipe(
        map((txHash: string) => [txHash, new Date()]),
        first(),
        mergeMap(([txHash, broadcastedAt]: [string, Date]) =>
          monitorTransaction(
            account,
            onEveryBlock$,
            context$,
            web3,
            txHash,
            broadcastedAt,
            common as TxState<A>,
          ),
        ),
        startWith({
          ...common,
          status: TxStatus.WaitingForApproval,
        }),
        catchError((error) => {
          if ((error.message as string).indexOf('User denied transaction signature') === -1) {
            console.error(error)
          }
          return of({
            ...common,
            error,
            end: new Date(),
            lastChange: new Date(),
            status: TxStatus.CancelledByTheUser,
          })
        }),
      ),
    ),
    shareReplay(1),
  )
  result.subscribe((state) => change({ state, kind: 'newTx' }))
  return result
}

interface ExternalNonce2tx {
  [nonce: number]: { hash: string; callData: string }
}

interface NewTransactionChange<A extends TxMeta> {
  kind: 'newTx'
  state: TxState<A>
}

interface CachedTransactionChange<A extends TxMeta> {
  kind: 'cachedTx'
  state: TxState<A>
}

export interface DismissedChange {
  kind: 'dismissed'
  txNo: number
}

type TransactionsChange<A extends TxMeta> =
  | NewTransactionChange<A>
  | DismissedChange
  | CachedTransactionChange<A>

function createTransactions$<A extends TxMeta>(
  account$: Observable<string>,
  context$: Observable<ContextConnected>,
  onEveryBlock$: Observable<number>,
): [Observable<TxState<A>[]>, (ch: TransactionsChange<A>) => void] {
  const transactionObserver: Subject<TransactionsChange<A>> = new Subject()

  const txs$: Observable<TxState<A>[]> = transactionObserver.pipe(
    scan((transactions: TxState<A>[], change: TransactionsChange<A>) => {
      switch (change.kind) {
        case 'cachedTx':
        case 'newTx': {
          const newState = change.state
          const result = [...transactions]
          const i = result.findIndex((t) => t.txNo === newState.txNo)
          if (i >= 0) {
            result[i] = newState
          } else {
            result.push(newState)
          }
          return result
        }
        case 'dismissed': {
          const result = [...transactions]
          const i = result.findIndex((t) => t.txNo === change.txNo)

          result[i].dismissed = true

          return result
        }
        default:
          throw new UnreachableCaseError(change)
      }
    }, []),
    shareReplay(1),
  )
  txs$.subscribe(identity)

  const persistentTxs$ = persist(account$, onEveryBlock$, context$, txs$, change)

  const accountTxs$: Observable<TxState<A>[]> = combineLatest(
    persistentTxs$,
    account$,
    context$,
  ).pipe(
    map(([txs, account, context]) =>
      txs.filter((t: TxState<A>) => t.account === account && t.networkId === context.id),
    ),
    startWith([]),
    shareReplay(1),
  )
  function change(ch: TransactionsChange<A>) {
    transactionObserver.next(ch)
  }

  return [accountTxs$, change]
}

function sendCurried<A extends TxMeta>(
  onEveryBlock$: Observable<number>,
  context$: Observable<ContextConnected>,
  change: (change: NewTransactionChange<A>) => void,
) {
  return (account: string, networkId: string, meta: A, method: (...args: any[]) => any) =>
    send<A>(onEveryBlock$, context$, change, account, networkId, meta, method)
}

export type SendFunction<A extends TxMeta> = (
  account: string,
  networkId: string,
  meta: A,
  method: (...args: any[]) => any,
) => Observable<TxState<A>>

function saveTransactions<A extends TxMeta>(transactions: TxState<A>[]) {
  if (transactions.length) {
    localStorage.setItem(
      'transactions',
      JSON.stringify(
        transactions.filter(
          (tx) =>
            tx.status !== TxStatus.CancelledByTheUser && tx.status !== TxStatus.WaitingForApproval,
        ),
      ),
    )
  }
}

// @ts-ignore
BigNumber.prototype.toJSON = function toJSON() {
  return {
    _type: 'BigNumber',
    _data: Object.assign({}, this),
  }
}

function conformTransactions<A extends TxMeta>(serializedTransactions: string): TxState<A>[] {
  // @ts-ignore
  function reviveFromJSON(_, value) {
    let result = value
    const reISO = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*))(?:Z|(\+|-)([\d|:]*))?$/
    if (typeof value === 'object' && value !== null && value.hasOwnProperty('_type')) {
      switch (value._type) {
        case 'BigNumber':
          result = Object.assign(new BigNumber(0), value._data)
      }
    }
    if (reISO.exec(value)) result = new Date(value)
    return result
  }

  return JSON.parse(serializedTransactions, reviveFromJSON)
}

function persist<A extends TxMeta>(
  account$: Observable<string>,
  onEveryBlock$: Observable<number>,
  context$: Observable<ContextConnected>,
  transactions$: Observable<TxState<A>[]>,
  change: (ch: TransactionsChange<A>) => void,
): Observable<TxState<A>[]> {
  return defer(() => {
    return context$.pipe(
      switchMap(({ web3 }) => {
        return account$.pipe(
          switchMap((account) => {
            const serializedTransactions = localStorage.getItem('transactions')
            if (!serializedTransactions) {
              return transactions$
            }

            const deserializedTransactions: TxState<A>[] = conformTransactions(
              serializedTransactions,
            )

            txCounter = deserializedTransactions.reduce(
              (txNo, tx) => (tx.txNo > txNo ? tx.txNo : txNo),
              txCounter,
            )

            const pendingTransactions$ = merge(
              ...deserializedTransactions
                .filter(
                  (tx) =>
                    tx.status === TxStatus.WaitingForConfirmation ||
                    tx.status === TxStatus.Propagating,
                )
                .map(
                  (tx): Observable<TxState<A>> =>
                    tx.status === TxStatus.WaitingForConfirmation ||
                    tx.status === TxStatus.Propagating
                      ? monitorTransaction(
                          account,
                          onEveryBlock$,
                          context$,
                          web3,
                          tx.txHash!,
                          tx.broadcastedAt!,
                          tx,
                        )
                      : of(),
                ),
            )
            pendingTransactions$.subscribe((state) => change({ kind: 'cachedTx', state }))

            deserializedTransactions
              .filter(
                (tx) =>
                  tx.status !== TxStatus.WaitingForConfirmation &&
                  tx.status !== TxStatus.Propagating,
              )
              .forEach((state) => change({ kind: 'cachedTx', state }))

            return transactions$
          }),
        )
      }),
    )
  }).pipe(tap(saveTransactions))
}

export function createSend<A extends TxMeta>(
  account$: Observable<string>,
  onEveryBlock$: Observable<number>,
  context$: Observable<ContextConnected>,
): [SendFunction<A>, Observable<TxState<A>[]>, (txNo: number) => void] {
  const [transactions$, change] = createTransactions$<A>(account$, context$, onEveryBlock$)

  const zend = sendCurried<A>(onEveryBlock$, context$, change)

  return [zend, transactions$, (txNo: number) => change({ kind: 'dismissed', txNo })]
}
