import React from 'react'
import { AnimatedWrapper } from 'components/AnimatedWrapper'
import { WithConnection } from 'components/connectWallet'
import { ProductHubProductType } from 'features/productHub/types'
import { ProductHubView } from 'features/productHub/views'
import { useFeatureToggle } from 'helpers/useFeatureToggle'
import { LendingProtocol } from 'lendingProtocols'

interface AjnaProductHubControllerProps {
  product: ProductHubProductType
  token?: string
}

export function AjnaProductHubController({ product, token }: AjnaProductHubControllerProps) {
  const ajnaSafetySwitchOn = useFeatureToggle('AjnaSafetySwitch')

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
