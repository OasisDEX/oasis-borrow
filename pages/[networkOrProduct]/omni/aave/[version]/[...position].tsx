import type { AaveLikePositionV2 } from '@oasisdex/dma-library'
import { DeferedContextProvider } from 'components/context/DeferedContextProvider'
import { ProductContextHandler } from 'components/context/ProductContextHandler'
import { PageSEOTags } from 'components/HeadTags'
import { AppLayout } from 'components/layouts/AppLayout'
import { aaveContext, AaveContextProvider } from 'features/aave'
import { OmniProductController } from 'features/omni-kit/controllers'
import { aaveSeoTags } from 'features/omni-kit/protocols/aave/constants'
import type { AaveLikeHistoryEvent } from 'features/omni-kit/protocols/aave-like/history/types'
import { useAaveLikeData, useAaveLikeTxHandler } from 'features/omni-kit/protocols/aave-like/hooks'
import { useAaveLikeMetadata } from 'features/omni-kit/protocols/aave-like/metadata'
import { getOmniServerSideProps } from 'features/omni-kit/server'
import { omniProtocolSettings } from 'features/omni-kit/settings'
import type { OmniProductPage } from 'features/omni-kit/types'
import type { AaveLendingProtocol } from 'lendingProtocols'
import { LendingProtocol } from 'lendingProtocols'
import type { GetServerSidePropsContext } from 'next'
import React from 'react'

type AavePositionPageProps = OmniProductPage

function AavePositionPage(props: AavePositionPageProps) {
  return (
    <AppLayout>
      <ProductContextHandler>
        <AaveContextProvider>
          <DeferedContextProvider context={aaveContext}>
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
          </DeferedContextProvider>
        </AaveContextProvider>
      </ProductContextHandler>
    </AppLayout>
  )
}

AavePositionPage.seoTags = <PageSEOTags title="seo.aave.title" description="seo.aave.description" />

export default AavePositionPage

export async function getServerSideProps({ locale, query }: GetServerSidePropsContext) {
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

  return getOmniServerSideProps({ locale, protocol, query })
}
