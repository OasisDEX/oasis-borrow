import React from 'react'
import { Footer } from 'components/Footer'
import { WithAnnouncementLayout } from 'components/layouts/WithAnnouncementLayout'
import { ModalTrezorMetamaskEIP1559 } from 'components/Modal'
import { NavigationController } from 'features/navigation/controls/NavigationController'
import { WithChildren } from 'helpers/types'
import { BackgroundLight } from 'theme/BackgroundLight'

export function AppLayout({ children }: WithChildren) {
  return (
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
  )
}
