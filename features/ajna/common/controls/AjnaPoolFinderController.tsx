import { AnimatedWrapper } from 'components/AnimatedWrapper'
import { WithConnection } from 'components/connectWallet'
import { PoolFinderView } from 'features/poolFinder/views/PoolFinderView'
import { ProductHubProductType } from 'features/productHub/types'
import React from 'react'

interface AjnaPoolFinderControllerProps {
  product: ProductHubProductType
}

export function AjnaPoolFinderController({ product }: AjnaPoolFinderControllerProps) {
  return (
    <WithConnection>
      <AnimatedWrapper sx={{ mb: 5 }}>
        <PoolFinderView product={product} />
      </AnimatedWrapper>
    </WithConnection>
  )
}
