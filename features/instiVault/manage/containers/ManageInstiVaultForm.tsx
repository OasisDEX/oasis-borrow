import React from 'react'
import { ManageVaultForm } from 'features/borrow/manage/containers/ManageVaultForm'
import { ManageVaultState } from 'features/borrow/manage/pipes/manageVault'

export function ManageIntiVaultForm(props: ManageVaultState) {
  return <ManageVaultForm isInstiVault={true} {...props} />
}