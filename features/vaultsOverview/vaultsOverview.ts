import { BigNumber } from 'bignumber.js'
import { VaultWithType } from 'blockchain/vaults'
import { IlkWithBalance } from 'features/ilks/ilksWithBalances'
import { isEqual } from 'lodash'
import { Observable } from 'rxjs'
import { combineLatest } from 'rxjs'
import { map } from 'rxjs/internal/operators/map'
import { distinctUntilChanged, switchMap } from 'rxjs/operators'

import { useFeatureToggle } from '../../helpers/useFeatureToggle'
import { extractStopLossData } from '../automation/common/StopLossTriggerDataExtractor'
import { TriggersData } from '../automation/triggers/AutomationTriggersData'
import { ilksWithFilter$, IlksWithFilters } from '../ilks/ilksFilters'
import { vaultsWithFilter$, VaultsWithFilters } from './vaultsFilters'
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

  const vaultsAddress$ = vaults$(address)

  const vaultWithAutomationData$ = vaults$(address).pipe(
    switchMap((vaults) => {
      return combineLatest(
        vaults.map((vault) => {
          return automationTriggersData$(vault.id).pipe(
            map((automationData) => ({ ...vault, ...extractStopLossData(automationData) })),
          )
        }),
      )
    }),
  )

  return combineLatest(
    vaultsWithFilter$(
      (automationEnabled ? vaultWithAutomationData$ : vaults$(address)).pipe(
        map((vaults) => vaults.filter((vault) => vault.type === 'borrow')),
      ),
    ),
    vaultsWithFilter$(
      (automationEnabled ? vaultWithAutomationData$ : vaults$(address)).pipe(
        map((vaults) => vaults.filter((vault) => vault.type === 'multiply')),
      ),
    ),
    vaultsAddress$.pipe(map(getVaultsSummary)),
    ilksWithFilter$(ilksListWithBalances$),
  ).pipe(
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
