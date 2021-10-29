import { getToken } from 'blockchain/tokensMetadata'
import { AppLinkWithArrow, ROUTES } from 'components/Links'
import { WithChildren } from 'helpers/types'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Card, Grid, Heading, Text } from 'theme-ui'

function AssetCard({ children }: WithChildren) {
  return (
    <Card sx={{ p: 4, borderRadius: 'large', mb: 3 }}>
      <Box py={2}>{children}</Box>
    </Card>
  )
}

function AssetFindVault() {
  return (
    <AssetCard>
      <Heading variant="header3" sx={{ textAlign: 'center', fontSize: 4 }}>
        Placehooolder
      </Heading>
    </AssetCard>
  )
}

function AssetOtherAssets() {
  const { t } = useTranslation()

  return (
    <AssetCard>
      <Heading variant="header3">{t('asset-page.other-assets-title')}</Heading>
      <AppLinkWithArrow href={ROUTES.ASSETS} sx={{ color: 'link', fontWeight: 'body' }}>
        {t('asset-page.other-assets-link')}
      </AppLinkWithArrow>
    </AssetCard>
  )
}

export function AssetAbout({ token }: { token: string }) {
  const {
    t,
    i18n: { language },
  } = useTranslation()
  const tokenData = getToken(token)

  const description =
    (tokenData.description &&
      tokenData.description[language as keyof typeof tokenData.description]) ||
    'Missing description'

  return (
    <AssetCard>
      <Heading variant="header3">{t('asset-page.about-title', { token: tokenData.name })}</Heading>
      <Text sx={{ mt: 3, mb: 4, color: 'text.subtitle' }}>{description}</Text>
      {tokenData.link && (
        <AppLinkWithArrow href={tokenData.link} sx={{ color: 'link', fontWeight: 'body' }}>
          {t('asset-page.about-link')}
        </AppLinkWithArrow>
      )}
    </AssetCard>
  )
}

export function AssetView({ token }: { token: string }) {
  return (
    <Box sx={{ position: 'relative', zIndex: 1, width: '100%' }}>
      <Heading as="h1" variant="header2" sx={{ textAlign: 'center', mt: 6, mb: 5 }}>
        {token}
      </Heading>
      <Grid gap={4} columns="461px 1fr">
        <Grid>
          <AssetFindVault />
          <AssetOtherAssets />
          <AssetAbout token={token} />
        </Grid>
        <Grid>Placeholder ilks</Grid>
      </Grid>
    </Box>
  )
}
