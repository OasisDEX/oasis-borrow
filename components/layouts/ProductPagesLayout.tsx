import { Footer } from 'components/Footer'
import { NavigationController } from 'features/navigation/controls/NavigationController'
import type { PropsWithChildren } from 'react'
import React from 'react'
import { BackgroundLight } from 'theme/BackgroundLight'

import { WithAnnouncementLayout } from './WithAnnouncementLayout'

export function ProductPagesLayout({ children }: PropsWithChildren<{}>) {
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
