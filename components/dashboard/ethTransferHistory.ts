import BigNumber from 'bignumber.js'
import * as _ from 'lodash'
import { combineLatest, Observable } from 'rxjs'
import { ajax } from 'rxjs/internal-compatibility'
import { map, switchMap } from 'rxjs/operators'
import { Dictionary } from 'ts-essentials'

import { ContextConnected } from '../blockchain/network'

type Transaction = {
  hash: string
  blockNumber: string
  timeStamp: string
  from: string
  to: string
  value: string
  gasUsed: string
}

type TransactionResult = {
  kind: EventKind
  transactionHash: string
  amount: BigNumber
  timestamp: number
  block: number
  uniqueId: string
}

export enum EventKind {
  ethReceived = 'in',
  ethSent = 'out',
}
export type BaseEvent = {
  kind: EventKind
  timestamp: number
  block: number
  amount: BigNumber
  transactionHash: string
}
export type EthSentEvent = BaseEvent & {
  kind: EventKind.ethSent
}
export type EthReceivedEvent = BaseEvent & {
  kind: EventKind.ethReceived
}
export type EthTransferEvent = EthSentEvent | EthReceivedEvent

export function createEthTransferHistory$(
  context$: Observable<ContextConnected>,
  onEveryBlock$: Observable<number>,
): Observable<EthTransferEvent[]> {
  const mergedEvents: Dictionary<Array<EthTransferEvent>> = {}

  return combineLatest(context$, onEveryBlock$).pipe(
    switchMap(([context]) => {
      const startBlock =
        (mergedEvents?.[context.account] || []).length === 0
          ? 0
          : mergedEvents[context.account][0].block + 1

      return ajax({
        url:
          `${context.etherscan.apiUrl}?module=account` +
          `&action=txlist` +
          `&address=${context.account}` +
          `&startblock=${startBlock}` +
          `&sort=desc` +
          `&apikey=${context.etherscan.apiKey}`,
      }).pipe(
        map(({ response }) => response.result),

        map((txs: Transaction[]) =>
          txs.reduce((txs: TransactionResult[], tx) => {
            if (tx.value !== '0' && tx.gasUsed === '21000') {
              const account = context.account.toLowerCase()
              const to = tx.to.toLowerCase()
              const from = tx.from.toLowerCase()
              const txMetaData = {
                transactionHash: tx.hash,
                amount: new BigNumber(tx.value).div('1e18'),
                timestamp: parseInt(tx.timeStamp),
                block: parseInt(tx.blockNumber),
              }

              if (to === account) {
                txs.push({
                  kind: EventKind.ethReceived,
                  uniqueId: `${tx.hash}_${EventKind.ethReceived}`,
                  ...txMetaData,
                })
              }

              if (from === account) {
                txs.push({
                  kind: EventKind.ethSent,
                  uniqueId: `${tx.hash}_${EventKind.ethSent}`,
                  ...txMetaData,
                })
              }
            }

            return txs
          }, []),
        ),
        map((txs: TransactionResult[]) => {
          return txs.sort((a, b) => {
            if (
              a.timestamp > b.timestamp ||
              (a.transactionHash === b.transactionHash && a.kind === 'in')
            )
              return -1
            if (a.timestamp < b.timestamp) return 1
            return 0
          })
        }),
        map(
          (txs: any) =>
            (mergedEvents[context.account] = _.uniqBy(
              [...(mergedEvents[context.account] || []), ...txs],
              'uniqueId',
            )),
        ),
      )
    }),
  )
}
