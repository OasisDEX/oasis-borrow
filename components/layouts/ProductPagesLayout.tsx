import React from 'react'
import { Footer } from 'components/Footer'
import { WithAnnouncementLayout } from 'components/layouts/WithAnnouncementLayout'
import { NavigationController } from 'features/navigation/controls/NavigationController'
import { WithChildren } from 'helpers/types'
import { BackgroundLight } from 'theme/BackgroundLight'

export function ProductPagesLayout({ children }: WithChildren) {
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
