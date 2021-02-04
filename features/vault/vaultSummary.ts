import BigNumber from 'bignumber.js'
import { Vault } from 'blockchain/vaults'
import { groupBy, mapValues } from 'lodash'
import { Observable, of } from 'rxjs'
import { map, shareReplay, switchMap } from 'rxjs/operators'
import { Dictionary } from 'ts-essentials'

function getTotalCollateralPrice(vaults: Vault[]) {
  return vaults.reduce((total, vault) => total.plus(vault.collateralPrice), new BigNumber(0))
}

function getTotalDaiDebt(vaults: Vault[]) {
  return vaults.reduce((total, vault) => total.plus(vault.debt), new BigNumber(0))
}

function getAssetRatio(vaults: Vault[], totalLocked: BigNumber) {
  const vaultsByToken = groupBy(vaults, vault => vault.token)
  return mapValues(vaultsByToken, vaults => getTotalCollateralPrice(vaults).div(totalLocked))
}

export interface VaultSummary {
  totalCollateralPrice: BigNumber
  totalDaiDebt: BigNumber
  numberOfVaults: number,
  vaultsAtRisk: number,
  depositedAssetRatio: Dictionary<BigNumber>,
}
export function createVaultSummary(
  vaults$: (address: string) => Observable<Vault[]>,
  address: string,
): Observable<VaultSummary> {
  return vaults$(address).pipe(
    switchMap(vaults => of(vaults).pipe(
      map((vaults) => ({
        numberOfVaults: vaults.length,
        vaultsAtRisk: 0,
        totalCollateralPrice: getTotalCollateralPrice(vaults),
        totalDaiDebt: getTotalDaiDebt(vaults),
      })),
      map(summary => ({
        ...summary,
        depositedAssetRatio: getAssetRatio(vaults, summary.totalCollateralPrice)
      }))
    )),
    shareReplay(1),
  )
}
