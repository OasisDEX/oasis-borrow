import { Icon } from '@makerdao/dai-ui-icons'
import { ChevronUpDown } from 'components/ChevronUpDown'
import { AppLink } from 'components/Links'
import * as mixpanel from 'mixpanel-browser'
import React, { Fragment, MouseEventHandler, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { Box, Button, Card, Container, Flex, Grid, Text } from 'theme-ui'

const COOKIE_NAMES = ['marketing', 'analytics'] as const
const LOCALSTORAGE_KEY = 'cookieSettings'

type CookieName = typeof COOKIE_NAMES[number]

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
        borderColor: checked ? 'onSuccess' : 'lavender_o25',
        backgroundColor: checked ? 'success' : 'surface',
        width: '20px',
        height: '20px',
        borderRadius: '5px',
        cursor: 'pointer',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {checked && <Icon name="checkmark" color="onSuccess" size="auto" width="12px" />}
    </Flex>
  )
}

interface Switch {
  enable: Function
  disable: Function
}

const manageCookie: Record<CookieName, Switch> = {
  marketing: {
    // todo: implement these when we have adroll integration
    enable: () => {},
    disable: () => {},
  },
  analytics: {
    enable: () => mixpanel.opt_in_tracking(),
    disable: () => mixpanel.opt_out_tracking(),
    // todo: delete user data https://developer.mixpanel.com/docs/managing-personal-data
  },
}

type CookieSettings = Record<CookieName, boolean>
type SavedSettings = { accepted: boolean; cookieSettings: CookieSettings }

function initCookieSettings(defaultValue: boolean): CookieSettings {
  // @ts-ignore
  return COOKIE_NAMES.reduce((acc, cookieName) => ({ ...acc, [cookieName]: defaultValue }), {})
}

export function CookieBanner() {
  const { t } = useTranslation()
  const [showSettings, setShowSettings] = useState(false)
  const [cookieSettings, setCookieSettings] = useState(initCookieSettings(true))
  const [settingsAreSaved, setSettingsAreSaved] = useState(false)

  if (settingsAreSaved || localStorage.getItem(LOCALSTORAGE_KEY)) {
    return null
  }

  function toggleCookie(cookieName: CookieName) {
    const isEnabled = cookieSettings[cookieName]
    setCookieSettings({
      ...cookieSettings,
      [cookieName]: !isEnabled,
    })
    if (isEnabled) {
      manageCookie[cookieName].disable()
    } else {
      manageCookie[cookieName].enable()
    }
  }

  function saveSettings(settings: SavedSettings) {
    localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(settings))
    setSettingsAreSaved(true)
  }

  function rejectCookies() {
    COOKIE_NAMES.forEach((cookieName) => manageCookie[cookieName].disable())
    saveSettings({ accepted: false, cookieSettings: initCookieSettings(false) })
  }

  function acceptSelectedCookies() {
    COOKIE_NAMES.forEach((cookieName) => {
      if (cookieSettings[cookieName]) {
        manageCookie[cookieName].enable()
      } else {
        manageCookie[cookieName].disable()
      }
    })
    saveSettings({ accepted: true, cookieSettings })
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
      <Button variant="beanActive" sx={{ fontSize: 2 }} onClick={() => acceptSelectedCookies()}>
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
                  components={[
                    <AppLink href="/privacy" sx={{ fontSize: 2, fontWeight: 'body' }} />,
                  ]}
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
                    checked={cookieSettings[cookieName]}
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
