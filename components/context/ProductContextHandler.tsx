import React from 'react'
import { DeferedContextProvider } from 'components/context/DeferedContextProvider'
import { FunctionalContextHandler } from 'components/context/FunctionalContextHandler'
import { productContext, ProductContextProvider } from 'components/context/ProductContextProvider'
import { WithChildren } from 'helpers/types'

export const ProductContextHandler = ({ children }: WithChildren) => {
  // theese are needed on the opening/managing positions page, but not on the static pages
  return (
    <FunctionalContextHandler>
      <ProductContextProvider>
        <DeferedContextProvider context={productContext}>{children}</DeferedContextProvider>
      </ProductContextProvider>
    </FunctionalContextHandler>
  )
}
