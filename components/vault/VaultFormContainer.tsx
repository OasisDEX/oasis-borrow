import { MobileSidePanel } from 'components/Modal'
import type { PropsWithChildren } from 'react'
import React from 'react'
import { Card, Grid } from 'theme-ui'

export function VaultFormContainer({
  children,
  toggleTitle,
}: PropsWithChildren<{ toggleTitle: string }>) {
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
