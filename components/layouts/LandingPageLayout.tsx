import { accountContext, AccountContextProvider } from 'components/context/AccountContextProvider'
import { DeferedContextProvider } from 'components/context/DeferedContextProvider'
import { Footer } from 'components/Footer'
import { HomepageHero } from 'features/homepage/HomepageHero'
import { NavigationControllerDynamic } from 'features/navigation/controls/NavigationControllerDynamic'
import { WithChildren } from 'helpers/types'
import React from 'react'

import { WithAnnouncementLandingLayout } from './WithAnnouncementLayout'

export function LandingPageLayout({ children }: WithChildren) {
  return (
    <AccountContextProvider>
      <DeferedContextProvider context={accountContext}>
        <WithAnnouncementLandingLayout
          header={
            <>
              <NavigationControllerDynamic /> <HomepageHero />
            </>
          }
          footer={<Footer />}
          showAnnouncement={false}
          variant="landingContainer"
          sx={{ position: 'relative', zIndex: 1 }}
        >
          {children}
        </WithAnnouncementLandingLayout>
      </DeferedContextProvider>
    </AccountContextProvider>
  )
}
