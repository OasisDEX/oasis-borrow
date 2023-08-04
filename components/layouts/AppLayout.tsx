import { Footer } from 'components/Footer'
import { ModalTrezorMetamaskEIP1559 } from 'components/Modal'
import { NavigationController } from 'features/navigation/controls/NavigationController'
import { WithChildren } from 'helpers/types'
import React from 'react'
import { BackgroundLight } from 'theme/BackgroundLight'

import { WithAnnouncementLayout } from './WithAnnouncementLayout'

export function AppLayout({ children }: WithChildren) {
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
