import { isAppContextAvailable } from 'components/AppContextProvider'
import { WithFeatureToggleRedirect } from 'components/FeatureToggleRedirect'
import { Footer } from 'components/Footer'
import { PageSEOTags } from 'components/HeadTags'
import { BasicLayout } from 'components/Layouts'
import { AjnaNavigationController } from 'features/ajna/controls/AjnaNavigationController'
import React, { PropsWithChildren } from 'react'
import { ajnaExtensionTheme } from 'theme'
import { ThemeProvider } from 'theme-ui'
import { Background } from 'theme/Background'

interface AjnaLayoutProps {}

export function AjnaWrapper({ children }: PropsWithChildren<AjnaLayoutProps>) {
  return <WithFeatureToggleRedirect feature="Ajna">{children}</WithFeatureToggleRedirect>
}

export function AjnaLayout({ children }: PropsWithChildren<{}>) {
  if (!isAppContextAvailable()) return null

  return (
    <ThemeProvider theme={ajnaExtensionTheme}>
      <BasicLayout
        header={<AjnaNavigationController />}
        footer={<Footer />}
        sx={{ position: 'relative' }}
        bg={<Background isAjnaPage />}
      >
        {children}
      </BasicLayout>
    </ThemeProvider>
  )
}

export const ajnaPageSeoTags = (
  <PageSEOTags title="seo.ajna.title" description="seo.ajna.description" url="/ajna" />
)
