import { CacheProvider, Global } from '@emotion/core'
// @ts-ignore
import { MDXProvider } from '@mdx-js/react'
import { AbstractConnector } from '@web3-react/abstract-connector'
import { Web3ReactProvider } from '@web3-react/core'
import { readOnlyEnhanceProvider } from 'blockchain/readOnlyEnhancedProviderProxy'
import { SetupWeb3Context } from 'blockchain/web3Context'
import { AppContextProvider } from 'components/AppContextProvider'
import { HeadTags, PageSEOTags } from 'components/HeadTags'
import { AppLayout, MarketingLayoutProps } from 'components/Layouts'
import { CustomMDXLink } from 'components/Links'
// @ts-ignore
import { cache } from 'emotion'
import { ModalProvider } from 'helpers/modalHook'
import { staticFilesRuntimeUrl } from 'helpers/staticPaths'
import { appWithTranslation } from 'next-i18next'
import { AppProps } from 'next/app'
import Head from 'next/head'
import { useRouter } from 'next/router'
import React, { useEffect } from 'react'
import { theme } from 'theme'
// @ts-ignore
import { components, ThemeProvider } from 'theme-ui'
import Web3 from 'web3'

import { trackingEvents } from '../analytics/analytics'
import { mixpanelInit } from '../analytics/mixpanel'
import nextI18NextConfig from '../next-i18next.config.js'

function getLibrary(provider: any, connector: AbstractConnector | undefined): Web3 {
  const chainIdPromise = connector!.getChainId()
  const readOnlyEnhancedProvider = readOnlyEnhanceProvider(provider, chainIdPromise)
  return new Web3(readOnlyEnhancedProvider)
}

const FTPolarFontBold = staticFilesRuntimeUrl('/static/fonts/FTPolar/FTPolarTrial-Bold')
const FTPolarFontMedium = staticFilesRuntimeUrl('/static/fonts/FTPolar/FTPolarTrial-Medium')

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

  @font-face {
    font-family: 'FT Polar Trial';
    src: url('${FTPolarFontMedium}.woff2') format('woff2'),
        url('${FTPolarFontMedium}.woff') format('woff'),
        url('${FTPolarFontMedium}.ttf') format('truetype');
    font-weight: 500;
    font-style: normal;
    font-display: swap;
}

@font-face {
    font-family: 'FT Polar Trial';
    src: url('${FTPolarFontBold}.woff2') format('woff2'),
        url('${FTPolarFontBold}.woff') format('woff'),
        url('${FTPolarFontBold}.ttf') format('truetype');
    font-weight: bold;
    font-style: normal;
    font-display: swap;
}
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

export default appWithTranslation(
  App as React.ComponentType<AppProps> | React.ElementType<AppProps>,
  nextI18NextConfig,
)
