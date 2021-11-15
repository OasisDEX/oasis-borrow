import React from 'react'

import { VaultHistoryView } from '../../../../vaultHistory/VaultHistoryView'
import {
  ManageMultiplyVaultContainer,
  ManageMultiplyVaultContainerProps,
} from '../../../common/ManageMultiplyVaultContainer'
import { GuniVaultHeader } from '../GuniVaultHeader'
import { GuniManageMultiplyVaultDetails } from './GuniManageMultiplyVaultDetails'
import { GuniManageMultiplyVaultForm } from './GuniManageMultiplyVaultForm'

export function GuniManageMultiplyVaultCointainer(props: ManageMultiplyVaultContainerProps) {
  return (
    <ManageMultiplyVaultContainer
      {...props}
      header={GuniVaultHeader}
      details={GuniManageMultiplyVaultDetails}
      form={GuniManageMultiplyVaultForm}
      history={VaultHistoryView}
    />
  )
}
