import BigNumber from 'bignumber.js'
import { Context } from 'blockchain/network'
import { Vault } from 'blockchain/vaults'
import { gql, GraphQLClient } from 'graphql-request'
import { memoize } from 'lodash'
import flatten from 'lodash/flatten'
import pickBy from 'lodash/pickBy'
import { combineLatest, Observable, of } from 'rxjs'
import { catchError, map, switchMap } from 'rxjs/operators'

import { fetchWithOperationId, VaultHistoryEvent } from './vaultHistory'
import { MultiplyEvent, ReturnedEvent, VaultEvent } from './vaultHistoryEvents'

const query = gql`
  query vaultMultiplyEvents($cdpId: String) {
    allVaultMultiplyEvents(
      filter: { cdpId: { equalTo: $cdpId } }
      orderBy: [TIMESTAMP_ASC, LOG_INDEX_ASC]
    ) {
      nodes {
        kind
        timestamp
        txId
        blockId
        swapMinAmount
        swapOptimistAmount
        oazoFee
        flDue
        flBorrowed
        liquidationRatio
      }
    }
  }
`

export type VaultMultiplyHistoryEvent = MultiplyEvent & {
  token: string
  etherscan?: {
    url: string
    apiUrl: string
    apiKey: string
  }
}

function parseBigNumbersFields(event: Partial<ReturnedEvent>): VaultEvent {
  const bigNumberFields = [
    'swapMinAmount',
    'swapOptimistAmount',
    'oazoFee',
    'flDue',
    'flBorrowed',
    'liquidationRatio',
  ]
  return Object.entries(event).reduce(
    (acc, [key, value]) =>
      bigNumberFields.includes(key) && value != null
        ? { ...acc, [key]: new BigNumber(value) }
        : { ...acc, [key]: value },
    {},
  ) as VaultEvent
}

async function getVaultMultiplyHistory(
  client: GraphQLClient,
  cdpId: BigNumber,
): Promise<ReturnedEvent[]> {
  const data = await client.request(query, { cdpId: cdpId.toFixed(0) })

  return data.allVaultMultiplyEvents.nodes as ReturnedEvent[]
}

export function createVaultMultiplyHistory$(
  context$: Observable<Context>,
  onEveryBlock$: Observable<number>,
  vault$: (id: BigNumber) => Observable<Vault>,
  vaultId: BigNumber,
): Observable<VaultHistoryEvent[]> {
  const makeClient = memoize(
    (url: string) => new GraphQLClient(url, { fetch: fetchWithOperationId }),
  )
  return combineLatest(context$, vault$(vaultId)).pipe(
    switchMap(([{ etherscan, cacheApi }, { token }]) => {
      return onEveryBlock$.pipe(
        switchMap(() => getVaultMultiplyHistory(makeClient(cacheApi), vaultId)),
        map((returnedEvents) =>
          flatten(
            returnedEvents
              .map((returnedEvent) => pickBy(returnedEvent, (value) => value !== null))
              .map((event) => {
                ;(event as any).isMultiply = true
                return event
              })
              .map(parseBigNumbersFields),
          ),
        ),
        map((events) => events.map((event) => ({ etherscan, token, ...event }))),
        catchError(() => of([])),
      )
    }),
  )
}
