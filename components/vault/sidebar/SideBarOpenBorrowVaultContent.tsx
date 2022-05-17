import { OpenVaultState } from 'features/borrow/open/pipes/openVault'
import React from 'react'
import { Grid } from 'theme-ui'

export function SideBarOpenBorrowVaultContent(props: OpenVaultState) {
  const { stage } = props

  return (
    <Grid gap={3}>
      <span>stage: {stage}</span>
      <span>asd</span>
      <span>asd</span>
      <span>asd</span>
    </Grid>
  )
}
