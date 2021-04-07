import BigNumber from 'bignumber.js'
import { Context } from 'blockchain/network'
import { Vault } from 'blockchain/vaults'
import { gql, GraphQLClient } from 'graphql-request'
import { memoize } from 'lodash'
import flatten from 'lodash/flatten'
import pickBy from 'lodash/pickBy'
import { combineLatest, Observable } from 'rxjs'
import { map, switchMap } from 'rxjs/operators'

import { ReturnedEvent, VaultEvent } from './vaultHistoryEvents'

const query = gql`
  query VaultEvents($urn: String) {
    allVaultEvents(filter: { urn: { equalTo: $urn } }, orderBy: [TIMESTAMP_DESC, LOG_INDEX_DESC]) {
      nodes {
        kind
        collateralAmount
        daiAmount
        vaultCreator
        cdpId
        transferFrom
        transferTo
        timestamp
        id
        urn
        hash
        logIndex
      }
    }
  }
`

async function getVaultHistory(client: GraphQLClient, urn: string): Promise<ReturnedEvent[]> {
  const data = await client.request(query, { urn: urn.toLowerCase() })

  return data.allVaultEvents.nodes as ReturnedEvent[]
}

function parseBigNumbersFields(event: Partial<ReturnedEvent>): VaultEvent {
  const bigNumberFields = ['collateralAmount', 'daiAmount']
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

export function createVaultHistory$(
  context$: Observable<Context>,
  onEveryBlock$: Observable<number>,
  vault$: (id: BigNumber) => Observable<Vault>,
  vaultId: BigNumber,
): Observable<VaultHistoryEvent[]> {
  const makeClient = memoize((url: string) => new GraphQLClient(url))
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
      ),
    ),
  )
}
