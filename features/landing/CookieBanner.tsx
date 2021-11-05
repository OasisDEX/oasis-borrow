import { Box, Container, Flex, Button, Grid } from 'theme-ui'
import React from 'react'
import { useTranslation, Trans } from 'react-i18next'
import { AppLink } from 'components/Links'

export default function CookieBanner() {
  const { t } = useTranslation()

  return <Box sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 'cookie'}}>
    <Container variant="landingContainer" sx={{ margin: '0 auto', px: 3 }}>
      <Box sx={{ boxShadow: 'fixedBanner', bg: 'surface', borderRadius: '16px 16px 0 0', padding: '24px', pb: 3 }}>
        <Flex sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ maxWidth: '872px', mr: 2 }}>
            <Box sx={{ variant: 'text.paragraph3' }}>
              <Trans
                  i18nKey="landing.cookie-banner.message"
                  components={[
                    <AppLink
                      href="/privacy"
                      sx={{ fontSize: 2, fontWeight: 'body' }}
                    />,
                  ]}
                />
            </Box>
          </Box>
          <Grid sx={{ gridTemplateColumns: '1fr 1fr', gap: 2, alignItems: 'start', minWidth: '200px' }}>
            <Button variant="bean" sx={{ fontSize: 2, display: 'inline' }}>{t('landing.cookie-banner.reject')}</Button>
            <Button variant="beanActive"  sx={{ fontSize: 2, display: 'inline' }}>{t('landing.cookie-banner.accept')}</Button>
          </Grid>
        </Flex>
      </Box>
    </Container>
  </Box>
}