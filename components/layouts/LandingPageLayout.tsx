import { Footer } from 'components/Footer'
import { HomepageHero } from 'features/homepage/HomepageHero'
import { NavigationController } from 'features/navigation/controls/NavigationController'
import type { WithChildren } from 'helpers/types/With.types'
import React from 'react'

import { WithAnnouncementLandingLayout } from './WithAnnouncementLayout'

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
