import BigNumber from "bignumber.js";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

import { Vault } from "./vault";

function getTotalCollateralPrice(vaults: Vault[]) {
    return vaults.reduce((total, vault) => total.plus(vault.collateralPrice), new BigNumber(0))
  }
  
function getTotalDaiDebt(vaults: Vault[]) {
return vaults.reduce((total, vault) => total.plus(vault.debt), new BigNumber(0))
}

export interface VaultSummary {
    totalCollateralPrice: BigNumber
    totalDaiDebt: BigNumber
}
export function createVaultSummary(vaults$: (address: string) => Observable<Vault[]>, address: string,) {
    return vaults$(address).pipe(
        map(vaults => ({
            totalCollateralPrice: getTotalCollateralPrice(vaults),
            totalDaiDebt: getTotalDaiDebt(vaults)
        }))
    )
} 