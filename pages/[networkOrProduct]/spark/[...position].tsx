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
import { settings } from 'features/omni-kit/protocols/spark/settings'
import { getOmniServerSideProps } from 'features/omni-kit/server'
import type { OmniProductPage } from 'features/omni-kit/types'
import type { SparkLendingProtocol } from 'lendingProtocols'
import { LendingProtocol } from 'lendingProtocols'
import type { GetServerSidePropsContext } from 'next'
import React from 'react'

type SparkPositionPageProps = OmniProductPage

function SparkPositionPage(props: SparkPositionPageProps) {
  return (
    <AppLayout>
      <ProductContextHandler>
        <AaveContextProvider>
          <DeferedContextProvider context={aaveContext}>
            <AaveLikeDeprecatedLinkHandler {...props}>
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
                settings={settings}
              />
            </AaveLikeDeprecatedLinkHandler>
          </DeferedContextProvider>
        </AaveContextProvider>
      </ProductContextHandler>
    </AppLayout>
  )
}

SparkPositionPage.seoTags = (
  <PageSEOTags title="seo.spark.title" description="seo.spark.description" />
)

export default SparkPositionPage

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
        deprecatedPositionId,
        networkId,
        isDeprecatedUrl: true,
        protocol: {
          v3: LendingProtocol.SparkV3,
        }[query.version] as SparkLendingProtocol | undefined,
      },
    }
  }
  return getOmniServerSideProps({ locale, protocol: LendingProtocol.SparkV3, query, settings })
}
