import { TabBar } from 'components/TabBar'
import { aaveFaq } from 'features/content/faqs/aave'
import { Survey } from 'features/survey'

import React from 'react'
import { Box, Card, Container, Grid } from 'theme-ui'

import { VaultContainerSpinner, WithLoadingIndicator } from 'helpers/AppSpinner'
import { WithErrorHandler } from 'helpers/errorHandlers/WithErrorHandler'
import { useTranslation } from 'next-i18next'

export function AaveOpenView() {
  const [openAave, openAaveError] = [{/* pipeline */}, []]
  const { t } = useTranslation()
  
  return (
    <WithErrorHandler error={openAaveError}>
      <WithLoadingIndicator value={openAave} customLoader={<VaultContainerSpinner />}>
        {(openAave) => (
          <Container variant="vaultPageContainer">
            <TabBar
              variant="underline"
              sections={[
                {
                  value: 'simulate',
                  label: t('open-vault.simulate'),
                  content: <Grid variant="vaultContainer">
                    <Box>[OPEN AAVE DETAILS]</Box>
                    <Box>[FORM]</Box>
                  </Grid>,
                  },
                {
                  value: 'position-info',
                  label: t('system.position-info'),
                  content: <Card variant="faq">{aaveFaq}</Card>,
                },
              ]}
            />
            <Survey for="earn" />
          </Container>
        )}
      </WithLoadingIndicator>
    </WithErrorHandler>
  )
}
