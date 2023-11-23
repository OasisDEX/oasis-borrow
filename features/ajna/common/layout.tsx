import { Footer } from 'components/Footer'
import { PageSEOTags } from 'components/HeadTags'
import { WithAnnouncementLayout } from 'components/layouts/WithAnnouncementLayout'
import { NavigationController } from 'features/navigation/controls/NavigationController'
import type { PropsWithChildren } from 'react'
import React from 'react'
import { ajnaExtensionTheme } from 'theme'
import { BackgroundLight } from 'theme/BackgroundLight'
import { ThemeUIProvider } from 'theme-ui'

export function AjnaLayout({ children }: PropsWithChildren<{}>) {
  return (
    <ThemeUIProvider theme={ajnaExtensionTheme}>
      <WithAnnouncementLayout
        sx={{ zIndex: 2, position: 'relative' }}
        showAnnouncement={false}
        footer={<Footer />}
        header={<NavigationController />}
        bg={<BackgroundLight />}
      >
        {children}
      </WithAnnouncementLayout>
    </ThemeUIProvider>
  )
}

export const ajnaPageSeoTags = (
  <PageSEOTags title="seo.ajna.title" description="seo.ajna.description" url="/ajna" />
)
