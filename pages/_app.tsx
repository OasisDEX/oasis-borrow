import { CacheProvider, Global } from '@emotion/core'
// @ts-ignore
import { MDXProvider } from '@mdx-js/react'
import { Web3OnboardProvider } from '@web3-onboard/react'
import { AbstractConnector } from '@web3-react/abstract-connector'
import { Web3ReactProvider } from '@web3-react/core'
import { adRollPixelScript } from 'analytics/adroll'
import { trackingEvents } from 'analytics/analytics'
import { COOKIE_NAMES_LOCASTORAGE_KEY } from 'analytics/common'
import { mixpanelInit } from 'analytics/mixpanel'
import { readOnlyEnhanceProvider } from 'blockchain/readOnlyEnhancedProviderProxy'
import { SetupWeb3Context } from 'blockchain/web3Context'
import { AppContextProvider } from 'components/AppContextProvider'
import { CookieBanner, SavedSettings } from 'components/CookieBanner'
import { GasEstimationContextProvider } from 'components/GasEstimationContextProvider'
import { HeadTags, PageSEOTags } from 'components/HeadTags'
import { AppLayout, MarketingLayoutProps } from 'components/Layouts'
import { CustomMDXLink } from 'components/Links'
import { NotificationSocketProvider } from 'components/NotificationSocketProvider'
import { SharedUIProvider } from 'components/SharedUIProvider'
import { cache } from 'emotion'
import { WithFollowVaults } from 'features/follow/view/WithFollowVaults'
import { initWeb3OnBoard } from 'features/web3OnBoard/initWeb3OnBoard'
import { Web3OnBoardConnectorProvider } from 'features/web3OnBoard/web3OnBoardConnectorProvider'
import { INTERNAL_LINKS } from 'helpers/applicationLinks'
import { FTPolarBold, FTPolarMedium } from 'helpers/fonts'
import { ModalProvider } from 'helpers/modalHook'
import { loadFeatureToggles } from 'helpers/useFeatureToggle'
import { useLocalStorage } from 'helpers/useLocalStorage'
import { appWithTranslation, i18n } from 'next-i18next'
import nextI18NextConfig from 'next-i18next.config.js'
import { AppProps } from 'next/app'
import Head from 'next/head'
import { useRouter } from 'next/router'
import React, { useEffect, useRef } from 'react'
import { theme } from 'theme'
// @ts-ignore
import { components, ThemeProvider } from 'theme-ui'
import { web3OnboardStyles } from 'theme/web3OnboardStyles'
import Web3 from 'web3'

if (process.env.NODE_ENV !== 'production') {
  if (typeof window !== 'undefined') {
    const { applyClientHMR } = require('i18next-hmr/client')
    applyClientHMR(() => i18n)
  } else {
    const { applyServerHMR } = require('i18next-hmr/server')
    applyServerHMR(() => i18n)
  }
}

function getLibrary(provider: any, connector: AbstractConnector | undefined): Web3 {
  const chainIdPromise = connector!.getChainId()
  const readOnlyEnhancedProvider = readOnlyEnhanceProvider(provider, chainIdPromise)
  return new Web3(readOnlyEnhancedProvider)
}

const globalStyles = `
  ${web3OnboardStyles}
  html,
  body,
  div#__next {
    height: 100%;
  }

  html {
    overflow-x: hidden;
    scroll-behavior: smooth;
  }

  body {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
    overflow-anchor: none;
    overflow-x: hidden;
  }

  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  input[type=number] {
    -moz-appearance: textfield;
  }
  ${FTPolarBold.style.fontFamily}
  ${FTPolarMedium.style.fontFamily}
`

// extending Component with static properties that can be attached to it
// to control theme, layout and it's props
interface CustomAppProps {
  Component: {
    theme?: string
    layoutProps?: MarketingLayoutProps
    layout?: (props: MarketingLayoutProps) => JSX.Element
    seoTags?: JSX.Element
  }
}

// script for disabling Next.js overlay for particular event errors
// currently there is no option to configure error overlay in development mode
const noOverlayWorkaroundScript = `
  window.addEventListener('error', event => {
    // filter out error from Metamask extension
    if (event.filename.includes('inpage.js')){
      event.stopImmediatePropagation();
    }
  })
`

function App({ Component, pageProps }: AppProps & CustomAppProps) {
  const [cookiesValue, cookiesSetValue] = useLocalStorage(
    COOKIE_NAMES_LOCASTORAGE_KEY,
    {} as SavedSettings,
  )
  const mount = useRef(false)
  const Layout = Component.layout || AppLayout

  const layoutProps = Component.layoutProps
  const router = useRouter()

  const seoTags = Component.seoTags || (
    <PageSEOTags
      title="seo.default.title"
      description="seo.default.description"
      url={router.pathname || INTERNAL_LINKS.homepage}
    />
  )

  useEffect(() => {
    if (router.isReady && !mount.current) {
      mixpanelInit()

      if (router.pathname === '/') {
        const utm: { [key: string]: string | string[] | undefined } = {
          utmSource: router.query.utm_source,
          utmMedium: router.query.utm_medium,
          utmCampaign: router.query.utm_campaign,
        }

        trackingEvents.landingPageView(utm)
      } else {
        trackingEvents.pageView(router.pathname)
      }
      mount.current = true
    }
  }, [router])

  useEffect(() => {
    const handleRouteChange = (url: string) => {
      // track events when not in development
      if (process.env.NODE_ENV !== 'development') {
        trackingEvents.pageView(url)
      }
    }

    router.events.on('routeChangeComplete', handleRouteChange)

    loadFeatureToggles()
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange)
    }
  }, [router.events])

  return (
    <>
      <Head>
        {process.env.NODE_ENV !== 'production' && (
          <script dangerouslySetInnerHTML={{ __html: noOverlayWorkaroundScript }} />
        )}
        {cookiesValue?.enabledCookies?.marketing && (
          <script dangerouslySetInnerHTML={{ __html: adRollPixelScript }} async />
        )}

        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <ThemeProvider theme={theme}>
        <CacheProvider value={cache}>
          <MDXProvider components={{ ...components, a: CustomMDXLink }}>
            <Global styles={globalStyles} />
            <Web3ReactProvider {...{ getLibrary }}>
              <AppContextProvider>
                <ModalProvider>
                  <HeadTags />
                  {seoTags}
                  <SetupWeb3Context>
                    <Web3OnboardProvider web3Onboard={initWeb3OnBoard}>
                      <Web3OnBoardConnectorProvider>
                        <SharedUIProvider>
                          <GasEstimationContextProvider>
                            <NotificationSocketProvider>
                              <WithFollowVaults>
                                <Layout {...layoutProps}>
                                  <Component {...pageProps} />
                                  <CookieBanner setValue={cookiesSetValue} value={cookiesValue} />
                                </Layout>
                              </WithFollowVaults>
                            </NotificationSocketProvider>
                          </GasEstimationContextProvider>
                        </SharedUIProvider>
                      </Web3OnBoardConnectorProvider>
                    </Web3OnboardProvider>
                  </SetupWeb3Context>
                </ModalProvider>
              </AppContextProvider>
            </Web3ReactProvider>
          </MDXProvider>
        </CacheProvider>
      </ThemeProvider>
    </>
  )
}

export default appWithTranslation(
  App as React.ComponentType<AppProps> | React.ElementType<AppProps>,
  nextI18NextConfig,
)
