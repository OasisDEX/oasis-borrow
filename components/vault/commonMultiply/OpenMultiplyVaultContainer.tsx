import React, { ReactElement, useEffect } from 'react'
import { Box, Grid } from 'theme-ui'

import { EarnVaultSimulateTabBar } from '../EarnVaultSimulateTabBar'

interface OpenMultiplyVaultContainerProps {
  clear: () => void
  details: ReactElement
  form: ReactElement
  header: ReactElement
  faq?: ReactElement
}

export function OpenMultiplyVaultContainer(props: OpenMultiplyVaultContainerProps) {
  const { clear, details, form, header, faq } = props

  useEffect(() => {
    return () => {
      clear()
    }
  }, [])

  const detailsAndForm = (
    <Grid variant="vaultContainer">
      <Box>{details}</Box>
      <Box>{form}</Box>
    </Grid>
  )

  return (
    <>
      {header}
      {faq ? <EarnVaultSimulateTabBar detailsAndForm={detailsAndForm} faq={faq} /> : detailsAndForm}
    </>
  )
}
