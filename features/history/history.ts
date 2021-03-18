import { Vault } from 'blockchain/vaults'
import { gql, GraphQLClient } from 'graphql-request'
import flatten from 'lodash/flatten'
import getConfig from 'next/config'
import { Observable } from 'rxjs'
import { map, switchMap } from 'rxjs/operators'

import { BorrowEvent } from './historyEvents'

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

const client = new GraphQLClient(getConfig().publicRuntimeConfig.apiHost)

async function getVaultHistory(urn: string): Promise<BorrowEvent[]> {
  const data = await client.request(query, { urn: urn.toLowerCase() })

  return data.allVaultEvents.nodes as BorrowEvent[]
}

function splitEvents(event: BorrowEvent): BorrowEvent | BorrowEvent[] {
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

export function createVaultHistory$(
  everyBlock$: Observable<number>,
  vault$: (id: string) => Observable<Vault>,
  vaultId: string,
): Observable<BorrowEvent[]> {
  return everyBlock$.pipe(
    switchMap(() =>
      vault$(vaultId).pipe(
        switchMap((vault) => getVaultHistory(vault.address)),
        map((events) => flatten(events.map(splitEvents))),
      ),
    ),
  )
}
