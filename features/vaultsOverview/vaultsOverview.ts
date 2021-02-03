import { IlkDataList } from 'blockchain/ilks'
import { ContextConnected } from 'blockchain/network'
import { Vault, VaultSummary } from 'blockchain/vaults'
import { Observable } from 'rxjs'
import { combineLatest } from 'rxjs'
import { map } from 'rxjs/internal/operators/map'
import { startWith } from 'rxjs/operators'

export interface VaultsOverview {
  canOpenVault: boolean
  vaults: Vault[] | undefined
  vaultSummary: VaultSummary | undefined
  ilkDataList: IlkDataList | undefined
}

export function createVaultsOverview$(
  context$: Observable<ContextConnected>,
  vaults$: (address: string) => Observable<Vault[]>,
  vaultsSummary$: (address: string) => Observable<VaultSummary>,
  ilkDataList$: Observable<IlkDataList>,
  address: string,
): Observable<VaultsOverview> {
  return combineLatest(
    context$,
    vaults$(address).pipe(startWith<Vault[] | undefined>(undefined)),
    vaultsSummary$(address).pipe(startWith<VaultSummary | undefined>(undefined)),
    ilkDataList$.pipe(startWith<IlkDataList | undefined>(undefined)),
  ).pipe(
    map(([context, vaults, vaultSummary, ilkDataList]) => {
      return {
        canOpenVault: !context.readonly,
        vaults,
        vaultSummary,
        ilkDataList,
      }
    }),
  )
}
