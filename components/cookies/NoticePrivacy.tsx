// @ts-ignore
import { Icon } from '@makerdao/dai-ui-icons'
import { useAppContext } from 'components/AppContextProvider'
import { AppLink } from 'components/Links'
import { useObservable } from 'helpers/observableHook'
import { Trans } from 'i18n'
import React, { ReactNode } from 'react'
import { TRANSITIONS } from 'theme'
import { Card, Flex, IconButton, Text } from 'theme-ui'

import { COOKIE_PRIVACY } from './cookies'

export function NoticeBase({
  acceptCookie,
  message,
}: {
  acceptCookie: () => void
  message: ReactNode
}) {
  return (
    <Flex
      sx={{
        position: 'fixed',
        bottom: 4,
        justifyContent: 'center',
        px: [2, null, 4],
        zIndex: 'cookie',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        mx: 'auto',
      }}
    >
      <Card
        sx={{
          boxShadow: 'cookie',
          borderRadius: 'round',
          py: 2,
          px: 3,
        }}
      >
        <Flex sx={{ alignItems: 'center', py: 1, justifyContent: 'space-between' }}>
          <Text sx={{ fontSize: 2, mr: [1, 3], ml: [1, 2] }}>{message}</Text>
          <IconButton
            onClick={() => acceptCookie()}
            sx={{
              width: [null, 'auto'],
              height: 'auto',
              cursor: 'pointer',
              minWidth: 3,
              color: 'onSurface',
              transition: TRANSITIONS.global,
              '&:hover': {
                color: 'primary',
              },
            }}
          >
            <Icon size="16px" name="close_cookie" />
          </IconButton>
        </Flex>
      </Card>
    </Flex>
  )
}

export function NoticePrivacy() {
  const { cookies$ } = useAppContext()
  const cookies = useObservable(cookies$)

  const acceptCookie = () => {
    cookies?.saveCookie(COOKIE_PRIVACY)
  }

  return cookies && !cookies.cookies.cookiePrivacy ? (
    <NoticeBase
      {...{
        acceptCookie,
        message: (
          <Trans
            i18nKey="notice-privacy"
            components={[
              <AppLink
                href="/privacy"
                withAccountPrefix={false}
                internalInNewTab
                sx={{
                  display: 'inline-block',
                  color: 'primary',
                  textDecoration: 'underline',
                }}
              />,
            ]}
          />
        ),
      }}
    />
  ) : null
}
