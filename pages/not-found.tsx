import { PageSEOTags } from 'components/HeadTags'
import { MarketingLayout } from 'components/layouts/MarketingLayout'
import { AppLink } from 'components/Links'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React from 'react'
import { Button, Container, Grid, Heading } from 'theme-ui'

export const getStaticProps = async ({ locale }: { locale: string }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
})

function NotFoundPage() {
  const { t } = useTranslation()

  return (
    <MarketingLayout topBackground="light">
      <Container>
        <Grid gap={4} sx={{ justifyContent: 'center', textAlign: 'center', mt: 5 }}>
          <PageSEOTags title="seo.404.title" description="seo.404.description" url="/404" />
          <Heading>{t('404-message')}</Heading>
          <AppLink href="/">
            <Button>{t('404-button')}</Button>
          </AppLink>
          {process.env.NODE_ENV !== 'production' && (
            <AppLink href="/" sx={{ mt: '-20px' }}>
              <Button variant="secondary" onClick={() => window.history.back()}>
                {t('404-back')}
              </Button>
            </AppLink>
          )}
        </Grid>
      </Container>
    </MarketingLayout>
  )
}

export default NotFoundPage
