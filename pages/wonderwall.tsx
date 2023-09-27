import { LandingPageLayout } from 'components/layouts/LandingPageLayout'
import { AppLink } from 'components/Links'
import { EXTERNAL_LINKS } from 'helpers/applicationLinks'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React from 'react'
import { Box, Button, Grid } from 'theme-ui'

export const getStaticProps = async ({ locale }: { locale: string }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
})

function WonderwallPage() {
  const { t } = useTranslation()

  return (
    <LandingPageLayout>
      <Grid
        columns={1}
        sx={{
          alignItems: 'center',
          justifyContent: 'center',
          marginLeft: 'auto',
          marginRight: 'auto',
        }}
      >
        <iframe
          src={EXTERNAL_LINKS.WONDERWALL}
          frameBorder="0"
          allow="autoplay; encrypted-media"
          allowFullScreen
          title="video"
        />
        <Box>
          <AppLink
            sx={{
              alignItems: 'center',
              justifyContent: 'center',
              marginLeft: '15%',
              marginRight: 'auto',
            }}
            href="/"
          >
            <Button>{t('get-started-button')}</Button>
          </AppLink>
        </Box>
      </Grid>
    </LandingPageLayout>
  )
}

export default WonderwallPage
