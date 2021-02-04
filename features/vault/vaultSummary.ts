import BigNumber from 'bignumber.js'
import { Vault } from 'blockchain/vaults'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

function getTotalCollateralPrice(vaults: Vault[]) {
  return vaults.reduce((total, vault) => total.plus(vault.collateralPrice), new BigNumber(0))
}

function getTotalDaiDebt(vaults: Vault[]) {
  return vaults.reduce((total, vault) => total.plus(vault.debt), new BigNumber(0))
}

export interface VaultSummary {
  totalCollateralPrice: BigNumber
  totalDaiDebt: BigNumber
  numberOfVaults: number,
  vaultsAtRisk: number,
}
export function createVaultSummary(
  vaults$: (address: string) => Observable<Vault[]>,
  address: string,
): Observable<VaultSummary> {
  return vaults$(address).pipe(
    map((vaults) => ({
      numberOfVaults: vaults.length,
      vaultsAtRisk: 0,
      totalCollateralPrice: getTotalCollateralPrice(vaults),
      totalDaiDebt: getTotalDaiDebt(vaults),
    })),
  )
}
