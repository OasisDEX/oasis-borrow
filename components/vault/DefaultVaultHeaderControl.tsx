import type { IlkData } from 'blockchain/ilks.types'
import type { Vault } from 'blockchain/vaults.types'
import React from 'react'

import { VaultHeaderLayout } from './VaultHeaderLayout'

export interface DefaultVaultHeaderControlProps {
  vault: Vault
  ilkData: IlkData
}

export function DefaultVaultHeaderControl({ ilkData, vault }: DefaultVaultHeaderControlProps) {
  const vaultHeaderProps = {
    id: vault.id,
    debtFloor: ilkData.debtFloor,
    liquidationPenalty: ilkData.liquidationPenalty,
    liquidationRatio: ilkData.liquidationRatio,
    stabilityFee: ilkData.stabilityFee,
    originationFeePercent:
      'originationFeePercent' in vault ? vault.originationFeePercent : undefined,
  }

  const guniHeaderProps = {
    id: vault.id,
    stabilityFee: ilkData.stabilityFee,
    debtFloor: ilkData.debtFloor,
  }

  const headerProps = ['GUNIV3DAIUSDC1-A', 'GUNIV3DAIUSDC2-A'].includes(vault.ilk)
    ? guniHeaderProps
    : vaultHeaderProps

  return <VaultHeaderLayout {...headerProps} />
}
