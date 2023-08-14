import { AnimatedWrapper } from 'components/AnimatedWrapper'
import { WithConnection } from 'components/connectWallet'
import { WithFeatureToggleRedirect } from 'components/FeatureToggleRedirect'
import { PoolFinderView } from 'features/poolFinder/views/PoolFinderView'
import { ProductHubProductType } from 'features/productHub/types'
import React from 'react'

export function AjnaPoolFinderController() {
  return (
    <WithFeatureToggleRedirect feature="AjnaPoolFinder">
      <WithConnection>
        <AnimatedWrapper sx={{ mb: 5 }}>
          <PoolFinderView product={ProductHubProductType.Borrow} />
        </AnimatedWrapper>
      </WithConnection>
    </WithFeatureToggleRedirect>
  )
}
