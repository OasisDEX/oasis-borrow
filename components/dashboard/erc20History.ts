import BigNumber from 'bignumber.js'
import padStart from 'lodash/padStart'
import { combineLatest, merge, Observable, of } from 'rxjs'
import { fromPromise } from 'rxjs/internal-compatibility'
import { mergeAll } from 'rxjs/internal/operators'
import { map, mergeMap, switchMap, toArray } from 'rxjs/operators'

import { ContextConnected } from '../blockchain/network'
import { DsrEvent, LogEvent } from './dsrPot/dsrHistory'

export type ExtLogEvent =
  | LogEvent
  | {
      kind: string
      dsrKind: string
    }

async function getBlockTimestamp(context: ContextConnected, blockNumber: number): Promise<number> {
  const block = await context.web3.eth.getBlock(blockNumber)
  return block.timestamp as number
}

function enrichTxMetadata(context: ContextConnected, kind: 'in' | 'out') {
  return mergeMap((e: LogEvent) => {
    return fromPromise(getBlockTimestamp(context, e.blockNumber)).pipe(
      map((timestamp) => {
        const amount = new BigNumber(
          context.web3.eth.abi.decodeParameter('uint256', e.data).toString(),
        ).div('1e18')

        return { ...e, timestamp, kind, amount }
      }),
    )
  })
}

function createErc20EventsHistory$(
  context$: Observable<ContextConnected>,
  fromBlock: number,
  token: string,
  onEveryBlock$: Observable<number>,
): Observable<LogEvent[]> {
  return combineLatest(context$, onEveryBlock$).pipe(
    switchMap(([context]) => {
      const transferEvent = context.web3.utils.keccak256('Transfer(address,address,uint256)')

      const txsIn$: Observable<LogEvent> = fromPromise(
        context.web3ProviderGetPastLogs.eth.getPastLogs({
          address: context.tokens[token].address,
          topics: [transferEvent, null, '0x' + padStart(context.account.slice(2), 64, '0')],
          fromBlock: 1,
        }),
      ).pipe(mergeAll(), enrichTxMetadata(context, 'in'))

      const txsOut$: Observable<LogEvent> = fromPromise(
        context.web3ProviderGetPastLogs.eth.getPastLogs({
          address: context.tokens[token].address,
          topics: [transferEvent, '0x' + padStart(context.account.slice(2), 64, '0'), null],
          fromBlock: 1,
        }),
      ).pipe(mergeAll(), enrichTxMetadata(context, 'out'))

      return merge(txsIn$, txsOut$).pipe(
        toArray(),
        map((list) => {
          return list.sort((a: any, b: any) => {
            if (
              a.timestamp > b.timestamp ||
              (a.transactionHash === b.transactionHash && a.kind === 'in')
            )
              return -1
            if (a.timestamp < b.timestamp) return 1
            return 0
          })
        }),
      )
    }),
  )
}

export function createErc20ExtEventsHistory$(
  context$: Observable<ContextConnected>,
  fromBlock: number,
  token: string,
  dsrHistory$: Observable<DsrEvent[]>,
  onEveryBlock$: Observable<number>,
): Observable<ExtLogEvent[]> {
  return combineLatest(
    createErc20EventsHistory$(context$, fromBlock, token, onEveryBlock$),
    dsrHistory$,
    onEveryBlock$,
  ).pipe(
    switchMap(([erc20Events, dsrEvents]) => {
      const mergedEvents: Array<LogEvent> = []

      for (let i = 0; i < erc20Events.length; i++) {
        const dsrEvent = (dsrEvents as Array<DsrEvent>).find(
          (item: any) => item.txHash === erc20Events[i].transactionHash,
        )
        mergedEvents.push({
          ...erc20Events[i],
          ...{ dsrKind: dsrEvent ? dsrEvent.kind : undefined },
        })
      }

      return of(mergedEvents)
    }),
  )
}
