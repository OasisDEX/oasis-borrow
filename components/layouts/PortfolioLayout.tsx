import { Footer } from 'components/Footer'
import { WithAnnouncementLayout } from 'components/layouts/WithAnnouncementLayout'
import { ModalTrezorMetamaskEIP1559 } from 'components/Modal'
import { NavigationController } from 'features/navigation/controls/NavigationController'
import type { PropsWithChildren } from 'react'
import React from 'react'
import { BackgroundLight } from 'theme/BackgroundLight'

export function PortfolioLayout({ children }: PropsWithChildren<{}>) {
  return (
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
  )
}
