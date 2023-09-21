// @ts-ignore
import { MDXProvider } from '@mdx-js/react'
import { CustomMDXLink } from 'components/CustomMDXLink'
import { WithFollowVaults } from 'features/follow/view/WithFollowVaults'
import type { WithChildren } from 'helpers/types/With.types'
import React from 'react'
// @ts-ignore
import { components } from 'theme-ui'

import { DeferedContextProvider } from './DeferedContextProvider'
import { FunctionalContextHandler } from './FunctionalContextHandler'
import { productContext, ProductContextProvider } from './ProductContextProvider'

export const ProductContextHandler = ({ children }: WithChildren) => {
  // theese are needed on the opening/managing positions page, but not on the static pages
  return (
    <MDXProvider components={{ ...components, a: CustomMDXLink }}>
      <FunctionalContextHandler>
        <ProductContextProvider>
          <WithFollowVaults>
            <DeferedContextProvider context={productContext}>{children}</DeferedContextProvider>
          </WithFollowVaults>
        </ProductContextProvider>
      </FunctionalContextHandler>
    </MDXProvider>
  )
}
