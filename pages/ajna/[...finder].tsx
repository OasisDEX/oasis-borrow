import { PageSEOTags } from 'components/HeadTags'
import { AjnaProductHubController } from 'features/ajna/common/controls/AjnaProductHubController'
import { AjnaLayout, ajnaPageSeoTags } from 'features/ajna/common/layout'
import { ALL_ASSETS, productHubOptionsMap } from 'features/productHub/meta'
import { ProductHubProductType } from 'features/productHub/types'
import { upperFirst } from 'lodash'
import type { GetStaticPaths, GetStaticProps } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React from 'react'

function AjnaProductSlugPage({
  product,
  token,
}: {
  product: ProductHubProductType
  token?: string
}) {
  return (
    <>
      <PageSEOTags
        title="seo.ajnaProductPage.title"
        titleParams={{ product: upperFirst(product) }}
        description="seo.ajna.description"
        url={`/ajna/${product}${token ? `/${token}` : ''}`}
      />
      <AjnaProductHubController product={product} token={token} />
    </>
  )
}

AjnaProductSlugPage.layout = AjnaLayout
AjnaProductSlugPage.seoTags = ajnaPageSeoTags

export default AjnaProductSlugPage

export const getStaticPaths: GetStaticPaths = async ({ locales }) => {
  const paths =
    locales?.flatMap((locale) =>
      Object.values(ProductHubProductType)
        .flatMap((product) =>
          Object.values(productHubOptionsMap[product].tokens).map((token) => [
            product,
            ...(token.value !== ALL_ASSETS ? [token.value] : []),
          ]),
        )
        .map((finder) => ({ params: { finder }, locale })),
    ) || []

  return {
    paths,
    fallback: false,
  }
}

export const getStaticProps: GetStaticProps = async ({ locale, params }) => {
  const product = params?.finder![0] as ProductHubProductType
  const token = params?.finder![1]

  return {
    props: {
      ...(await serverSideTranslations(locale || 'en', ['common'])),
      ...(product && { product }),
      ...(token && { token }),
    },
  }
}
