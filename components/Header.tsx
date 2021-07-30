// @ts-ignore
import { Icon } from '@makerdao/dai-ui-icons'
import { trackingEvents } from 'analytics/analytics'
import { AppLink } from 'components/Links'
import { AccountButton } from 'features/account/Account'
import { useObservable } from 'helpers/observableHook'
import { staticFilesRuntimeUrl } from 'helpers/staticPaths'
import { WithChildren } from 'helpers/types'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { TRANSITIONS } from 'theme'
import { Box, Container, Flex, Image, SxStyleProp } from 'theme-ui'

import { useAppContext } from './AppContextProvider'

export function Logo({ sx }: { sx?: SxStyleProp }) {
  return (
    <AppLink
      withAccountPrefix={false}
      href="/"
      sx={{
        color: 'primary',
        fontWeight: 'semiBold',
        fontSize: '0px',
        cursor: 'pointer',
        zIndex: 1,
        ...sx,
      }}
    >
      <Image src={staticFilesRuntimeUrl('/static/img/logo.svg')} />
    </AppLink>
  )
}

export function BasicHeader({
  variant,
  children,
  sx,
}: { variant?: string; sx?: SxStyleProp } & WithChildren) {
  return (
    <Box as="header" sx={{ position: 'relative', zIndex: 'menu' }}>
      <Container
        variant={variant}
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mt: 2,
          p: 3,
          mb: 3,
          minHeight: '83px',
          ...sx,
        }}
      >
        {children}
      </Container>
    </Box>
  )
}

export function BackArrow() {
  return (
    <Box
      sx={{
        cursor: 'pointer',
        color: 'onBackground',
        fontSize: '0',
        transition: TRANSITIONS.global,
        '&:hover': {
          color: 'onSurface',
        },
      }}
    >
      <Icon name="arrow_left" size="auto" width="32" height="47" />
    </Box>
  )
}

export function AppHeader() {
  const { accountData$, context$ } = useAppContext()
  const { t } = useTranslation()
  const accountData = useObservable(accountData$)
  const context = useObservable(context$)

  const numberOfVaults =
    accountData?.numberOfVaults !== undefined ? accountData.numberOfVaults : undefined
  const firstCDP = numberOfVaults ? numberOfVaults === 0 : undefined

  return (
    <BasicHeader
      sx={{
        position: 'relative',
        alignItems: 'center',
        zIndex: 1,
      }}
      variant="appContainer"
    >
      <>
        <Logo />
        {context?.status === 'connected' && (
          <Flex sx={{ alignItems: 'center', ml: 'auto', zIndex: 1 }}>
            <AppLink
              variant="nav"
              sx={{ mr: 4 }}
              href={`/owner/${context.account}`}
              onClick={() => trackingEvents.yourVaults()}
            >
              {t('your-vaults')} {numberOfVaults ? numberOfVaults > 0 && `(${numberOfVaults})` : ''}
            </AppLink>
            <AppLink
              variant="nav"
              sx={{ mr: [0, 4] }}
              href="/vaults/list"
              onClick={() => trackingEvents.createNewVault(firstCDP)}
            >
              <Box sx={{ display: ['none', 'block'] }}>{t('open-new-vault')}</Box>
              <Box sx={{ display: ['block', 'none'], fontSize: '0px' }}>
                <Icon name="plus_header" size="auto" width="18px" height="18px" />
              </Box>
            </AppLink>
          </Flex>
        )}
        <AccountButton />
      </>
    </BasicHeader>
  )
}

export function ConnectPageHeader() {
  return (
    <BasicHeader>
      <Logo />
    </BasicHeader>
  )
}
