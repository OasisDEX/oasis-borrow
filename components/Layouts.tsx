import { isAppContextAvailable } from 'components/AppContextProvider'
import { Footer } from 'components/Footer'
import { HomepageHero } from 'features/homepage/HomepageHero'
import { NavigationController } from 'features/navigation/controls/NavigationController'
import { EXTERNAL_LINKS } from 'helpers/applicationLinks'
import { useCoolMode } from 'helpers/sweet/useCoolMode'
import { WithChildren } from 'helpers/types'
import React, { Ref } from 'react'
import { Container, Flex, SxStyleProp } from 'theme-ui'
import { Background } from 'theme/Background'
import { BackgroundLight } from 'theme/BackgroundLight'

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
  const ref = useCoolMode()
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
      <Container
        variant={variant || 'appContainer'}
        sx={{ flex: 2, mb: 5 }}
        as="main"
        ref={ref as Ref<HTMLDivElement>}
      >
        <Flex sx={{ width: '100%', height: '100%' }}>{children}</Flex>
      </Container>
      {footer}
    </Flex>
  )
}

export function WithAnnouncementLandingLayout({
  header,
  footer,
  children,
  showAnnouncement,
  sx,
  variant,
}: Omit<WithAnnouncementLayoutProps, 'bg'>) {
  const ref = useCoolMode()

  return (
    <Flex
      sx={{
        bg: 'none',
        flexDirection: 'column',
        minHeight: '100%',
        ...sx,
      }}
      ref={ref as Ref<HTMLDivElement>}
    >
      <Background wrapper>{header}</Background>
      {showAnnouncement && (
        <Container variant="announcement">
          <Announcement
            text="Welcome to the new Summer.fi. We are thrilled to have you here."
            discordLink={EXTERNAL_LINKS.DISCORD}
            link={EXTERNAL_LINKS.ETHEREUM_ORG_MERKLING}
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

export function WithAnnouncementLayout({
  header,
  footer,
  children,
  showAnnouncement,
  sx,
  variant,
  bg,
}: WithAnnouncementLayoutProps) {
  const ref = useCoolMode()

  return (
    <Flex
      sx={{
        bg: 'none',
        flexDirection: 'column',
        minHeight: '100%',
        ...sx,
      }}
      ref={ref as Ref<HTMLDivElement>}
    >
      {bg}
      {header}
      {showAnnouncement && (
        <Container variant="announcement">
          <Announcement
            text="Welcome to the new Summer.fi. We are thrilled to have you here."
            discordLink={EXTERNAL_LINKS.DISCORD}
            link={EXTERNAL_LINKS.ETHEREUM_ORG_MERKLING}
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
        header={<NavigationController />}
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
  lighter: <BackgroundLight />,
  none: null,
}

export function LandingPageLayout({ children }: WithChildren) {
  if (!isAppContextAvailable()) {
    return null
  }

  return (
    <>
      <WithAnnouncementLandingLayout
        header={
          <>
            <NavigationController /> <HomepageHero />
          </>
        }
        footer={<Footer />}
        showAnnouncement={false}
        variant="landingContainer"
        sx={{ position: 'relative', zIndex: 1 }}
      >
        {children}
      </WithAnnouncementLandingLayout>
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
        header={<NavigationController />}
        footer={<Footer />}
        showAnnouncement={false}
        variant="landingContainer"
        sx={{ position: 'relative' }}
        bg={<BackgroundLight />}
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
        header={<NavigationController />}
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
