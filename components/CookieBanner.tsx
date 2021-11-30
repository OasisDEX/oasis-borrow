import { Icon } from '@makerdao/dai-ui-icons'
import { ChevronUpDown } from 'components/ChevronUpDown'
import { AppLink } from 'components/Links'
import * as mixpanel from 'mixpanel-browser'
import React, { Fragment, MouseEventHandler, useEffect, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { Box, Button, Card, Container, Flex, Grid, Text } from 'theme-ui'

import { adRollScriptInsert } from '../marketing/adroll'

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
    enable: () => adRollScriptInsert(),
    disable: () => {}, // no needed since adding adRoll instance to app is 0/1 like
  },
  analytics: {
    enable: () => mixpanel.opt_in_tracking(),
    disable: () => mixpanel.opt_out_tracking(),
    // todo: delete user data https://developer.mixpanel.com/docs/managing-personal-data
  },
}

type SelectedCookies = Record<CookieName, boolean>
type SavedSettings = { accepted: boolean; enabledCookies: SelectedCookies }

function initSelectedCookies(defaultValue: boolean): SelectedCookies {
  // @ts-ignore
  return COOKIE_NAMES.reduce((acc, cookieName) => ({ ...acc, [cookieName]: defaultValue }), {})
}

export function CookieBanner() {
  const { t } = useTranslation()
  const [showSettings, setShowSettings] = useState(false)
  const [selectedCookies, setSelectedCookies] = useState(initSelectedCookies(true))
  const [settingsAreSaved, setSettingsAreSaved] = useState(false)

  const trackingLocalState = localStorage.getItem(LOCALSTORAGE_KEY)

  function initTrackers() {
    if (trackingLocalState) {
      const state = JSON.parse(trackingLocalState).enabledCookies

      COOKIE_NAMES.forEach((cookieName) => {
        if (state[cookieName]) {
          manageCookie[cookieName].enable()
        } else {
          manageCookie[cookieName].disable()
        }
      })
    }
  }

  useEffect(() => {
    initTrackers()
  }, [])

  if (settingsAreSaved || trackingLocalState) {
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
    localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(settings))
    setSettingsAreSaved(true)
  }

  function rejectCookies() {
    COOKIE_NAMES.forEach((cookieName) => manageCookie[cookieName].disable())
    saveSettings({ accepted: false, enabledCookies: initSelectedCookies(false) })
  }

  function acceptSelectedCookies() {
    COOKIE_NAMES.forEach((cookieName) => {
      if (selectedCookies[cookieName]) {
        manageCookie[cookieName].enable()
      } else {
        manageCookie[cookieName].disable()
      }
    })
    saveSettings({ accepted: true, enabledCookies: selectedCookies })
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
