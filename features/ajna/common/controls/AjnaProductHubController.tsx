import { AnimatedWrapper } from 'components/AnimatedWrapper'
import { WithConnection } from 'components/connectWallet'
import { AjnaProductHubIntro } from 'features/ajna/common/components/AjnaProductHubIntro'
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
      <AnimatedWrapper sx={{ mb: 5 }}>
        <ProductHubView
          headerGradient={['#f154db', '#974eea']}
          initialProtocol={[LendingProtocol.Ajna]}
          product={product}
          promoCardsCollection="AjnaLP"
          intro={(selectedProduct, selectedToken) => (
            <AjnaProductHubIntro selectedProduct={selectedProduct} selectedToken={selectedToken} />
          )}
          token={token}
          url="/ajna/"
        />
      </AnimatedWrapper>
    </WithConnection>
  )
}
