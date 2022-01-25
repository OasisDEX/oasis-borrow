import React, { ReactElement, useEffect } from 'react'
import { Box, Grid } from 'theme-ui'

interface OpenMultiplyVaultContainerProps {
  clear: () => void
  details: ReactElement
  form: ReactElement
  header: ReactElement
}

export function OpenMultiplyVaultContainer(props: OpenMultiplyVaultContainerProps) {
  const { clear, details, form, header } = props

  useEffect(() => {
    return () => {
      clear()
    }
  }, [])

  return (
    <>
      {header}
      <Grid variant="vaultContainer">
        <Box>{details}</Box>
        <Box>{form}</Box>
      </Grid>
    </>
  )
}
