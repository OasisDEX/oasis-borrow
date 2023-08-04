import { WithChildren } from 'helpers/types'
import React from 'react'

import { DeferedContextProvider } from './DeferedContextProvider'
import { productContext, ProductContextProvider } from './ProductContextProvider'
import { tosContext, TOSContextProvider } from './TOSContextProvider'

export const PositionContextProvider = ({ children }: WithChildren) => {
  // theese are needed on the opening/managing positions page, but not on the static pages
  return (
    <TOSContextProvider>
      <DeferedContextProvider context={tosContext}>
        <ProductContextProvider>
          <DeferedContextProvider context={productContext}>{children}</DeferedContextProvider>
        </ProductContextProvider>
      </DeferedContextProvider>
    </TOSContextProvider>
  )
}
