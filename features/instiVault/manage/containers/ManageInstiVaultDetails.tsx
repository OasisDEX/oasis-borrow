import React from 'react'
import { ManageVaultDetails } from 'features/borrow/manage/containers/ManageVaultDetails'
import { ManageVaultState } from 'features/borrow/manage/pipes/manageVault'
import { Box } from 'theme-ui'

export function ManageInstiVaultDetails(props: ManageVaultState) {
  return <ManageVaultDetails extraCards={
    <>
      <Box>extra card 1</Box>
      <Box>extra card 2</Box>
    </>
  } {...props} />
}
