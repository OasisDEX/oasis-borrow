import { Vault } from 'blockchain/vaults'
import React from 'react'
import { Grid } from 'theme-ui'

import { ConstantMultipleDetailsLayout } from './ConstantMultipleDetailsLayout'

interface ConstantMultipleControlProps {
  vault: Vault
}

export function ConstantMultipleControl({ vault }: ConstantMultipleControlProps) {
  return (
    <Grid>
      <ConstantMultipleDetailsLayout token={vault.token} />
    </Grid>
  )
}
