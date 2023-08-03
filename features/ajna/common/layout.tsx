import { isAppContextAvailable } from 'components/context/AppContextProvider'
import { WithFeatureToggleRedirect } from 'components/FeatureToggleRedirect'
import { Footer } from 'components/Footer'
import { PageSEOTags } from 'components/HeadTags'
import { WithAnnouncementLayout } from 'components/layouts/WithAnnouncementLayout'
import { AjnaNavigationController } from 'features/navigation/controls/AjnaNavigationController'
import React, { PropsWithChildren } from 'react'
import { ajnaExtensionTheme } from 'theme'
import { ThemeProvider } from 'theme-ui'
import { BackgroundLight } from 'theme/BackgroundLight'

interface AjnaLayoutProps {}

export function AjnaWrapper({ children }: PropsWithChildren<AjnaLayoutProps>) {
  return <WithFeatureToggleRedirect feature="Ajna">{children}</WithFeatureToggleRedirect>
}

export function AjnaLayout({ children }: PropsWithChildren<{}>) {
  if (!isAppContextAvailable()) return null

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
