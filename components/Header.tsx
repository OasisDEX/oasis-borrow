// @ts-ignore
import { Icon } from '@makerdao/dai-ui-icons'
import { AccountButton } from 'components/account/Account'
import { useAppContext } from 'components/AppContextProvider'
import { AppLink, AppLinkProps } from 'components/Links'
import { useObservable } from 'helpers/observableHook'
import { WithChildren } from 'helpers/types'
import { useTranslation } from 'i18n'
import React from 'react'
import { TRANSITIONS } from 'theme'
import { Box, Container } from 'theme-ui'

function Logo() {
  return (
    <AppLink
      withAccountPrefix={false}
      href="/"
      sx={{ color: 'primary', fontWeight: 'semiBold', fontSize: 5 }}
    >
      Oasis
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

export function AppHeader({
  backLink,
  CustomLogoWithBack,
}: {
  backLink?: AppLinkProps
  CustomLogoWithBack?: () => JSX.Element
}) {
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

export function ConnectPageHeader({ backLink }: { backLink: AppLinkProps }) {
  return (
    <BasicHeader>
      <AppLink {...backLink}>
        <BackArrow />
      </AppLink>
    </BasicHeader>
  )
}
