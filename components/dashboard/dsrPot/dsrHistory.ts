import BigNumber from 'bignumber.js'
import padStart from 'lodash/padStart'
import { combineLatest, merge, Observable, of } from 'rxjs'
import { fromPromise } from 'rxjs/internal-compatibility'
import { mergeAll } from 'rxjs/internal/operators'
import { filter, map, mergeMap, toArray } from 'rxjs/operators'
import { Dictionary } from 'ts-essentials'

import { ContextConnected } from '../../blockchain/network'
import { funcSigTopic } from '../../blockchain/utils'

export enum DsrEventKind {
  dsrDeposit = 'dsrDeposit',
  dsrWithdrawal = 'dsrWithdrawal',
}

interface BaseEvent {
  kind: DsrEventKind
  timestamp: number
  amount: BigNumber
}

interface DsrDepositEvent extends BaseEvent {
  kind: DsrEventKind.dsrDeposit
  block: number
  gem: string
  txHash: string
}

interface DsrWithdrawalEvent extends BaseEvent {
  kind: DsrEventKind.dsrWithdrawal
  block: number
  gem: string
  txHash: string
}

export type DsrEvent = DsrDepositEvent | DsrWithdrawalEvent

export type LogEvent = {
  topics: string[]
  transactionHash: string
  blockNumber: number
  block: number
  data: string
}

const EVENT_DAI_ADAPTER_EXIT = funcSigTopic('exit(address,uint256)')
const EVENT_DAI_ADAPTER_JOIN = funcSigTopic('join(address,uint256)')
const EVENT_POT_JOIN = funcSigTopic('join(uint256)')
const EVENT_POT_EXIT = funcSigTopic('exit(uint256)')

const eventSigntures: Dictionary<string[]> = {
  [DsrEventKind.dsrDeposit]: [EVENT_POT_JOIN, EVENT_DAI_ADAPTER_JOIN],
  [DsrEventKind.dsrWithdrawal]: [EVENT_POT_EXIT, EVENT_DAI_ADAPTER_EXIT],
}

async function getBlockTimestamp(context: ContextConnected, blockNumber: number): Promise<number> {
  const block = await context.web3.eth.getBlock(blockNumber)
  return block.timestamp as number
}

function createEventTypeHistory$(
  context: ContextConnected,
  fromBlock: number,
  proxyAddress: string,
  kind: DsrEventKind,
): Observable<DsrEvent> {
  const potEvents$ = fromPromise(
    context.web3ProviderGetPastLogs.eth.getPastLogs({
      address: context.mcdPot.address,
      topics: [eventSigntures[kind][0], '0x' + padStart(proxyAddress.slice(2), 64, '0')],
      fromBlock,
    }),
  )

  const adapterEvents$ = fromPromise(
    context.web3ProviderGetPastLogs.eth.getPastLogs({
      address: context.mcdJoinDai.address,
      topics: [eventSigntures[kind][1], '0x' + padStart(proxyAddress.slice(2), 64, '0')],
      fromBlock,
    }),
  )

  const events$: Observable<DsrEvent> = potEvents$.pipe(
    mergeAll(),
    mergeMap((event: LogEvent) => {
      const adapterFiltered$ = adapterEvents$.pipe(
        mergeAll(),
        filter((e: LogEvent) => {
          return e.transactionHash === event.transactionHash
        }),
      )
      return combineLatest(of(event), adapterFiltered$)
    }),
    map((result: LogEvent[]) => {
      const [potEvent, joinEvent] = result
      return {
        kind,
        block: potEvent.blockNumber,
        txHash: potEvent.transactionHash,
        amount: joinEvent.topics && new BigNumber(joinEvent.topics[3]),
        gem: 'DAI',
      }
    }),
  )

  return events$
}

export function createDsrHistory$(
  context: ContextConnected,
  proxyAddress: string,
): Observable<DsrEvent[]> {
  // 8600000 is 2019-09-22 on mainnet and 2018-09-04 on kovan
  const fromBlock = [1, 42].includes(context.chainId) ? 8600000 : 1
  const depositEvents$ = createEventTypeHistory$(
    context,
    fromBlock,
    proxyAddress,
    DsrEventKind.dsrDeposit,
  )
  const withdrawEvents$ = createEventTypeHistory$(
    context,
    fromBlock,
    proxyAddress,
    DsrEventKind.dsrWithdrawal,
  )

  return merge(withdrawEvents$, depositEvents$).pipe(
    mergeMap((e: LogEvent) => {
      return fromPromise(getBlockTimestamp(context, e.block)).pipe(
        map((timestamp) => ({ ...e, timestamp })),
      )
    }),
    toArray(),
    map((list) => {
      return list.sort((a: LogEvent, b: LogEvent) => {
        if (a.block > b.block) return -1
        if (a.block < b.block) return 1
        return 0
      })
    }),
  )
}
