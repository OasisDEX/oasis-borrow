import { HeaderSelector } from 'components/HeaderSelector'
import { productHubOptionsMapFiltered } from 'features/productHub/meta'
import { ProductHubProductType } from 'features/productHub/types'
import { useTranslation } from 'next-i18next'
import React, { FC, useEffect, useRef, useState } from 'react'
import { Box, Heading } from 'theme-ui'

interface PoolFinderNaturalLanguageSelectorControllerProps {
  gradient: [string, string, ...string[]]
  product: ProductHubProductType
  onChange?: (product: ProductHubProductType) => void
}

export const PoolFinderNaturalLanguageSelectorController: FC<
  PoolFinderNaturalLanguageSelectorControllerProps
> = ({ gradient, product, onChange }) => {
  const { t } = useTranslation()

  const [selectedProduct, setSelectedProduct] = useState<ProductHubProductType>(
    ProductHubProductType.Borrow,
  )
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    onChange && onChange(selectedProduct)
  }, [selectedProduct])

  return (
    <Box ref={ref}>
      <Heading as="h1" variant="header2" sx={{ position: 'relative', zIndex: 2 }}>
        {t('product-hub.header.i-want-to')}
        <HeaderSelector
          defaultOption={productHubOptionsMapFiltered[product].product}
          gradient={gradient}
          options={Object.values([
            productHubOptionsMapFiltered.borrow,
            productHubOptionsMapFiltered.earn,
          ]).map((option) => option.product)}
          parentRef={ref}
          withHeaders={true}
          onChange={(selected) => {
            setSelectedProduct(selected.value as ProductHubProductType)
          }}
        />
        , how about that?
      </Heading>
    </Box>
  )
}
