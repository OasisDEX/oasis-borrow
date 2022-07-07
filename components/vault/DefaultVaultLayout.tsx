import React from 'react'
import { Box, Container, Grid } from 'theme-ui'

export function DefaultVaultLayout({
  detailsViewControl,
  editForm,
  listControl,
}: {
  detailsViewControl: JSX.Element
  editForm?: JSX.Element
  listControl?: JSX.Element
}) {
  return (
    <Container variant="vaultPageContainer" sx={{ zIndex: 0 }}>
      <Grid variant="vaultContainer">
        <Grid gap={5} mb={[0, 5]}>
          {detailsViewControl}
          {listControl}
        </Grid>
        {editForm && <Box>{editForm}</Box>}
      </Grid>
    </Container>
  )
}
