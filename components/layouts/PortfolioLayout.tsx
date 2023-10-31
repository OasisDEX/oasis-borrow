import { Footer } from 'components/Footer'
import { ModalTrezorMetamaskEIP1559 } from 'components/Modal'
import { NavigationController } from 'features/navigation/controls/NavigationController'
import type { WithChildren } from 'helpers/types/With.types'
import React from 'react'
import { BackgroundLight } from 'theme/BackgroundLight'

import { WithAnnouncementLayout } from './WithAnnouncementLayout'

export function PortfolioLayout({ children }: WithChildren) {
  return (
    <>
      <WithAnnouncementLayout
        sx={{ zIndex: 2, position: 'relative' }}
        showAnnouncement={false}
        footer={<Footer />}
        header={<NavigationController />}
        bg={<BackgroundLight />}
        variant="portfolio"
      >
        {children}
        <ModalTrezorMetamaskEIP1559 />
      </WithAnnouncementLayout>
    </>
  )
}
