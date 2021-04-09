import { isAppContextAvailable } from 'components/AppContextProvider'
import { Footer } from 'components/Footer'
import { AppHeader, ConnectPageHeader, MarketingHeader } from 'components/Header'
import { AppLinkProps } from 'components/Links'
import { Background } from 'features/landing/Background'
import { WithChildren } from 'helpers/types'
import React from 'react'
import { Container, Flex, SxStyleProp } from 'theme-ui'

interface BasicLayoutProps extends WithChildren {
  header: JSX.Element
  footer?: JSX.Element
  sx?: SxStyleProp
  variant?: string
}

export interface AppLayoutProps extends WithChildren {
  backLink?: AppLinkProps
  CustomLogoWithBack?: () => JSX.Element
}

export interface MarketingLayoutProps extends WithChildren {
  variant?: string
}

export function BasicLayout({ header, footer, children, sx, variant }: BasicLayoutProps) {
  return (
    <Flex
      sx={{
        bg: 'none',
        flexDirection: 'column',
        minHeight: '100%',
        ...sx,
      }}
    >
      {header}
      <Container variant={variant || 'appContainer'} sx={{ flex: 2, mb: 5 }} as="main">
        <Flex sx={{ width: '100%', height: '100%' }}>{children}</Flex>
      </Container>
      {footer}
    </Flex>
  )
}

export function AppLayout({ children, backLink, CustomLogoWithBack }: AppLayoutProps) {
  if (!isAppContextAvailable()) {
    return null
  }

  return (
    <BasicLayout footer={<Footer />} header={<AppHeader {...{ backLink, CustomLogoWithBack }} />}>
      {children}
    </BasicLayout>
  )
}

export function MarketingLayout({ children, variant }: MarketingLayoutProps) {
  if (!isAppContextAvailable()) {
    return null
  }

  return (
    <>
      <Background />
      <BasicLayout
        header={<MarketingHeader />}
        footer={<Footer />}
        variant={variant || 'marketingContainer'}
      >
        {children}
      </BasicLayout>
    </>
  )
}

export function ConnectPageLayout({ children }: WithChildren & { backLink: AppLinkProps }) {
  if (!isAppContextAvailable()) {
    return null
  }
  return <BasicLayout header={<ConnectPageHeader />}>{children}</BasicLayout>
}
