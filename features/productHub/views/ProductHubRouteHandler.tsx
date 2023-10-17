import { AnimatedWrapper } from 'components/AnimatedWrapper'
import { WithConnection } from 'components/connectWallet'
import { AppLayout } from 'components/layouts/AppLayout'
import { ALL_ASSETS, productHubOptionsMap } from 'features/productHub/meta'
import { ProductHubProductType } from 'features/productHub/types'
import { ProductHubView } from 'features/productHub/views'
import { useAppConfig } from 'helpers/config'
import { useScrollToTop } from 'helpers/useScrollToTop'
import type { GetStaticPaths } from 'next'
import React from 'react'

import type { ProductHubRouteHandlerProps } from './ProductHubRouteHandler.types'

function ProductHubRouteHandler({ product, token }: ProductHubRouteHandlerProps) {
  const { AjnaSafetySwitch: ajnaSafetySwitchOn } = useAppConfig('features')
  useScrollToTop(product)

  return (
    <AppLayout>
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
    </AppLayout>
  )
}

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
