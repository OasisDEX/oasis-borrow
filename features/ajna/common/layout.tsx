import React, { PropsWithChildren } from 'react'
import { Footer } from 'components/Footer'
import { PageSEOTags } from 'components/HeadTags'
import { WithAnnouncementLayout } from 'components/layouts'
import { AjnaNavigationController } from 'features/navigation/controls/AjnaNavigationController'
import { ajnaExtensionTheme } from 'theme'
import { BackgroundLight } from 'theme/BackgroundLight'
import { ThemeProvider } from 'theme-ui'

export function AjnaLayout({ children }: PropsWithChildren<{}>) {
  return (
    <ThemeProvider theme={ajnaExtensionTheme}>
      <WithAnnouncementLayout
        sx={{ zIndex: 2, position: 'relative' }}
        showAnnouncement={false}
        footer={<Footer />}
        header={<AjnaNavigationController />}
        bg={<BackgroundLight />}
      >
        {children}
      </WithAnnouncementLayout>
    </ThemeProvider>
  )
}

export const ajnaPageSeoTags = (
  <PageSEOTags title="seo.ajna.title" description="seo.ajna.description" url="/ajna" />
)
