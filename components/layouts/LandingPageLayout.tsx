import React from 'react'
import { Footer } from 'components/Footer'
import { WithAnnouncementLandingLayout } from 'components/layouts/WithAnnouncementLayout'
import { HomepageHero } from 'features/homepage/HomepageHero'
import { NavigationController } from 'features/navigation/controls/NavigationController'
import { WithChildren } from 'helpers/types'

export function LandingPageLayout({ children }: WithChildren) {
  return (
    <WithAnnouncementLandingLayout
      header={
        <>
          <NavigationController />
          <HomepageHero />
        </>
      }
      footer={<Footer />}
      showAnnouncement={false}
      variant="landingContainer"
      sx={{ position: 'relative', zIndex: 1 }}
    >
      {children}
    </WithAnnouncementLandingLayout>
  )
}
