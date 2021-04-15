// @ts-ignore
import { Icon } from '@makerdao/dai-ui-icons'
import { AppLink, AppLinkProps } from 'components/Links'
import { AccountButton } from 'features/account/Account'
import { useObservable } from 'helpers/observableHook'
import { WithChildren } from 'helpers/types'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { TRANSITIONS } from 'theme'
import { Box, Container, Flex, SxStyleProp, Text } from 'theme-ui'

import { useAppContext } from './AppContextProvider'

function Logo({ sx }: { sx?: SxStyleProp }) {
  return (
    <AppLink
      withAccountPrefix={false}
      href="/"
      sx={{
        color: 'primary',
        fontWeight: 'semiBold',
        fontSize: 5,
        cursor: 'pointer',
        zIndex: 1,
        ...sx,
      }}
    >
      <Text sx={{ display: 'inline', mr: 2 }}>Oasis</Text>
    </AppLink>
  )
}

export function BasicHeader({
  variant,
  children,
  sx,
}: { variant?: string; sx?: SxStyleProp } & WithChildren) {
  return (
    <Box as="header">
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

export function AppHeader(_: { backLink?: AppLinkProps; CustomLogoWithBack?: () => JSX.Element }) {
  const { accountData$, context$ } = useAppContext()
  const { t } = useTranslation()
  const accountData = useObservable(accountData$)
  const context = useObservable(context$)

  return (
    <BasicHeader
      sx={{
        position: 'relative',
        flexDirection: ['column-reverse', 'row', 'row'],
        alignItems: ['flex-end', 'center', 'center'],
        zIndex: 1,
      }}
      variant="appContainer"
    >
      <>
        <Logo sx={{ position: ['absolute', 'static', 'static'], left: 3, top: 3 }} />
        {context?.status === 'connected' && (
          <Flex sx={{ ml: 'auto', zIndex: 1, mt: [3, 0, 0] }}>
            <AppLink variant="nav" sx={{ mr: 4 }} href={`/owner/${context.account}`}>
              {t('your-vaults')}{' '}
              {accountData?.numberOfVaults !== undefined && `(${accountData.numberOfVaults})`}
            </AppLink>
            <AppLink variant="nav" sx={{ mr: [0, 4, 4] }} href="/vaults/list">
              {t('open-new-vault')}
            </AppLink>
          </Flex>
        )}
        <AccountButton />
      </>
    </BasicHeader>
  )
}

export function MarketingHeader() {
  const { t } = useTranslation()

  return (
    <BasicHeader variant="landingContainer">
      <Logo />
      <AppLink href="/connect" variant="nav">
        {t('connect-wallet-button')}
      </AppLink>
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
