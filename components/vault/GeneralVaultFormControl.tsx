import React from 'react'

import { ManageVaultForm } from '../../features/borrow/manage/containers/ManageVaultView'
import { GuniManageMultiplyVaultForm } from '../../features/earn/guni/manage/containers/GuniManageMultiplyVaultForm'
import { GeneralManageVaultState } from '../../features/generalManageVault/generalManageVault'
import { VaultType } from '../../features/generalManageVault/vaultType'
import { ManageMultiplyVaultForm } from '../../features/multiply/manage/containers/ManageMultiplyVaultForm'

interface GeneralVaultFormControlProps {
  generalManageVault: GeneralManageVaultState
}

export function GeneralVaultFormControl({ generalManageVault }: GeneralVaultFormControlProps) {
  switch (generalManageVault.type) {
    case VaultType.Borrow:
      return <ManageVaultForm {...generalManageVault.state} />
    case VaultType.Multiply:
      const vaultIlk = generalManageVault.state.ilkData.ilk
      const mutiplyFormContainerMap: Record<string, JSX.Element> = {
        'GUNIV3DAIUSDC1-A': <GuniManageMultiplyVaultForm {...generalManageVault.state} />,
        'GUNIV3DAIUSDC2-A': <GuniManageMultiplyVaultForm {...generalManageVault.state} />,
      }
      return mutiplyFormContainerMap[vaultIlk] ? (
        mutiplyFormContainerMap[vaultIlk]
      ) : (
        <ManageMultiplyVaultForm {...generalManageVault.state} />
      )
    default:
      return <></>
  }
}
