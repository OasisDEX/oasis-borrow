import { Icon } from 'components/Icon'
import { Tabs } from 'components/Tabs'
import type { OmniProductType } from 'features/omni-kit/types'
import { productHubCategories, productHubCategoryAll } from 'features/productHub/meta'
import { ProductHubCategory, type ProductHubFilters } from 'features/productHub/types'
import { useTranslation } from 'next-i18next'
import type { FC } from 'react'
import React from 'react'
import { doc, plant, relock, sparks_empty } from 'theme/icons'
import { Flex } from 'theme-ui'

interface ProductHubCategoryControllerProps {
  selectedFilters: ProductHubFilters
  selectedProduct: OmniProductType
  onChange: (selectedFilters: ProductHubFilters) => void
}

const iconsMap = {
  sparks_empty,
  relock,
  plant,
  doc,
}

export const ProductHubCategoryController: FC<
  ProductHubCategoryControllerProps
> = ({ onChange, selectedFilters, selectedProduct }) => {
  const { t } = useTranslation()

  return (
    <Tabs<string>
      defaultId={selectedFilters.category?.[0] ?? ProductHubCategory.All}
      dependency={[selectedProduct]}
      items={[productHubCategoryAll, ...productHubCategories[selectedProduct]].map(
        ({ icon, id }) => ({
          content: (isSelected) => (
            <Flex
              as="span"
              variant="text.boldParagraph2"
              sx={{
                justifyContent: 'center',
                columnGap: 2,
                color: isSelected ? 'primary100' : 'neutral80',
                transition: '200ms color',
                '&:hover': {
                  color: 'primary100',
                },
              }}
            >
              {icon in iconsMap && (
                <Icon icon={iconsMap[icon as keyof typeof iconsMap]} size="24px" />
              )}
              {t(`product-hub.categories.${id}`)}
            </Flex>
          ),
          id,
        }),
      )}
      onClick={(selectedCategory) =>
        onChange({
          ...selectedFilters,
          category: selectedCategory === productHubCategoryAll.id ? [] : [selectedCategory],
        })
      }
      underlinePadding="20px"
      sx={{ justifyContent: 'center', mb: '-1px' }}
    />
  )
}
