import BigNumber from 'bignumber.js'
import { getNetworkContracts } from 'blockchain/contracts'
import type { Context } from 'blockchain/network.types'
import { NetworkIds } from 'blockchain/networks'
import { getNetworkRpcEndpoint } from 'blockchain/networks/get-network-rpc-endpoint'
import { funcSigTopic } from 'blockchain/utils'
import { gql, GraphQLClient } from 'graphql-request'
import padStart from 'lodash/padStart'
import type { Observable } from 'rxjs'
import { combineLatest, merge, of } from 'rxjs'
import { mergeAll } from 'rxjs/internal/operators'
import { fromPromise } from 'rxjs/internal-compatibility'
import { filter, map, mergeMap, toArray } from 'rxjs/operators'
import type { Dictionary } from 'ts-essentials'
import Web3 from 'web3'

export enum DsrEventKind {
  dsrDeposit = 'dsrDeposit',
  dsrWithdrawal = 'dsrWithdrawal',
}

interface BaseEvent {
  kind: DsrEventKind
  timestamp: number
  amount: BigNumber
  interactAddress: string
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
  interactAddress: string
}

const EVENT_DAI_ADAPTER_EXIT = funcSigTopic('exit(address,uint256)')
const EVENT_DAI_ADAPTER_JOIN = funcSigTopic('join(address,uint256)')
const EVENT_POT_JOIN = funcSigTopic('join(uint256)')
const EVENT_POT_EXIT = funcSigTopic('exit(uint256)')

const eventSigntures: Dictionary<string[]> = {
  [DsrEventKind.dsrDeposit]: [EVENT_POT_JOIN, EVENT_DAI_ADAPTER_JOIN],
  [DsrEventKind.dsrWithdrawal]: [EVENT_POT_EXIT, EVENT_DAI_ADAPTER_EXIT],
}

async function getBlockTimestamp({ chainId }: Context, blockNumber: number): Promise<number> {
  const apiClient = new GraphQLClient(getNetworkContracts(NetworkIds.MAINNET, chainId).cacheApi)
  const block = await apiClient.request(historicalBlockNumbers, {
    blockNumber,
  })
  return new Date(block.allHistoricBlocks.nodes[0].timestamp).getTime() / 1000
}

function createEventTypeHistory$(
  context: Context,
  fromBlock: number,
  proxyAddress: string,
  kind: DsrEventKind,
): Observable<DsrEvent> {
  const web3ProviderGetPastLogs = new Web3(getNetworkRpcEndpoint(context.chainId))

  const potEvents$ = fromPromise(
    web3ProviderGetPastLogs.eth.getPastLogs({
      address: getNetworkContracts(NetworkIds.MAINNET, context.chainId).mcdPot.address,
      topics: [eventSigntures[kind][0], '0x' + padStart(proxyAddress.slice(2), 64, '0')],
      fromBlock,
    }),
  )

  const adapterEvents$ = fromPromise(
    web3ProviderGetPastLogs.eth.getPastLogs({
      address: getNetworkContracts(NetworkIds.MAINNET, context.chainId).mcdJoinDai.address,
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
        interactAddress: getNetworkContracts(NetworkIds.MAINNET, context.chainId).mcdPot.address,
        gem: 'DAI',
      }
    }),
  )

  return events$
}

export function createDsrHistory$(context: Context, proxyAddress: string): Observable<DsrEvent[]> {
  // 8600000 is 2019-09-22 on mainnet
  const fromBlock = 8600000
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

export const historicalBlockNumbers = gql`
  query timestamp($blockNumber: Int) {
    allHistoricBlocks(first: 1, filter: { number: { equalTo: $blockNumber } }) {
      nodes {
        timestamp
      }
    }
  }
`
