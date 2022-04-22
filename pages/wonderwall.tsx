import { LandingPageLayout } from 'components/Layouts'
import { AppLink } from 'components/Links'
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
        src="https://www.youtube.com/embed/6hzrDeceEKc"
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
  )
}
WonderwallPage.layout = LandingPageLayout
WonderwallPage.theme = 'Landing'

export default WonderwallPage
