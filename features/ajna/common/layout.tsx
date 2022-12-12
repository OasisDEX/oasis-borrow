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

interface AjnaLayoutProps {
  bg?: JSX.Element
}

export function AjnaWrapper({ children }: PropsWithChildren<{}>) {
  return <WithFeatureToggleRedirect feature="Ajna">{children}</WithFeatureToggleRedirect>
}

export function AjnaLayout({ children, bg = <Background /> }: PropsWithChildren<AjnaLayoutProps>) {
  if (!isAppContextAvailable()) return null

  return (
    <ThemeProvider theme={ajnaExtensionTheme}>
      <BasicLayout
        header={<AjnaNavigationController />}
        footer={<Footer />}
        sx={{ position: 'relative' }}
        bg={bg}
      >
        {children}
      </BasicLayout>
    </ThemeProvider>
  )
}

export const ajnaPageSeoTags = (
  <PageSEOTags title="seo.ajna.title" description="seo.ajna.description" url="/ajna" />
)
