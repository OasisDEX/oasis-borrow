import React from 'react'
import { Card, Grid } from 'theme-ui'

export function DefaultVaultLayout({
  detailsViewControl,
  editForm,
  headerControl,
  listControl,
}: {
  detailsViewControl: JSX.Element
  editForm: JSX.Element
  headerControl: JSX.Element
  listControl?: JSX.Element
}) {
  return (
    <>
      {headerControl}
      <Grid variant="vaultContainer">
        <Grid gap={5} mb={[0, 5]}>
          {detailsViewControl}
          {listControl}
        </Grid>
        <Card
          sx={{
            borderRadius: 'large',
            border: 'lightMuted',
            boxShadow: 'vaultDetailsCard',
            padding: '24px',
          }}
        >
          {editForm}
        </Card>
      </Grid>
    </>
  )
}
