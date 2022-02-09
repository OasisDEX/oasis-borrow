import { IlkDataList } from 'blockchain/ilks'
import React from 'react'

import { Vault } from '../../blockchain/vaults'
import { DefaultVaultHeaderLayout } from './DefaultVaultHeaderLayout'

export interface DefaultVaultHeaderControlProps {
  vault: Vault
  ilkDataList: IlkDataList
}

export function DefaultVaultHeaderControl({ ilkDataList, vault }: DefaultVaultHeaderControlProps) {
  const ilk = ilkDataList.filter((x) => x.ilk === vault.ilk)[0]

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

  const headerProps =
    vault.ilk === 'GUNIV3DAIUSDC1-A' || vault.ilk === 'GUNIV3DAIUSDC2-A'
      ? guniHeaderProps
      : vaultHeaderProps

  return <DefaultVaultHeaderLayout {...headerProps} />
}
