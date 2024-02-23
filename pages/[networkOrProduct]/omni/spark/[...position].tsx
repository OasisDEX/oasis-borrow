import type { AaveLikePositionV2 } from '@oasisdex/dma-library'
import { DeferedContextProvider } from 'components/context/DeferedContextProvider'
import { ProductContextHandler } from 'components/context/ProductContextHandler'
import { PageSEOTags } from 'components/HeadTags'
import { AppLayout } from 'components/layouts/AppLayout'
import { aaveContext, AaveContextProvider } from 'features/aave'
import { OmniProductController } from 'features/omni-kit/controllers'
import { aaveSeoTags } from 'features/omni-kit/protocols/aave/constants'
import type { AaveHistoryEvent } from 'features/omni-kit/protocols/aave/history/types'
import { useAaveLikeData, useAaveTxHandler } from 'features/omni-kit/protocols/aave/hooks'
import { useAaveLikeMetadata } from 'features/omni-kit/protocols/aave/metadata'
import { settings as sparkSettings } from 'features/omni-kit/protocols/spark/settings'
import { getOmniServerSideProps } from 'features/omni-kit/server'
import type { OmniProductPage } from 'features/omni-kit/types'
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
            <OmniProductController<
              AaveHistoryEvent | undefined,
              AaveHistoryEvent[],
              AaveLikePositionV2
            >
              {...props}
              customState={({ children }) =>
                children({
                  useDynamicMetadata: useAaveLikeMetadata,
                  useTxHandler: useAaveTxHandler,
                })
              }
              protocol={props.protocol}
              protocolHook={useAaveLikeData}
              seoTags={aaveSeoTags}
              settings={sparkSettings}
              shouldUseProtocolPrices
            />
          </DeferedContextProvider>
        </AaveContextProvider>
      </ProductContextHandler>
    </AppLayout>
  )
}

SparkPositionPage.seoTags = (
  <PageSEOTags title="seo.aave.title" description="seo.aave.description" />
)

export default SparkPositionPage

export async function getServerSideProps({ locale, query }: GetServerSidePropsContext) {
  return getOmniServerSideProps({ locale, protocol: LendingProtocol.SparkV3, query })
}
