// @ts-ignore
import { Icon } from '@makerdao/dai-ui-icons'
import { AppLink, AppLinkProps } from 'components/Links'
import { AccountButton } from 'features/account/Account'
import { WithChildren } from 'helpers/types'
import { useTranslation } from 'i18n'
import React from 'react'
import { TRANSITIONS } from 'theme'
import { Box, Container, Text } from 'theme-ui'

function Logo() {
  return (
    <AppLink
      withAccountPrefix={false}
      href="/"
      sx={{ color: 'primary', fontWeight: 'semiBold', fontSize: 5, cursor: 'pointer' }}
    >
      <Text sx={{ display: 'inline', mr: 2 }}>Oasis</Text>
      <Text sx={{ display: 'inline', fontSize: 1, textTransform: 'uppercase', fontWeight: 500 }}>
        Borrow
      </Text>
    </AppLink>
  )
}

export function BasicHeader({ variant, children }: { variant?: string } & WithChildren) {
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
  return (
    <BasicHeader variant="appContainer">
      <>
        <Logo />
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
