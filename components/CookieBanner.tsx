import { Icon } from '@makerdao/dai-ui-icons'
import { ChevronUpDown } from 'components/ChevronUpDown'
import { AppLink } from 'components/Links'
import { currentContent } from 'features/content'
import { Trans, useTranslation } from 'next-i18next'
import React, { Fragment, MouseEventHandler, useState } from 'react'
import { Box, Button, Card, Container, Flex, Grid, Text } from 'theme-ui'

import { COOKIE_NAMES, CookieName, manageCookie } from '../analytics/common'

function Checkbox({
  checked,
  onClick,
}: {
  checked: boolean
  onClick: MouseEventHandler<HTMLDivElement>
}) {
  return (
    <Flex
      onClick={onClick}
      sx={{
        border: '1px solid',
        borderColor: checked ? 'success100' : 'lavender_o25',
        backgroundColor: checked ? 'success10' : 'neutral10',
        width: '20px',
        height: '20px',
        borderRadius: '5px',
        cursor: 'pointer',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {checked && <Icon name="checkmark" color="success100" size="auto" width="12px" />}
    </Flex>
  )
}

type SelectedCookies = Record<CookieName, boolean>

export type SavedSettings = { accepted: boolean; enabledCookies: SelectedCookies; version: string }
export function initSelectedCookies(defaultValue: boolean): SelectedCookies {
  return COOKIE_NAMES.reduce((acc, cookieName) => ({ ...acc, [cookieName]: defaultValue }), {})
}

interface CookieBannerProps {
  value: SavedSettings
  setValue: (data: SavedSettings) => void
}

export function CookieBanner({ value, setValue }: CookieBannerProps) {
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
            sx={{ fontWeight: 'body', pl: 0 }}
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
                    <Text variant="paragraph3">
                      {t(`landing.cookie-banner.cookies.${cookieName}.title`)}
                    </Text>
                    <Text variant="subheader" sx={{ fontSize: 2 }}>
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
