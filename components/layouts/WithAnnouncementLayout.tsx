import React, { Ref } from 'react'
import { Announcement } from 'components/Announcement'
import { BasicLayoutProps } from 'components/layouts/BasicLayout'
import { EXTERNAL_LINKS } from 'helpers/applicationLinks'
import { useCoolMode } from 'helpers/sweet/useCoolMode'
import { Background } from 'theme/Background'
import { Container, Flex } from 'theme-ui'

interface WithAnnouncementLayoutProps extends BasicLayoutProps {
  showAnnouncement: boolean
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
