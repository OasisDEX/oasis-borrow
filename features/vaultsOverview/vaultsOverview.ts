import { BigNumber } from 'bignumber.js'
import { VaultWithType } from 'blockchain/vaults'
import { IlkWithBalance } from 'features/ilks/ilksWithBalances'
import { isEqual } from 'lodash'
import { Observable } from 'rxjs'
import { combineLatest } from 'rxjs'
import { map } from 'rxjs/internal/operators/map'
import { distinctUntilChanged, switchMap, tap } from 'rxjs/operators'

import { useFeatureToggle } from '../../helpers/useFeatureToggle'
import { extractStopLossData } from '../automation/protection/common/StopLossTriggerDataExtractor'
import { TriggersData } from '../automation/protection/triggers/AutomationTriggersData'
import { ilksWithFilter$, IlksWithFilters } from '../ilks/ilksFilters'
import { vaultsWithFilter$, VaultsWithFilters, VaultWithSLData } from './vaultsFilters'
import { getVaultsSummary, VaultSummary } from './vaultSummary'

export interface VaultsOverview {
  vaults: {
    borrow: VaultsWithFilters
    multiply: VaultsWithFilters
  }
  vaultSummary: VaultSummary | undefined
  ilksWithFilters: IlksWithFilters
}

export function createVaultsOverview$(
  vaults$: (address: string) => Observable<VaultWithType[]>,
  ilksListWithBalances$: Observable<IlkWithBalance[]>,
  automationTriggersData$: (id: BigNumber) => Observable<TriggersData>,
  address: string,
): Observable<VaultsOverview> {
  const automationEnabled = useFeatureToggle('Automation')
  console.log('address:', address)
  console.log('automationEnabled:', automationEnabled)
  console.log('creating VaultsOverview and calling vaults$')
  const vaultsAddress$ = vaults$(address)
  console.log('vaultsAddress$:', vaultsAddress$)

  // const vaultWithAutomationData$ = vaults$(address).pipe(
  //   tap((val) => console.log('vaultWithAutomationData: ', val)),
  //   switchMap((vaults) => {
  //     return combineLatest(
  //       vaults.map((vault) => {
  //         return automationTriggersData$(vault.id).pipe(
  //           map((automationData) => ({ ...vault, ...extractStopLossData(automationData) })),
  //         )
  //       }),
  //     )
  //   }),
  // )

  // const borrowVaults = ((automationEnabled ? vaultWithAutomationData$ : vaults$(address)).pipe(
  //   tap((val) => console.log('borrowVaults: ', val)),
  //   map((vaults) => vaults.filter((vault) => vault.type === 'borrow')),
  //   // TODO casting won't be necessary when Automation feature flag will be removed
  // ) as unknown) as Observable<VaultWithSLData>

  // const multiplyVaults = ((automationEnabled ? vaultWithAutomationData$ : vaults$(address)).pipe(
  //   map((vaults) => vaults.filter((vault) => vault.type === 'multiply')),
  //   // TODO casting won't be necessary when Automation feature flag will be removed
  // ) as unknown) as Observable<VaultWithSLData>

  return combineLatest().pipe(
    // vaultsWithFilter$(borrowVaults),
    // vaultsWithFilter$(multiplyVaults),
    // vaultsAddress$.pipe(map(getVaultsSummary)),
    // ilksWithFilter$(ilksListWithBalances$),
    tap((val) => console.log('is emitting: ', val)),
    map(([borrow, multiply, vaultSummary, ilksWithFilters]) => ({
      vaults: {
        borrow,
        multiply,
      },
      vaultSummary,
      ilksWithFilters,
    })),
    distinctUntilChanged(isEqual),
  )
}
