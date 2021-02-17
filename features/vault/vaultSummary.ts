import BigNumber from 'bignumber.js'
import { Vault } from 'blockchain/vaults'
import { zero } from 'helpers/zero'
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
  return vaults.reduce((total, vault) => total.plus(vault.collateralPrice), new BigNumber(0))
}

function getTotalDaiDebt(vaults: Vault[]) {
  return vaults.reduce((total, vault) => total.plus(vault.debt), new BigNumber(0))
}

function getAssetRatio(vaults: Vault[], totalLocked: BigNumber) {
  const vaultsByToken = groupBy(vaults, (vault) => vault.token)
  return mapValues(vaultsByToken, (vaults) => getTotalCollateralPrice(vaults).div(totalLocked))
}

function isVaultAtRisk(vault: Vault) {
  if (vault.debt.eq(zero)) {
    return false
  }
  const safetyMargin = 1.2 //

  return vault.collateralizationRatio?.div(vault.liquidationRatio).lt(safetyMargin)
}

export function getVaultsSummary(vaults: Vault[]): VaultSummary {
  const totalCollateralPrice = getTotalCollateralPrice(vaults)
  return {
    numberOfVaults: vaults.length,
    vaultsAtRisk: vaults
      .map(isVaultAtRisk)
      .reduce((total, atRisk) => (atRisk ? total + 1 : total), 0),
    totalCollateralPrice,
    totalDaiDebt: getTotalDaiDebt(vaults),
    depositedAssetRatio: getAssetRatio(vaults, totalCollateralPrice),
  }
}
