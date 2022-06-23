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
            value: 'Simulate',
            label: 'Simulate',
            content: detailsAndForm
          },
          {
            value: 'FAQ',
            label: 'FAQ',
            content: <Card variant='faq'>
              {faq}
            </Card>
          }
        ]} />): detailsAndForm}
    </>
  )
}
