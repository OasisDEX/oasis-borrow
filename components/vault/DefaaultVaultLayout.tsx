import t from "pages/api/t";
import React from "react";
import { Box, Grid } from "theme-ui";
import { DefaultVaultHeader } from "./DefaultVaultHeader";

export function DefaaultVaultLayout({
    detailsViewControl,
    editForm,
    headerControl,
    listControl
  }: {
    detailsViewControl: JSX.Element
    editForm: JSX.Element
    headerControl: JSX.Element,
    listControl?: JSX.Element
  }){
  return (
    <>
      {headerControl}
      <Grid variant="vaultContainer">
        <Grid gap={5} mb={[0, 5]}>
          {detailsViewControl}
          {listControl}
        </Grid>
        <Box>
          {editForm}
        </Box>
      </Grid>
    </>
  )
}