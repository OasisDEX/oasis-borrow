import { AnimatedWrapper } from 'components/AnimatedWrapper'
import { WithConnection } from 'components/connectWallet'
import type { ProductHubProductType } from 'features/productHub/types'
import { ProductHubView } from 'features/productHub/views'
import { useAppConfig } from 'helpers/config'
import { LendingProtocol } from 'lendingProtocols'
import React from 'react'

interface AjnaProductHubControllerProps {
  product: ProductHubProductType
  token?: string
}

export function AjnaProductHubController({ product, token }: AjnaProductHubControllerProps) {
  const { AjnaSafetySwitch: ajnaSafetySwitchOn } = useAppConfig('features')

  return (
    <WithConnection>
      <AnimatedWrapper sx={{ mb: 5 }}>
        <ProductHubView
          headerGradient={['#f154db', '#974eea']}
          initialProtocol={[LendingProtocol.Ajna]}
          product={product}
          promoCardsCollection={ajnaSafetySwitchOn ? 'Home' : 'AjnaLP'}
          token={token}
          url="/ajna/"
        />
      </AnimatedWrapper>
    </WithConnection>
  )
}
