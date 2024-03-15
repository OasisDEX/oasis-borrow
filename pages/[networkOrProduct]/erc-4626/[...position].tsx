import type { Erc4626Position } from '@oasisdex/dma-library'
import { ProductContextHandler } from 'components/context/ProductContextHandler'
import { PageSEOTags } from 'components/HeadTags'
import { AppLayout } from 'components/layouts/AppLayout'
import { OmniProductController } from 'features/omni-kit/controllers'
import { erc4626SeoTags } from 'features/omni-kit/protocols/erc-4626/constants'
import { useErc4626Data } from 'features/omni-kit/protocols/erc-4626/hooks'
import { erc4626VaultsById, settings } from 'features/omni-kit/protocols/erc-4626/settings'
import { Erc4626CustomStateProvider } from 'features/omni-kit/protocols/erc-4626/state'
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
        <OmniProductController<unknown, unknown[], Erc4626Position>
          {...props}
          customState={Erc4626CustomStateProvider}
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

  const {
    name,
    protocol,
    token: { symbol },
  } = erc4626VaultsById[label]

  return getOmniServerSideProps({
    collateralToken: symbol,
    label: name,
    locale,
    protocol,
    query,
    quoteToken: symbol,
    settings,
    isProductPageValid: ({ networkId: _networkId, protocol: _protocol }) =>
      erc4626VaultsById[label].networkId === _networkId &&
      erc4626VaultsById[label].protocol === _protocol,
  })
}
