import { Footer } from 'components/Footer'
import { NavigationControllerDynamic } from 'features/navigation/controls/NavigationControllerDynamic'
import { WithChildren } from 'helpers/types'
import React from 'react'
import { BackgroundLight } from 'theme/BackgroundLight'

import { WithAnnouncementLayout } from './WithAnnouncementLayout'

export function ProductPagesLayout({ children }: WithChildren) {
  return (
    <>
      <WithAnnouncementLayout
        header={<NavigationControllerDynamic />}
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
