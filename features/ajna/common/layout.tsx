import { isAppContextAvailable } from 'components/AppContextProvider'
import { WithFeatureToggleRedirect } from 'components/FeatureToggleRedirect'
import { Footer } from 'components/Footer'
import { AppHeader } from 'components/Header'
import { PageSEOTags } from 'components/HeadTags'
import { BasicLayout } from 'components/Layouts'
import React, { PropsWithChildren } from 'react'
import { ajnaExtensionTheme } from 'theme'
import { ThemeProvider } from 'theme-ui'
import { Background } from 'theme/Background'

interface AjnaLayoutProps {
  bg?: JSX.Element
}

export function AjnaWrapper({ children }: PropsWithChildren<{}>) {
  return (
    <WithFeatureToggleRedirect feature="Ajna">
      <ThemeProvider theme={ajnaExtensionTheme}>{children}</ThemeProvider>
    </WithFeatureToggleRedirect>
  )
}

export function AjnaLayout({ children, bg = <Background /> }: PropsWithChildren<AjnaLayoutProps>) {
  if (!isAppContextAvailable()) return null

  return (
    <BasicLayout header={<AppHeader />} footer={<Footer />} sx={{ position: 'relative' }} bg={bg}>
      {children}
    </BasicLayout>
  )
}

export const ajnaPageSeoTags = (
  <PageSEOTags title="seo.ajna.title" description="seo.ajna.description" url="/ajna" />
)
