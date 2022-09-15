import { Grid } from '@theme-ui/components'
import { Vault } from 'blockchain/vaults'
import React from 'react'

import { AutoTakeProfitDetailsLayout } from './AutoTakeProfitDetailsLayout'

interface AutoTakeProfitDetailsControlProps {
  vault: Vault
}

export function AutoTakeProfitDetailsControl({ vault }: AutoTakeProfitDetailsControlProps) {
  return (
    <Grid>
      <AutoTakeProfitDetailsLayout token={vault.token} />
    </Grid>
  )
}
