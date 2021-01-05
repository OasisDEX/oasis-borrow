import { useAppContext } from 'components/AppContextProvider'
import { useObservable } from 'helpers/observableHook'
import { useTranslation } from 'i18n'
import React, { useEffect, useState } from 'react'
import { Text } from 'theme-ui'

import { COOKIE_APP_HOMESCREEN } from './cookies'
import { NoticeBase } from './NoticePrivacy'

export function NoticeAppHomescreen() {
  const [appPrompt, setAppPrompt] = useState<Event | undefined>(undefined)
  const { cookies$ } = useAppContext()
  const cookies = useObservable(cookies$)
  const { t } = useTranslation()

  useEffect(() => {
    // Stash the event so it can be triggered later.
    function catchDefaultInstallEvent(e: Event) {
      if (
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      ) {
        e.preventDefault()
        setAppPrompt(e)
      }
    }

    console.log('run effect')

    window.addEventListener('beforeinstallprompt', catchDefaultInstallEvent)

    return () => window.removeEventListener('beforeinstallprompt', catchDefaultInstallEvent)
  }, [])

  function addToHomescreen() {
    // @ts-ignore
    appPrompt?.prompt()
  }

  const acceptCookie = () => {
    cookies?.saveCookie(COOKIE_APP_HOMESCREEN)
  }

  return appPrompt &&
    cookies &&
    cookies.cookies.cookiePrivacy &&
    !cookies.cookies.cookieAppHomescreen ? (
    <NoticeBase
      {...{
        acceptCookie,
        message: (
          <Text onClick={addToHomescreen} sx={{ textDecoration: 'underline', cursor: 'pointer' }}>
            {t('notice-app-homescreen')}
          </Text>
        ),
      }}
    />
  ) : null
}
