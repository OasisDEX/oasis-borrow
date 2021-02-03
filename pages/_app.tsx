import { CacheProvider, Global } from '@emotion/core'
// @ts-ignore
import { MDXProvider } from '@mdx-js/react'
import { AbstractConnector } from '@web3-react/abstract-connector'
import { Web3ReactProvider } from '@web3-react/core'
import { AppContextProvider } from 'components/AppContextProvider'
import { SetupWeb3Context } from 'blockchain/web3Context'
import { wsEnhanceProvider } from 'blockchain/wsEnhancedProviderProxy'
import { HeadTags, PageSEOTags } from 'components/HeadTags'
import { AppLayout, AppLayoutProps, MarketingLayoutProps } from 'components/Layouts'
import { CustomMDXLink } from 'components/Links'
// @ts-ignore
import { cache } from 'emotion'
import { ModalProvider } from 'helpers/modalHook'
import { appWithTranslation } from 'i18n'
import { AppProps } from 'next/app'
import Head from 'next/head'
import { useRouter } from 'next/router'
import React, { useEffect } from 'react'
import { landingTheme, theme } from 'theme'
// @ts-ignore
import { components, ThemeProvider } from 'theme-ui'
import Web3 from 'web3'

import { trackingEvents } from '../analytics/analytics'
import { mixpanelInit } from '../analytics/mixpanel'

function getLibrary(provider: any, connector: AbstractConnector): Web3 {
  const chainIdPromise = connector.getChainId()
  const wsEnhancedProvider = wsEnhanceProvider(provider, chainIdPromise)
  return new Web3(wsEnhancedProvider)
}

const globalStyles = `
  html,
  body,
  body > div:first-of-type,
  div#__next {
    height: 100%;
  }

  html {
    width: 100vw;
    overflow-x: hidden;

    @media screen and (max-width: ${theme.sizes.container}px) {
      width: 100%;
    }
  }

  body {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
    overflow-anchor: none
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
    layoutProps?: AppLayoutProps | MarketingLayoutProps
    layout?: (props: AppLayoutProps | MarketingLayoutProps) => JSX.Element
    seoTags?: JSX.Element
  }
}

if (process.env.NODE_ENV === 'production') {
  mixpanelInit()
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
  const Layout = Component.layout || AppLayout
  const layoutProps = Component.layoutProps
  const pageTheme = Component.theme === 'Landing' ? landingTheme : theme
  const seoTags = Component.seoTags || (
    <PageSEOTags title="seo.default.title" description="seo.default.description" />
  )

  const router = useRouter()

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
  }, [])

  return (
    <>
      <Head>
        {process.env.NODE_ENV !== 'production' && (
          <script dangerouslySetInnerHTML={{ __html: noOverlayWorkaroundScript }} />
        )}
      </Head>
      <ThemeProvider theme={pageTheme}>
        <CacheProvider value={cache}>
          <MDXProvider components={{ ...components, a: CustomMDXLink }}>
            <Global styles={globalStyles} />
            <Web3ReactProvider {...{ getLibrary }}>
              <AppContextProvider>
                <ModalProvider>
                  <HeadTags />
                  {seoTags}
                  <SetupWeb3Context>
                    <Layout {...layoutProps}>
                      <Component {...pageProps} />
                    </Layout>
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

export default appWithTranslation(App)
