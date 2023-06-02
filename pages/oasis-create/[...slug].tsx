import { WithConnection } from 'components/connectWallet'
import { WithFeatureToggleRedirect } from 'components/FeatureToggleRedirect'
import { AppLayout } from 'components/Layouts'
import { ALL_ASSETS, productHubOptionsMap } from 'features/productHub/meta'
import { ProductHubProductType } from 'features/productHub/types'
import { ProductHubView } from 'features/productHub/views'
import { WithChildren } from 'helpers/types'
import { GetStaticPaths, GetStaticProps } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React from 'react'

function OasisCreatePage({ product, token }: { product: ProductHubProductType; token?: string }) {
  return (
    <WithConnection>
      <WithFeatureToggleRedirect feature="OasisCreate">
        <ProductHubView product={product} token={token} />
      </WithFeatureToggleRedirect>
    </WithConnection>
  )
}

OasisCreatePage.layout = ({ children }: WithChildren) => (
  <AppLayout shortBackground={true}>{children}</AppLayout>
)

export default OasisCreatePage

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
        .map((slug) => ({ params: { slug }, locale })),
    ) || []

  return {
    paths,
    fallback: false,
  }
}

export const getStaticProps: GetStaticProps = async ({ locale, params }) => {
  const product = params?.slug![0] as ProductHubProductType
  const token = params?.slug![1]

  return {
    props: {
      ...(await serverSideTranslations(locale || 'en', ['common'])),
      ...(product && { product }),
      ...(token && { token }),
    },
  }
}
