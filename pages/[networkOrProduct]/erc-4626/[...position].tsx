import { ProductContextHandler } from 'components/context/ProductContextHandler'
import { PageSEOTags } from 'components/HeadTags'
import { AppLayout } from 'components/layouts/AppLayout'
import { erc4626LabelsMap, settings } from 'features/omni-kit/protocols/erc-4626/settings'
import { getOmniServerSideProps } from 'features/omni-kit/server'
import type { OmniProductPage } from 'features/omni-kit/types'
import { INTERNAL_LINKS } from 'helpers/applicationLinks'
import type { GetServerSidePropsContext } from 'next'
import React from 'react'

type Erc4626PositionPageProps = OmniProductPage

function Erc4626PositionPage(props: Erc4626PositionPageProps) {
  console.log(props)

  return (
    <AppLayout>
      <ProductContextHandler>
        {/* <OmniProductController<MorphoHistoryEvent, MorphoHistoryEvent[], MorphoBluePosition>
          {...props}
          customState={({ children }) =>
            children({
              useDynamicMetadata: useMorphoMetadata,
              useTxHandler: useMorphoTxHandler,
            })
          }
          protocol={LendingProtocol.MorphoBlue}
          protocolHook={useMorphoData}
          seoTags={morphoSeoTags}
          settings={settings}
        /> */}
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

  if (!Object.keys(erc4626LabelsMap).includes(label)) {
    return {
      redirect: {
        permanent: false,
        destination: INTERNAL_LINKS.notFound,
      },
    }
  }

  return getOmniServerSideProps({
    collateralToken: erc4626LabelsMap[label].token,
    locale,
    protocol: erc4626LabelsMap[label].protocol,
    query,
    quoteToken: erc4626LabelsMap[label].token,
    settings,
  })
}
