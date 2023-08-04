import { WithChildren } from 'helpers/types'
import React from 'react'

import { DeferedContextProvider } from './DeferedContextProvider'
import { FunctionalContextProvider } from './FunctionalContextProvider'
import { productContext, ProductContextProvider } from './ProductContextProvider'

export const PositionContextProvider = ({ children }: WithChildren) => {
  // theese are needed on the opening/managing positions page, but not on the static pages
  return (
    <FunctionalContextProvider>
      <ProductContextProvider>
        <DeferedContextProvider context={productContext}>{children}</DeferedContextProvider>
      </ProductContextProvider>
    </FunctionalContextProvider>
  )
}
