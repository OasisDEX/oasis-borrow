import { IlkDataList } from 'blockchain/ilks'
import React from 'react'

import { Vault } from '../../blockchain/vaults'
import { DefaultVaultHeaderLayout } from './DefaultVaultHeaderLayout'

export interface DefaultVaultHeaderControlProps {
  vault: Vault
  ilkDataList: IlkDataList
}

export function DefaultVaultHeaderControl({ ilkDataList, vault }: DefaultVaultHeaderControlProps) {
  const ilk = ilkDataList.find((x) => x.ilk === vault.ilk)

  if (ilk) {
    const vaultHeaderProps = {
      id: vault.id,
      debtFloor: ilk.debtFloor,
      liquidationPenalty: ilk.liquidationPenalty,
      liquidationRatio: ilk.liquidationRatio,
      stabilityFee: ilk.stabilityFee,
    }

    const guniHeaderProps = {
      id: vault.id,
      stabilityFee: ilk.stabilityFee,
      debtFloor: ilk.debtFloor,
    }

    const headerProps = ['GUNIV3DAIUSDC1-A', 'GUNIV3DAIUSDC2-A'].includes(vault.ilk)
      ? guniHeaderProps
      : vaultHeaderProps

    return <DefaultVaultHeaderLayout {...headerProps} />
  }

  return null
}
