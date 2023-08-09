import { AnimatedWrapper } from 'components/AnimatedWrapper'
import { WithConnection } from 'components/connectWallet'
import { WithFeatureToggleRedirect } from 'components/FeatureToggleRedirect'
import { PoolFinderView } from 'features/poolFinder/views/PoolFinderView'
import React from 'react'

export function AjnaPoolFinderController() {
  return (
    <WithFeatureToggleRedirect feature="AjnaPoolFinder">
      <WithConnection>
        <AnimatedWrapper sx={{ mb: 5 }}>
          <PoolFinderView />
        </AnimatedWrapper>
      </WithConnection>
    </WithFeatureToggleRedirect>
  )
}
