import type { SupplyPosition } from '@oasisdex/dma-library'
import { ProductContextHandler } from 'components/context/ProductContextHandler'
import { PageSEOTags } from 'components/HeadTags'
import { AppLayout } from 'components/layouts/AppLayout'
import { OmniProductController } from 'features/omni-kit/controllers'
import { erc4626SeoTags } from 'features/omni-kit/protocols/erc-4626/constants'
import { useErc4626Data, useErc4626TxHandler } from 'features/omni-kit/protocols/erc-4626/hooks'
import { useErc4626Metadata } from 'features/omni-kit/protocols/erc-4626/metadata'
import { erc4626VaultsById, settings } from 'features/omni-kit/protocols/erc-4626/settings'
import { getOmniServerSideProps } from 'features/omni-kit/server'
import type { OmniProductPage } from 'features/omni-kit/types'
import { INTERNAL_LINKS } from 'helpers/applicationLinks'
import type { GetServerSidePropsContext } from 'next'
import React from 'react'

type Erc4626PositionPageProps = OmniProductPage

function Erc4626PositionPage(props: Erc4626PositionPageProps) {
  return (
    <AppLayout>
      <ProductContextHandler>
        <OmniProductController<unknown, unknown[], SupplyPosition>
          {...props}
          customState={({ children }) =>
            children({
              useDynamicMetadata: useErc4626Metadata,
              useTxHandler: useErc4626TxHandler,
            })
          }
          protocolHook={useErc4626Data}
          seoTags={erc4626SeoTags}
          settings={settings}
        />
      </ProductContextHandler>
    </AppLayout>
  )
}

Erc4626PositionPage.seoTags = (
  <PageSEOTags title="seo.erc-4626.title" description="seo.erc-4626.description" />
)

export default Erc4626PositionPage

export async function getServerSideProps({ locale, query }: GetServerSidePropsContext) {
  const [, label] = query.position as string[]

  if (!Object.keys(erc4626VaultsById).includes(label)) {
    return {
      redirect: {
        permanent: false,
        destination: INTERNAL_LINKS.notFound,
      },
    }
  }

  const { name, protocol, token } = erc4626VaultsById[label]

  return getOmniServerSideProps({
    collateralToken: token,
    label: name,
    locale,
    protocol,
    query,
    quoteToken: token,
    settings,
  })
}
