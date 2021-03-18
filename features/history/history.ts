import { Vault } from 'blockchain/vaults'
import { gql, GraphQLClient } from 'graphql-request'
import { Observable } from 'rxjs'
import { switchMap } from 'rxjs/operators'
import { BorrowEvent_ } from './historyEvents'
import getConfig from 'next/config'

const query = gql`
query VaultEvents($urn: String) {
    allVaultEvents(filter: {urn: {equalTo: $urn}}) {
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
      }
    }
  }  
`

const client = new GraphQLClient(getConfig().publicRuntimeConfig.apiHost)

async function getVaultHistory(urn: string): Promise<BorrowEvent_[]> {
  const data = await client.request(query, { urn: urn.toLowerCase() })

  return data.allVaultEvents.nodes as BorrowEvent_[]
}


export function createVaultHistory$(
  everyBlock$: Observable<number>,
  vault$: (id: string) => Observable<Vault>,
  vaultId: string,
): Observable<BorrowEvent_[]> {
  return everyBlock$.pipe(
    switchMap(() => vault$(vaultId).pipe(
      switchMap(vault => getVaultHistory(vault.address))
    ))
  )
}
