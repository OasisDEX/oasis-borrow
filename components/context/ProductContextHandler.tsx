// @ts-ignore

import type { NetworkIds } from 'blockchain/networks'
import { WithFollowVaults } from 'features/follow/view/WithFollowVaults'
import type { PropsWithChildren } from 'react'
import React from 'react'

import { DeferedContextProvider } from './DeferedContextProvider'
import { FunctionalContextHandler } from './FunctionalContextHandler'
import { productContext, ProductContextProvider } from './ProductContextProvider'

export const ProductContextHandler = ({
  children,
  networkId,
}: PropsWithChildren<{ networkId: NetworkIds }>) => {
  // theese are needed on the opening/managing positions page, but not on the static pages
  return (
    <FunctionalContextHandler>
      <ProductContextProvider networkId={networkId}>
        <WithFollowVaults>
          <DeferedContextProvider context={productContext}>{children}</DeferedContextProvider>
        </WithFollowVaults>
      </ProductContextProvider>
    </FunctionalContextHandler>
  )
}
