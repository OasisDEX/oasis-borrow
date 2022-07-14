import { Vault } from 'blockchain/vaults'
import React from 'react'
import { Grid } from 'theme-ui'

import { ConstantMultipleDetailsLayout } from './ConstantMultipleDetailsLayout'

interface ConstantMultipleDetailsControlProps {
  vault: Vault
}

export function ConstantMultipleDetailsControl({ vault }: ConstantMultipleDetailsControlProps) {
  return (
    <Grid>
      <ConstantMultipleDetailsLayout token={vault.token} />
    </Grid>
  )
}
