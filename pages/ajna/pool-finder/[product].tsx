import { ProductContextHandler } from 'components/context'
import { WithFeatureToggleRedirect } from 'components/FeatureToggleRedirect'
import { PageSEOTags } from 'components/HeadTags'
import { AjnaPoolFinderController } from 'features/ajna/common/controls/AjnaPoolFinderController'
import { AjnaLayout, ajnaPageSeoTags } from 'features/ajna/common/layout'
import { ProductHubProductType } from 'features/productHub/types'
import type { GetStaticPaths, GetStaticProps } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React from 'react'
import { FeaturesEnum } from 'types/config'

function AjnaPoolFinderPage({ product }: { product: ProductHubProductType }) {
  return (
    <>
      <PageSEOTags
        title="seo.ajnaPoolFinder.title"
        description="seo.ajna.description"
        url={`/ajna/pool-finder/${product}`}
      />
      <ProductContextHandler>
        <WithFeatureToggleRedirect feature={FeaturesEnum.AjnaPoolFinder}>
          <AjnaPoolFinderController product={product} />
        </WithFeatureToggleRedirect>
      </ProductContextHandler>
    </>
  )
}

AjnaPoolFinderPage.layout = AjnaLayout
AjnaPoolFinderPage.seoTags = ajnaPageSeoTags

export default AjnaPoolFinderPage

export const getStaticPaths: GetStaticPaths = async ({ locales }) => {
  const paths =
    locales?.flatMap((locale) =>
      [ProductHubProductType.Borrow, ProductHubProductType.Earn].map((product) => ({
        params: { product },
        locale,
      })),
    ) || []

  return {
    paths,
    fallback: false,
  }
}

export const getStaticProps: GetStaticProps = async ({ locale, params }) => {
  const product = params?.product as ProductHubProductType

  return {
    props: {
      ...(await serverSideTranslations(locale || 'en', ['common'])),
      ...(product && { product }),
    },
  }
}
