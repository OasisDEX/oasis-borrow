import { TabBar } from 'components/TabBar'
import { useTranslation } from 'next-i18next'
import React, { useEffect } from 'react'
import { Box, Card, Grid } from 'theme-ui'

import type { OpenMultiplyVaultContainerProps } from './OpenMultiplyVaultContainer.types'

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
