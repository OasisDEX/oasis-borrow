import { AnimatedWrapper } from 'components/AnimatedWrapper'
import { WithConnection } from 'components/connectWallet'
import { WithFeatureToggleRedirect } from 'components/FeatureToggleRedirect'
import { ProductHubProductType } from 'features/productHub/types'
import { ProductHubView } from 'features/productHub/views'
import { LendingProtocol } from 'lendingProtocols'
import React from 'react'

interface AjnaProductHubControllerProps {
  product: ProductHubProductType
  token?: string
}

export function AjnaProductHubController({ product, token }: AjnaProductHubControllerProps) {
  return (
    <WithConnection>
      <WithFeatureToggleRedirect feature="OasisCreate">
        <AnimatedWrapper sx={{ mb: 5 }}>
          <ProductHubView
            initialProtocol={[LendingProtocol.Ajna]}
            product={product}
            promoCardsCollection="AjnaLP"
            token={token}
            url="/ajna/"
          />
        </AnimatedWrapper>
      </WithFeatureToggleRedirect>
    </WithConnection>
  )
}
