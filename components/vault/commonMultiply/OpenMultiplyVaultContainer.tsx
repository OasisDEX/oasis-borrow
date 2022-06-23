import { UnderlineTabs } from 'components/dumb/Tabs'
import { TranslatedContent } from 'features/content'
import React, { ReactElement, useEffect } from 'react'
import { Box, Card, Grid } from 'theme-ui'

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

  const detailsAndForm = <Grid variant="vaultContainer">
    <Box>{details}</Box>
    <Box>{form}</Box>
  </Grid>

  return (
    <>
      {header}
      {faq ? (<UnderlineTabs sections={[
          {
            hash: 'Simulate',
            label: 'Simulate',
            content: detailsAndForm
          },
          {
            hash: 'FAQ',
            label: 'FAQ',
            content: <Card sx={{ p: 4, borderRadius: 'mediumLarge', maxWidth: '711px' }}>
              {faq}
            </Card>
          }
        ]} />): detailsAndForm}
    </>
  )
}
