import BigNumber from 'bignumber.js'
import { Context } from 'blockchain/network'
import { Vault } from 'blockchain/vaults'
import { gql, GraphQLClient } from 'graphql-request'
import { memoize } from 'lodash'
import flatten from 'lodash/flatten'
import pickBy from 'lodash/pickBy'
import { combineLatest, Observable, of } from 'rxjs'
import { catchError, map, switchMap } from 'rxjs/operators'

import { ReturnedEvent, VaultEvent } from './vaultHistoryEvents'

const query = gql`
  query vaultEvents($urn: String) {
    allVaultEvents(
      filter: { urn: { equalTo: $urn }, kind: { notEqualTo: "TAKE" } }
      orderBy: [TIMESTAMP_DESC, LOG_INDEX_DESC]
    ) {
      nodes {
        kind
        collateralAmount
        daiAmount
        vaultCreator
        cdpId
        transferFrom
        transferTo
        collateralTaken
        coveredDebt
        remainingCollateral
        rate
        timestamp
        id
        urn
        hash
        logIndex
        auctionId
        txId
        blockId
        oraclePrice
      }
    }
  }
`

async function getVaultHistory(client: GraphQLClient, urn: string): Promise<ReturnedEvent[]> {
  const data = await client.request(query, { urn: urn.toLowerCase() })

  return data.allVaultEvents.nodes as ReturnedEvent[]
}

function parseBigNumbersFields(event: Partial<ReturnedEvent>): VaultEvent {
  const bigNumberFields = [
    'collateralAmount',
    'daiAmount',
    'collateralTaken',
    'coveredDebt',
    'remainingCollateral',
    'rate',
    'oraclePrice',
  ]
  return Object.entries(event).reduce(
    (acc, [key, value]) =>
      bigNumberFields.includes(key) && value != null
        ? { ...acc, [key]: new BigNumber(value) }
        : { ...acc, [key]: value },
    {},
  ) as VaultEvent
}

function splitEvents(event: VaultEvent): VaultEvent | VaultEvent[] {
  if (event.kind === 'DEPOSIT-GENERATE') {
    return [
      {
        ...event,
        id: `${event.id}_a`,
        kind: 'GENERATE',
      },
      {
        ...event,
        kind: 'DEPOSIT',
      },
    ]
  }
  if (event.kind === 'WITHDRAW-PAYBACK') {
    return [
      {
        ...event,
        kind: 'PAYBACK',
      },
      {
        ...event,
        id: `${event.id}_a`,
        kind: 'WITHDRAW',
      },
    ]
  }
  return event
}

export type VaultHistoryEvent = VaultEvent & {
  token: string
  etherscan?: {
    url: string
    apiUrl: string
    apiKey: string
  }
}
export function fetchWithOperationId(url: string, options?: RequestInit) {
  const operationNameRegex = /query (?<operationName>[a-zA-Z0-9]+)\(/gm

  const body = typeof options?.body === 'string' ? options?.body : ''
  const parsedBody: { query: string } = JSON.parse(body)
  const result = operationNameRegex.exec(parsedBody.query)
  const operationName = result ? result.groups?.operationName : undefined

  return fetch(url, { ...options, body: JSON.stringify({ ...parsedBody, operationName }) })
}

export function createVaultHistory$(
  context$: Observable<Context>,
  onEveryBlock$: Observable<number>,
  vault$: (id: BigNumber) => Observable<Vault>,
  vaultId: BigNumber,
): Observable<VaultHistoryEvent[]> {
  const makeClient = memoize(
    (url: string) => new GraphQLClient(url, { fetch: fetchWithOperationId }),
  )

  return combineLatest(context$, vault$(vaultId)).pipe(
    switchMap(([{ etherscan, cacheApi }, { address, token }]) =>
      onEveryBlock$.pipe(
        switchMap(() => getVaultHistory(makeClient(cacheApi), address)),
        map((returnedEvents) =>
          flatten(
            returnedEvents
              .map((returnedEvent) => pickBy(returnedEvent, (value) => value !== null))
              .map(parseBigNumbersFields)
              .map(splitEvents),
          ),
        ),
        map((events) => events.map((event) => ({ etherscan, token, ...event }))),
        catchError(() => of([])),
      ),
    ),
  )
}
