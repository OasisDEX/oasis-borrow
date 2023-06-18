import { AnimatedWrapper } from 'components/AnimatedWrapper'
import { WithConnection } from 'components/connectWallet'
import { WithFeatureToggleRedirect } from 'components/FeatureToggleRedirect'
import { AppLayout } from 'components/Layouts'
import { getProductHubStaticProps } from 'features/productHub/helpers/getProductHubStaticProps'
import { ALL_ASSETS, productHubOptionsMap } from 'features/productHub/meta'
import { ProductHubProductType } from 'features/productHub/types'
import { ProductHubView } from 'features/productHub/views'
import { WithChildren } from 'helpers/types'
import { GetStaticPaths, GetStaticProps } from 'next'
import React from 'react'

function OasisCreatePage({ product, token }: { product: ProductHubProductType; token?: string }) {
  return (
    <WithConnection>
      <WithFeatureToggleRedirect feature="OasisCreate">
        <AnimatedWrapper sx={{ mb: 5 }}>
          <ProductHubView
            product={product}
            promoCardsCollection="Home"
            token={token}
            url="/oasis-create/"
          />
        </AnimatedWrapper>
      </WithFeatureToggleRedirect>
    </WithConnection>
  )
}

OasisCreatePage.layout = ({ children }: WithChildren) => <AppLayout>{children}</AppLayout>

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
  return await getProductHubStaticProps(locale, params)
}
