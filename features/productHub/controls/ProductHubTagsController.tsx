import type { OmniProductType } from 'features/omni-kit/types'
import { productHubTags } from 'features/productHub/meta'
import { type ProductHubFilters } from 'features/productHub/types'
import { useTranslation } from 'next-i18next'
import type { FC } from 'react'
import React from 'react'
import { Box, Button, Flex } from 'theme-ui'

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
  const { t } = useTranslation()

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
      {productHubTags[selectedProduct].map((tag) => (
        <Box as="li">
          <Button
            variant={selectedFilters['tags']?.includes(tag) ? 'actionActive' : 'action'}
            sx={{
              px: 3,
              color: 'neutral80',
              '&:hover': {
                color: 'primary100',
              },
            }}
            onClick={() => {
              const tags = selectedFilters['tags'] ?? []

              onChange({
                ...selectedFilters,
                tags: tags.includes(tag) ? tags.filter((_tag) => _tag !== tag) : [...tags, tag],
              })
            }}
          >
            {t(`product-hub.tags.${tag}`)}
          </Button>
        </Box>
      ))}
    </Flex>
  )
}
