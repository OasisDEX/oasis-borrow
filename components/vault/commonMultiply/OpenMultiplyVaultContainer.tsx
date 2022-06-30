import { TabBar } from 'components/TabBar'
import { useTranslation } from 'next-i18next'
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
  const { t } = useTranslation()

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
      {faq ? (
        <TabBar
          variant="underline"
          sections={[
            {
              value: 'simulate',
              label: t('open-vault.simulate'),
              content: detailsAndForm,
            },
            {
              value: 'position-info',
              label: t('system.position-info'),
              content: <Card variant="faq">{faq}</Card>,
            },
          ]}
        />
      ) : (
        detailsAndForm
      )}
    </>
  )
}
