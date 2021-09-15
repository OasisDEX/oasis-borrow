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

import { GenericAnnouncement } from './Announcement'

interface BasicLayoutProps extends WithChildren {
  header: JSX.Element
  footer?: JSX.Element
  sx?: SxStyleProp
  variant?: string
}

interface WithAnnouncementLayoutProps extends BasicLayoutProps {
  showAnnouncement: boolean
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

export function WithAnnouncementLayout({
  header,
  footer,
  children,
  showAnnouncement,
  sx,
  variant,
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
      {header}
      {showAnnouncement && (
        <Container variant="announcement">
          <GenericAnnouncement
            text="This is test banner, followed by a very long text.followed by a very long text.followed by a very long text.followed by a very long text.followed by a very long text.followed by a very long text.followed by a very long text.followed by a very long text.followed by a very long text.followed by a very long text.followed by a very long text.followed by a very long text.followed by a very long text.followed by a very long text.followed by a very long text.followed by a very long text.followed by a very long text.followed by a very long text.followed by a very long text.followed by a very long text.followed by a very long text.followed by a very long text."
            discordLink="https://discord.gg/Kc2bBB59GC"
            link=""
            linkText=""
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
        sx={{ zIndex: 2 }}
        showAnnouncement={true}
        footer={<Footer />}
        header={<AppHeader />}
      >
        {children}
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
      {marketingBackgrounds['default']}
      <WithAnnouncementLayout
        header={<AppHeader />}
        footer={<Footer />}
        showAnnouncement={true}
        variant="landingContainer"
        sx={{ position: 'relative' }}
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
      {marketingBackgrounds[topBackground]}
      <BasicLayout
        header={<AppHeader />}
        footer={<Footer />}
        variant={variant || 'marketingContainer'}
        sx={{ position: 'relative' }}
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
