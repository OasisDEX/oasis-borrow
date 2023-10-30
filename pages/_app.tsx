import { CacheProvider, Global } from '@emotion/core'
import { Web3OnboardProvider } from '@web3-onboard/react'
import type { AbstractConnector } from '@web3-react/abstract-connector'
import { Web3ReactProvider } from '@web3-react/core'
import { adRollPixelScript } from 'analytics/adroll'
import { COOKIE_NAMES_LOCASTORAGE_KEY } from 'analytics/common'
import { mixpanelInit } from 'analytics/mixpanel'
import { trackingEvents } from 'analytics/trackingEvents'
import { readOnlyEnhanceProvider } from 'blockchain/readOnlyEnhancedProviderProxy'
import { SetupWeb3Context } from 'blockchain/web3Context'
import { accountContext, AccountContextProvider } from 'components/context/AccountContextProvider'
import { DeferedContextProvider } from 'components/context/DeferedContextProvider'
import { mainContext, MainContextProvider } from 'components/context/MainContextProvider'
import { NotificationSocketProvider } from 'components/context/NotificationSocketProvider'
import {
  preloadAppDataContext,
  PreloadAppDataContextProvider,
} from 'components/context/PreloadAppDataContextProvider'
import type { SavedSettings } from 'components/CookieBanner.types'
import { CookieBannerDynamic } from 'components/CookieBannerDynamic'
import { PageSEOTags } from 'components/HeadTags'
import { SharedUIProvider } from 'components/SharedUIProvider'
import { TopBannerDynamic } from 'components/TopBannerDynamic'
import { cache } from 'emotion'
import { initWeb3OnBoard } from 'features/web3OnBoard/init-web3-on-board'
import { Web3OnBoardConnectorProvider } from 'features/web3OnBoard/web3-on-board-connector-provider'
import { INTERNAL_LINKS } from 'helpers/applicationLinks'
import { ModalProvider } from 'helpers/modalHook'
import { useLocalStorage } from 'helpers/useLocalStorage'
import { appWithTranslation } from 'next-i18next'
import nextI18NextConfig from 'next-i18next.config.js'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import { useRouter } from 'next/router'
import Script from 'next/script'
import React, { useEffect, useRef } from 'react'
import { theme } from 'theme'
import { ThemeUIProvider } from 'theme-ui'
import { web3OnboardStyles } from 'theme/web3OnboardStyles'
import Web3 from 'web3'

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
`

// extending Component with static properties that can be attached to it
// to control theme, layout and it's props
interface CustomAppProps {
  Component: {
    theme?: string
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
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange)
    }
  }, [router.events])

  return (
    <>
      <Head>
        {process.env.NODE_ENV !== 'production' && (
          <Script dangerouslySetInnerHTML={{ __html: noOverlayWorkaroundScript }} />
        )}
        {cookiesValue?.enabledCookies?.marketing && (
          <Script dangerouslySetInnerHTML={{ __html: adRollPixelScript }} async />
        )}

        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <ThemeUIProvider theme={theme}>
        <CacheProvider value={cache}>
          <Global styles={globalStyles} />
          <Web3OnboardProvider web3Onboard={initWeb3OnBoard}>
            {seoTags}
            <PreloadAppDataContextProvider>
              <DeferedContextProvider context={preloadAppDataContext}>
                <MainContextProvider>
                  <DeferedContextProvider context={mainContext}>
                    <ModalProvider>
                      <Web3OnBoardConnectorProvider>
                        <Web3ReactProvider {...{ getLibrary }}>
                          <SetupWeb3Context>
                            <NotificationSocketProvider>
                              <SharedUIProvider>
                                <TopBannerDynamic />
                                <AccountContextProvider>
                                  <DeferedContextProvider context={accountContext}>
                                    <Component {...pageProps} />
                                    <CookieBannerDynamic
                                      setValue={cookiesSetValue}
                                      value={cookiesValue}
                                    />
                                  </DeferedContextProvider>
                                </AccountContextProvider>
                              </SharedUIProvider>
                            </NotificationSocketProvider>
                          </SetupWeb3Context>
                        </Web3ReactProvider>
                      </Web3OnBoardConnectorProvider>
                    </ModalProvider>
                  </DeferedContextProvider>
                </MainContextProvider>
              </DeferedContextProvider>
            </PreloadAppDataContextProvider>
          </Web3OnboardProvider>
        </CacheProvider>
      </ThemeUIProvider>
    </>
  )
}

export default appWithTranslation(
  App as React.ComponentType<AppProps> | React.ElementType<AppProps>,
  Object.assign(nextI18NextConfig, {
    i18n: {
      ...nextI18NextConfig.i18n,
      localeDetection: false as const, // set to false because of recent update https://github.com/vercel/next.js/issues/55648
    },
  }),
)
