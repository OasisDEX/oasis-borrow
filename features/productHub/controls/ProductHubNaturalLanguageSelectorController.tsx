import type { HeaderSelectorOption } from 'components/HeaderSelector'
import { HeaderSelector } from 'components/HeaderSelector'
import { productHubOptionsMap } from 'features/productHub/meta'
import type { ProductHubProductType } from 'features/productHub/types'
import { useTranslation } from 'next-i18next'
import type { FC } from 'react'
import React, { useEffect, useRef, useState } from 'react'
import { Box, Heading } from 'theme-ui'

interface ProductHubNaturalLanguageSelectorControllerProps {
  gradient: [string, string, ...string[]]
  product: ProductHubProductType
  token?: string
  onChange?: (product: ProductHubProductType, token: string) => void
}

export const ProductHubNaturalLanguageSelectorController: FC<
  ProductHubNaturalLanguageSelectorControllerProps
> = ({ gradient, product, token, onChange }) => {
  const { t } = useTranslation()

  const [overwriteOption, setOverwriteOption] = useState<HeaderSelectorOption>()
  const [selectedProduct, setSelectedProduct] = useState<ProductHubProductType>(
    productHubOptionsMap[product].product.value as ProductHubProductType,
  )
  const [selectedToken, setSelectedToken] = useState<string>(
    (token ? productHubOptionsMap[product].tokens[token] : productHubOptionsMap[product].tokens.all)
      .value,
  )
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    onChange && onChange(selectedProduct, selectedToken)
  }, [selectedProduct, selectedToken])

  return (
    <Box ref={ref}>
      <Heading as="h1" variant="header2" sx={{ position: 'relative', zIndex: 2 }}>
        {t('product-hub.header.i-want-to')}
        <HeaderSelector
          defaultOption={productHubOptionsMap[product].product}
          gradient={gradient}
          options={Object.values(productHubOptionsMap).map((option) => option.product)}
          parentRef={ref}
          withHeaders={true}
          onChange={(selected) => {
            const typedValue = selected.value as ProductHubProductType
            const isSwitchingToAllAssets = !Object.values(
              productHubOptionsMap[typedValue].tokens,
            ).some((option) => option.value === selectedToken)

            setSelectedProduct(typedValue)
            setOverwriteOption(
              isSwitchingToAllAssets ? productHubOptionsMap[typedValue].tokens.all : undefined,
            )
          }}
        />
        {t(`product-hub.header.conjunction.${selectedProduct}`)}
        <HeaderSelector
          defaultOption={
            token
              ? productHubOptionsMap[product].tokens[token]
              : productHubOptionsMap[product].tokens.all
          }
          gradient={gradient}
          options={Object.values(productHubOptionsMap[selectedProduct].tokens)}
          overwriteOption={overwriteOption}
          parentRef={ref}
          valueAsLabel={true}
          onChange={(selected) => {
            setSelectedToken(selected.value)
          }}
        />
      </Heading>
    </Box>
  )
}
