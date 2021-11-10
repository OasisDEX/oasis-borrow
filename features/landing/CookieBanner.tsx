import ChevronUpDown from 'components/ChevronUpDown'
import { AppLink } from 'components/Links'
import React, { useState } from 'react'
import { Trans,useTranslation } from 'react-i18next'
import { Box, Button, Container, Flex, Grid } from 'theme-ui'

export default function CookieBanner() {
  const { t } = useTranslation()
  const [showSettings, setShowSettings] = useState(false)

  return <Box sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 'cookie' }}>
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
            <Button variant="bean" sx={{ fontSize: 2 }}>{t('landing.cookie-banner.reject')}</Button>
            <Button variant="beanActive"  sx={{ fontSize: 2 }}>{t('landing.cookie-banner.accept')}</Button>
          </Grid>
        </Flex>
        <Button variant="textual" sx={{ fontWeight: 'body', pl: 0 }} onClick={() => setShowSettings(!showSettings)}>
          {t('landing.cookie-banner.settings-toggle')}
          <ChevronUpDown 
            isUp={showSettings}
            size={10}
            sx={{ ml: 2 }}
          />
        </Button>
        {showSettings && <Box>
          [Settings]
        </Box>}
      </Box>
    </Container>
  </Box>
}