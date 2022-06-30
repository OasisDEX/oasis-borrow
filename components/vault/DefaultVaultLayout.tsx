import React from 'react'
import { Box, Container, Grid } from 'theme-ui'

export function DefaultVaultLayout({
  detailsViewControl,
  editForm,
}: {
  detailsViewControl: JSX.Element
  editForm?: JSX.Element
}) {
  return (
    <Container variant="vaultPageContainer" sx={{ zIndex: 0 }}>
      <Grid variant="vaultContainer">
        <Grid gap={3} mb={[0, 5]}>
          {detailsViewControl}
        </Grid>
        {editForm && <Box>{editForm}</Box>}
      </Grid>
    </Container>
  )
}
