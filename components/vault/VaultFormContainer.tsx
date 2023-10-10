import { MobileSidePanel } from 'components/Modal'
import type { WithChildren } from 'helpers/types/With.types'
import React from 'react'
import { Card, Grid } from 'theme-ui'

export function VaultFormContainer({
  children,
  toggleTitle,
}: WithChildren & { toggleTitle: string }) {
  return (
    <MobileSidePanel toggleTitle={toggleTitle}>
      <Card variant="vaultFormContainer">
        <Grid gap={4} p={[0, 2]}>
          {children}
        </Grid>
      </Card>
    </MobileSidePanel>
  )
}
