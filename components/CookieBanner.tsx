import type { CookieName } from 'analytics/common'
import { COOKIE_NAMES } from 'analytics/common'
import { manageCookie } from 'analytics/manageCookie'
import { Checkbox } from 'components/Checkbox'
import { ChevronUpDown } from 'components/ChevronUpDown'
import { AppLink } from 'components/Links'
import { currentContent } from 'features/content'
import { Trans, useTranslation } from 'next-i18next'
import React, { Fragment, useState } from 'react'
import { Box, Button, Card, Container, Flex, Grid, Text } from 'theme-ui'

import type { CookieBannerProps, SavedSettings, SelectedCookies } from './CookieBanner.types'

export function initSelectedCookies(defaultValue: boolean): SelectedCookies {
  return COOKIE_NAMES.reduce((acc, cookieName) => ({ ...acc, [cookieName]: defaultValue }), {})
}

export default function CookieBanner({ value, setValue }: CookieBannerProps) {
  const { t } = useTranslation()

  const [showSettings, setShowSettings] = useState(false)
  const [selectedCookies, setSelectedCookies] = useState(initSelectedCookies(false))
  const [settingsAreSaved, setSettingsAreSaved] = useState(false)

  if (settingsAreSaved || (value && value.version === currentContent.cookie.version)) {
    return null
  }

  function toggleCookie(cookieName: CookieName) {
    const isEnabled = selectedCookies[cookieName]
    setSelectedCookies({
      ...selectedCookies,
      [cookieName]: !isEnabled,
    })
    if (isEnabled) {
      manageCookie[cookieName].disable()
    } else {
      manageCookie[cookieName].enable()
    }
  }

  function saveSettings(settings: SavedSettings) {
    setValue(settings)
    setSettingsAreSaved(true)
  }

  function rejectCookies() {
    COOKIE_NAMES.forEach((cookieName) => manageCookie[cookieName].disable())
    saveSettings({
      accepted: false,
      enabledCookies: initSelectedCookies(false),
      version: currentContent.cookie.version,
    })
  }

  function acceptSelectedCookies() {
    COOKIE_NAMES.forEach((cookieName) => {
      if (selectedCookies[cookieName]) {
        manageCookie[cookieName].enable()
      } else {
        manageCookie[cookieName].disable()
      }
    })
    saveSettings({
      accepted: true,
      enabledCookies: selectedCookies,
      version: currentContent.cookie.version,
    })
  }
  function acceptAllCookies() {
    COOKIE_NAMES.forEach((cookieName) => {
      manageCookie[cookieName].enable()
    })
    saveSettings({
      accepted: true,
      enabledCookies: initSelectedCookies(true),
      version: currentContent.cookie.version,
    })
  }

  const ctaButtons = (
    <Container
      variant="buttonPair"
      sx={{
        display: 'inline-grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 2,
        alignItems: 'start',
        direction: ['rtl', 'unset'],
      }}
    >
      <Button variant="bean" sx={{ fontSize: 2 }} onClick={() => rejectCookies()}>
        {t('landing.cookie-banner.reject')}
      </Button>
      <Button
        variant="beanActive"
        sx={{ fontSize: 2 }}
        onClick={() => (showSettings ? acceptSelectedCookies() : acceptAllCookies())}
      >
        {t('landing.cookie-banner.accept')}
      </Button>
    </Container>
  )

  return (
    <Box sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 'cookie' }}>
      <Container variant="landingContainer" sx={{ margin: '0 auto', px: 3 }}>
        <Card variant="cookieBanner">
          <Flex sx={{ justifyContent: 'space-between' }}>
            <Box sx={{ mr: [2, 3, 4] }}>
              <Box sx={{ variant: 'text.paragraph3' }}>
                <Trans
                  i18nKey="landing.cookie-banner.message"
                  components={[<AppLink href="/cookie" sx={{ fontSize: 2, fontWeight: 'body' }} />]}
                />
              </Box>
            </Box>
            <Container variant="buttonPair" sx={{ display: ['none', 'block'] }}>
              {ctaButtons}
            </Container>
          </Flex>
          <Button
            variant="textual"
            sx={{ fontWeight: 'regular', pl: 0 }}
            onClick={() => setShowSettings(!showSettings)}
          >
            {t('landing.cookie-banner.settings-toggle')}
            <ChevronUpDown isUp={showSettings} size={10} sx={{ ml: 2 }} />
          </Button>
          {showSettings && (
            <Grid sx={{ gridTemplateColumns: '16px 1fr', my: 3 }}>
              {COOKIE_NAMES.map((cookieName) => (
                <Fragment key={cookieName}>
                  <Checkbox
                    checked={selectedCookies[cookieName]}
                    onClick={() => toggleCookie(cookieName)}
                  />
                  <Grid sx={{ gap: 1 }}>
                    <Text variant="boldParagraph3">
                      {t(`landing.cookie-banner.cookies.${cookieName}.title`)}
                    </Text>
                    <Text variant="paragraph3" sx={{ color: 'neutral80' }}>
                      {t(`landing.cookie-banner.cookies.${cookieName}.description`)}
                    </Text>
                  </Grid>
                </Fragment>
              ))}
            </Grid>
          )}
          <Box sx={{ display: ['block', 'none'], pt: 3 }}>{ctaButtons}</Box>
        </Card>
      </Container>
    </Box>
  )
}
