import { trackingEvents } from 'analytics/trackingEvents'
import { MixpanelProductHubChangeFilter } from 'analytics/types'
import { Tabs } from 'components/Tabs'
import { OmniProductType } from 'features/omni-kit/types'
import { upperFirst } from 'lodash'
import type { FC } from 'react'
import React from 'react'
import { Text } from 'theme-ui'

interface ProductHubProductTypeControllerProps {
  defaultProduct: OmniProductType
  gradient: [string, string, ...string[]]
  onChange: (product: OmniProductType) => void
}

export const ProductHubProductTypeController: FC<ProductHubProductTypeControllerProps> = ({
  gradient,
  onChange,
  defaultProduct,
}) => {
  return (
    <Tabs<OmniProductType>
      defaultId={defaultProduct}
      gap={5}
      items={Object.values(OmniProductType).map((productType) => ({
        content: (isSelected) => (
          <Text
            variant="header2"
            sx={{
              color: isSelected ? 'primary100' : 'neutral80',
              transition: '200ms color',
              '&:hover': {
                color: 'primary100',
              },
            }}
          >
            {upperFirst(productType)}
          </Text>
        ),
        id: productType,
      }))}
      onClick={(_selectedProduct) => {
        onChange(_selectedProduct)
        trackingEvents.productHub.filterChange(
          MixpanelProductHubChangeFilter.ProductType,
          _selectedProduct,
        )
      }}
      underlineGradient={gradient}
      underlinePadding="12px"
      underlineSize="3px"
      sx={{ justifyContent: 'center' }}
    />
  )
}
