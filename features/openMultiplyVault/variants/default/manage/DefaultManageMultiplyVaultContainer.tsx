import React from 'react'

import { DefaultVaultHeader } from '../../../../../components/vault/DefaultVaultHeader'
import { VaultHistoryView } from '../../../../vaultHistory/VaultHistoryView'
import {
  ManageMultiplyVaultContainer,
  ManageMultiplyVaultContainerProps,
} from '../../../common/ManageMultiplyVaultContainer'
import { DefaultManageMultiplyVaultDetails } from './DefaultManageMultiplyVaultDetails'
import { DefaultManageMultiplyVaultForm } from './DefaultManageMultiplyVaultForm'

export function DefaultManageMultiplyVaultContainer(props: ManageMultiplyVaultContainerProps) {
  return (
    <ManageMultiplyVaultContainer
      {...props}
      header={DefaultVaultHeader}
      details={DefaultManageMultiplyVaultDetails}
      form={DefaultManageMultiplyVaultForm}
      history={VaultHistoryView}
    />
  )
}
