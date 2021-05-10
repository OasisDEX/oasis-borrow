import BigNumber from 'bignumber.js'
import { Vault } from 'blockchain/vaults'
import { groupBy, mapValues } from 'lodash'
import { Dictionary } from 'ts-essentials'

export interface VaultSummary {
  totalCollateralPrice: BigNumber
  totalDaiDebt: BigNumber
  numberOfVaults: number
  vaultsAtRisk: number
  depositedAssetRatio: Dictionary<BigNumber>
}

function getTotalCollateralPrice(vaults: Vault[]) {
  return vaults.reduce((total, vault) => total.plus(vault.lockedCollateralUSD), new BigNumber(0))
}

function getTotalDaiDebt(vaults: Vault[]) {
  return vaults.reduce((total, vault) => total.plus(vault.debt), new BigNumber(0))
}

function getAssetRatio(vaults: Vault[], totalLocked: BigNumber) {
  const vaultsByToken = groupBy(vaults, (vault) => vault.token)
  return mapValues(vaultsByToken, (vaults) => getTotalCollateralPrice(vaults).div(totalLocked))
}

export function getVaultsSummary(vaults: Vault[]): VaultSummary {
  const totalCollateralPrice = getTotalCollateralPrice(vaults)
  return {
    numberOfVaults: vaults.length,
    vaultsAtRisk: vaults.reduce((total, vault) => (vault.atRiskLevelDanger ? total + 1 : total), 0),
    totalCollateralPrice,
    totalDaiDebt: getTotalDaiDebt(vaults),
    depositedAssetRatio: getAssetRatio(vaults, totalCollateralPrice),
  }
}
