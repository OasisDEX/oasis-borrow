import { MarketingLayout } from 'components/Layouts'
import { AppLink } from 'components/Links'
import { useTranslation } from 'i18n'
import React from 'react'
import { Button, Container, Grid, Heading } from 'theme-ui'

export default function NotFoundPage() {
  const { t } = useTranslation('common')

  return (
    <Container>
      <Grid gap={4} sx={{ justifyContent: 'center', textAlign: 'center', mt: 5 }}>
        <Heading>{t('404-message')}</Heading>
        <AppLink href="/">
          <Button>{t('404-button')}</Button>
        </AppLink>
      </Grid>
    </Container>
  )
}

NotFoundPage.layout = MarketingLayout
