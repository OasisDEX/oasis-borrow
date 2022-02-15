import React from 'react'
import { ManageVaultState } from 'features/borrow/manage/pipes/manageVault'
import { ManageVaultForm } from 'features/borrow/manage/containers/ManageVaultForm'

export function ManageInstiVaultForm(props: ManageVaultState) {

  return <ManageVaultForm isInstiVault={true} {...props} />
}