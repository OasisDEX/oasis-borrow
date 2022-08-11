import { isAppContextAvailable } from 'components/AppContextProvider'
import { Footer } from 'components/Footer'
import { AppHeader, ConnectPageHeader } from 'components/Header'
import { AppLinkProps } from 'components/Links'
import { WithChildren } from 'helpers/types'
import React from 'react'
import { Container, Flex, SxStyleProp } from 'theme-ui'
import { Background } from 'theme/Background'
import { BackgroundLight } from 'theme/BackgroundLight'
import { BackgroundLighter } from 'theme/BackgroundLighter'

import { ProductBackground } from '../theme/ProductBackground'
import { Announcement } from './Announcement'
import { ModalTrezorMetamaskEIP1559 } from './Modal'

interface BasicLayoutProps extends WithChildren {
  header: JSX.Element
  footer?: JSX.Element
  sx?: SxStyleProp
  variant?: string
  bg: JSX.Element | null
}

interface WithAnnouncementLayoutProps extends BasicLayoutProps {
  showAnnouncement: boolean
}

export function BasicLayout({ header, footer, children, sx, variant, bg }: BasicLayoutProps) {
  return (
    <Flex
      sx={{
        bg: 'none',
        flexDirection: 'column',
        minHeight: '100%',
        ...sx,
      }}
    >
      {bg}
      {header}
      <Container variant={variant || 'appContainer'} sx={{ flex: 2, mb: 5 }} as="main">
        <Flex sx={{ width: '100%', height: '100%' }}>{children}</Flex>
      </Container>
      {footer}
    </Flex>
  )
}

export function WithAnnouncementLayout({
  header,
  footer,
  children,
  showAnnouncement,
  sx,
  variant,
  bg,
}: WithAnnouncementLayoutProps) {
  return (
    <Flex
      sx={{
        bg: 'none',
        flexDirection: 'column',
        minHeight: '100%',
        ...sx,
      }}
    >
      {bg}
      {header}
      {showAnnouncement && (
        <Container variant="announcement">
          <Announcement
            text="Welcome to the new Oasis.app. We are thrilled to have you here."
            discordLink="https://discord.gg/oasisapp"
            link="https://blog.ethereum.org/2015/11/15/merkling-in-ethereum/"
            linkText="Check blog post"
          />
        </Container>
      )}
      <Container variant={variant || 'appContainer'} sx={{ flex: 2, mb: 5 }} as="main">
        <Flex sx={{ width: '100%', height: '100%' }}>{children}</Flex>
      </Container>
      {footer}
    </Flex>
  )
}

export function AppLayout({ children }: WithChildren) {
  if (!isAppContextAvailable()) {
    return null
  }

  return (
    <>
      <WithAnnouncementLayout
        sx={{ zIndex: 2, position: 'relative' }}
        showAnnouncement={false}
        footer={<Footer />}
        header={<AppHeader />}
        bg={<BackgroundLight />}
      >
        {children}
        <ModalTrezorMetamaskEIP1559 />
      </WithAnnouncementLayout>
    </>
  )
}

const marketingBackgrounds = {
  default: <Background />,
  light: <BackgroundLight />,
  lighter: <BackgroundLighter />,
  none: null,
}

export function LandingPageLayout({ children }: WithChildren) {
  if (!isAppContextAvailable()) {
    return null
  }

  return (
    <>
      <WithAnnouncementLayout
        header={<AppHeader />}
        footer={<Footer />}
        showAnnouncement={false}
        variant="landingContainer"
        sx={{ position: 'relative' }}
        bg={marketingBackgrounds['default']}
      >
        {children}
      </WithAnnouncementLayout>
    </>
  )
}

export function ProductPagesLayout({ children }: WithChildren) {
  if (!isAppContextAvailable()) {
    return null
  }

  return (
    <>
      <WithAnnouncementLayout
        header={<AppHeader />}
        footer={<Footer />}
        showAnnouncement={false}
        variant="landingContainer"
        sx={{ position: 'relative' }}
        bg={<ProductBackground />}
      >
        {children}
      </WithAnnouncementLayout>
    </>
  )
}

export interface MarketingLayoutProps extends WithChildren {
  variant?: string
  topBackground?: keyof typeof marketingBackgrounds
}

export function MarketingLayout({
  children,
  variant,
  topBackground = 'default',
}: MarketingLayoutProps) {
  if (!isAppContextAvailable()) {
    return null
  }

  return (
    <>
      <BasicLayout
        header={<AppHeader />}
        footer={<Footer />}
        variant={variant || 'marketingContainer'}
        sx={{ position: 'relative' }}
        bg={marketingBackgrounds[topBackground]}
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
  return (
    <BasicLayout header={<ConnectPageHeader />} bg={null}>
      {children}
    </BasicLayout>
  )
}
