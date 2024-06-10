import type { AaveLikePositionV2 } from '@oasisdex/dma-library'
import type { NetworkNames } from 'blockchain/networks'
import { getNetworkByName } from 'blockchain/networks'
import { DeferedContextProvider } from 'components/context/DeferedContextProvider'
import { ProductContextHandler } from 'components/context/ProductContextHandler'
import { PageSEOTags } from 'components/HeadTags'
import { AppLayout } from 'components/layouts/AppLayout'
import { aaveContext, AaveContextProvider } from 'features/aave'
import { OmniProductController } from 'features/omni-kit/controllers'
import { AaveLikeDeprecatedLinkHandler } from 'features/omni-kit/controllers/OmniAaveLikeDeprecatedLinkHandler'
import { aaveSeoTags } from 'features/omni-kit/protocols/aave/constants'
import type { AaveLikeHistoryEvent } from 'features/omni-kit/protocols/aave-like/history/types'
import { useAaveLikeData, useAaveLikeTxHandler } from 'features/omni-kit/protocols/aave-like/hooks'
import { useAaveLikeMetadata } from 'features/omni-kit/protocols/aave-like/metadata'
import { getOmniServerSideProps } from 'features/omni-kit/server'
import { omniProtocolSettings } from 'features/omni-kit/settings'
import type { OmniProductPage } from 'features/omni-kit/types'
import { RefinanceGeneralContextProvider } from 'features/refinance/contexts'
import { ModalProvider } from 'helpers/modalHook'
import type { AaveLendingProtocol } from 'lendingProtocols'
import { LendingProtocol } from 'lendingProtocols'
import type { GetServerSidePropsContext } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React from 'react'

export type AavePositionPageProps = OmniProductPage & {
  isDeprecatedUrl?: boolean
  deprecatedPositionId?: number
}

function AavePositionPage(props: AavePositionPageProps) {
  return (
    <AppLayout>
      <ProductContextHandler>
        <AaveContextProvider>
          <DeferedContextProvider context={aaveContext}>
            <AaveLikeDeprecatedLinkHandler {...props}>
              <RefinanceGeneralContextProvider>
                <ModalProvider>
                  <OmniProductController<
                    AaveLikeHistoryEvent | undefined,
                    AaveLikeHistoryEvent[],
                    AaveLikePositionV2
                  >
                    {...props}
                    customState={({ children }) =>
                      children({
                        useDynamicMetadata: useAaveLikeMetadata,
                        useTxHandler: useAaveLikeTxHandler,
                      })
                    }
                    protocol={props.protocol}
                    protocolHook={useAaveLikeData}
                    seoTags={aaveSeoTags}
                    settings={omniProtocolSettings[props.protocol]}
                  />
                </ModalProvider>
              </RefinanceGeneralContextProvider>
            </AaveLikeDeprecatedLinkHandler>
          </DeferedContextProvider>
        </AaveContextProvider>
      </ProductContextHandler>
    </AppLayout>
  )
}

AavePositionPage.seoTags = <PageSEOTags title="seo.aave.title" description="seo.aave.description" />

export default AavePositionPage

export async function getServerSideProps({ locale, query }: GetServerSidePropsContext) {
  // the old xstate link produces less query params
  // query { networkOrProduct: 'arbitrum', version: 'v3', position: [ '254' ] }
  // vs omni
  // query {
  //   networkOrProduct: 'arbitrum',
  //   version: 'v3',
  //   position: [ 'multiply', 'wbtc-usdc', '187' ]
  // }
  // we can use that to make a redirection (on the frontend)

  if (
    // if theres version and position, and position is a single number
    // we're dealing with a deprecated link to a position
    query.position &&
    'version' in query &&
    typeof query.version === 'string' &&
    query.position?.length === 1 &&
    !Number.isNaN(Number(query.position[0]))
  ) {
    const deprecatedPositionId = Number(query.position[0])
    const networkId = getNetworkByName(query.networkOrProduct as unknown as NetworkNames).id
    return {
      props: {
        ...(await serverSideTranslations(locale || 'en', ['common'])),
        deprecatedPositionId,
        networkId,
        isDeprecatedUrl: true,
        protocol: {
          v2: LendingProtocol.AaveV2,
          v3: LendingProtocol.AaveV3,
        }[query.version] as AaveLendingProtocol | undefined,
      },
    }
  }

  console.log('query', query)

  if (!('version' in query && typeof query.version === 'string')) {
    console.warn('version url param not provided')
    return {
      redirect: {
        permanent: false,
        destination: '/not-found',
      },
    }
  }

  const protocol = {
    v2: LendingProtocol.AaveV2,
    v3: LendingProtocol.AaveV3,
  }[query.version] as AaveLendingProtocol | undefined

  if (!protocol) {
    console.warn('Aave protocol not resolved')
    return {
      redirect: {
        permanent: false,
        destination: '/not-found',
      },
    }
  }

  return getOmniServerSideProps({
    locale,
    protocol,
    query,
    settings: omniProtocolSettings[protocol],
  })
}
