import 'rc-slider/assets/index.css'

import { OmniProductType } from 'features/omni-kit/types'
import { ProductHabTagButton, ProductHubTagLiquidity } from 'features/productHub/components'
import { productHubTags } from 'features/productHub/meta'
import { type ProductHubFilters } from 'features/productHub/types'
import type { FC } from 'react'
import React from 'react'
import { Flex } from 'theme-ui'

interface ProductHubTagsControllerProps {
  selectedFilters: ProductHubFilters
  selectedProduct: OmniProductType
  onChange: (selectedFilters: ProductHubFilters) => void
}

export const ProductHubTagsController: FC<ProductHubTagsControllerProps> = ({
  onChange,
  selectedFilters,
  selectedProduct,
}) => {
  return (
    <Flex
      as="ul"
      sx={{
        position: 'relative',
        flexWrap: 'wrap',
        gap: 2,
        m: 0,
        px: 0,
        py: 3,
        borderBottom: '1px solid',
        borderBottomColor: 'neutral20',
        listStyle: 'none',
        zIndex: 1,
      }}
    >
      {selectedProduct !== OmniProductType.Earn && (
        <ProductHubTagLiquidity onChange={onChange} selectedFilters={selectedFilters} />
      )}
      {productHubTags[selectedProduct].map((tag) => (
        <ProductHabTagButton
          key={tag}
          onChange={onChange}
          selectedFilters={selectedFilters}
          tag={tag}
        />
      ))}
    </Flex>
  )
}
