import { AnimatedWrapper } from 'components/AnimatedWrapper'
import { WithConnection } from 'components/connectWallet'
import { AppLayout } from 'components/layouts'
import { ALL_ASSETS, productHubOptionsMap } from 'features/productHub/meta'
import { ProductHubProductType } from 'features/productHub/types'
import { ProductHubView } from 'features/productHub/views'
import { getAppConfig } from 'helpers/config'
import { WithChildren } from 'helpers/types'
import { GetStaticPaths } from 'next'
import React from 'react'

function ProductHubRouteHandler({
  product,
  token,
}: {
  product: ProductHubProductType
  token?: string
}) {
  const { AjnaSafetySwitch: ajnaSafetySwitchOn } = getAppConfig('features')

  return (
    <WithConnection>
      <AnimatedWrapper sx={{ mb: 5 }}>
        <ProductHubView
          product={product}
          promoCardsCollection={ajnaSafetySwitchOn ? 'Home' : 'HomeWithAjna'}
          token={token}
          url="/"
        />
      </AnimatedWrapper>
    </WithConnection>
  )
}

ProductHubRouteHandler.layout = ({ children }: WithChildren) => <AppLayout>{children}</AppLayout>

export default ProductHubRouteHandler

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
