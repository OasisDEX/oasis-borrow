import type { VaultType } from '@prisma/client'
import type BigNumber from 'bignumber.js'
import type { Observable } from 'rxjs'

import type { MakerVaultType } from './calls/vaultResolver'

export interface VaultWithType extends Vault {
  type: VaultType
}

export interface CdpIdsResolver {
  (address: string): Observable<BigNumber[]>
}

export type VaultWithValue<V extends VaultWithType> = V & { value: BigNumber }

export interface Vault {
  makerType: MakerVaultType
  id: BigNumber
  owner: string
  controller?: string
  token: string
  ilk: string
  address: string
  lockedCollateral: BigNumber
  unlockedCollateral: BigNumber
  lockedCollateralUSD: BigNumber
  lockedCollateralUSDAtNextPrice: BigNumber
  backingCollateral: BigNumber
  backingCollateralAtNextPrice: BigNumber
  backingCollateralUSD: BigNumber
  backingCollateralUSDAtNextPrice: BigNumber
  freeCollateral: BigNumber
  freeCollateralAtNextPrice: BigNumber
  freeCollateralUSD: BigNumber
  freeCollateralUSDAtNextPrice: BigNumber
  debt: BigNumber
  debtOffset: BigNumber
  normalizedDebt: BigNumber
  availableDebt: BigNumber
  availableDebtAtNextPrice: BigNumber
  collateralizationRatio: BigNumber
  collateralizationRatioAtNextPrice: BigNumber
  liquidationPrice: BigNumber
  daiYieldFromLockedCollateral: BigNumber

  atRiskLevelWarning: boolean
  atRiskLevelDanger: boolean
  underCollateralized: boolean

  atRiskLevelWarningAtNextPrice: boolean
  atRiskLevelDangerAtNextPrice: boolean
  underCollateralizedAtNextPrice: boolean
  chainId: number
}

export interface VaultChange {
  kind: 'vault'
  vault: Vault
}
