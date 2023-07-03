import { HeaderSelector, HeaderSelectorOption } from 'components/HeaderSelector'
import { ALL_ASSETS, productHubOptionsMapFiltered } from 'features/productHub/meta'
import { ProductHubProductType } from 'features/productHub/types'
import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'
import React, { FC, useEffect, useRef, useState } from 'react'
import { Box, Heading } from 'theme-ui'

interface ProductHubNaturalLanguageSelectorControllerProps {
  gradient: [string, string, ...string[]]
  product: ProductHubProductType
  token?: string
  url?: string
  onChange?: (product: ProductHubProductType, token: string) => void
}

export const ProductHubNaturalLanguageSelectorController: FC<
  ProductHubNaturalLanguageSelectorControllerProps
> = ({ gradient, product, token, url, onChange }) => {
  const { t } = useTranslation()

  const [overwriteOption, setOverwriteOption] = useState<HeaderSelectorOption>()
  const [selectedProduct, setSelectedProduct] = useState<ProductHubProductType>(
    productHubOptionsMapFiltered[product].product.value as ProductHubProductType,
  )
  const [selectedToken, setSelectedToken] = useState<string>(
    (token ? productHubOptionsMapFiltered[product].tokens[token] : productHubOptionsMapFiltered[product].tokens.all)
      .value,
  )
  const ref = useRef<HTMLDivElement>(null)
  const { push } = useRouter()

  useEffect(() => {
    onChange && onChange(selectedProduct, selectedToken)
  }, [selectedProduct, selectedToken])

  return (
    <Box ref={ref}>
      <Heading as="h1" variant="header2" sx={{ position: 'relative', zIndex: 2 }}>
        {t('product-hub.header.i-want-to')}
        <HeaderSelector
          defaultOption={productHubOptionsMapFiltered[product].product}
          gradient={gradient}
          options={Object.values(productHubOptionsMapFiltered).map((option) => option.product)}
          parentRef={ref}
          withHeaders={true}
          onChange={(selected) => {
            const typedValue = selected.value as ProductHubProductType
            const tokenInUrl = selectedToken !== ALL_ASSETS ? selectedToken : undefined
            const isSwitchingToAllAssets = !Object.values(
              productHubOptionsMapFiltered[typedValue].tokens,
            ).some((option) => option.value === selectedToken)

            setSelectedProduct(typedValue)
            setOverwriteOption(
              isSwitchingToAllAssets ? productHubOptionsMapFiltered[typedValue].tokens.all : undefined,
            )
            if (url)
              void push(
                `${url}${selected.value}${
                  tokenInUrl && !isSwitchingToAllAssets ? `/${selectedToken}` : ''
                }`,
              )
          }}
        />
        {t(`product-hub.header.conjunction.${selectedProduct}`)}
        <HeaderSelector
          defaultOption={
            token
              ? productHubOptionsMapFiltered[product].tokens[token]
              : productHubOptionsMapFiltered[product].tokens.all
          }
          gradient={gradient}
          options={Object.values(productHubOptionsMapFiltered[selectedProduct].tokens)}
          overwriteOption={overwriteOption}
          parentRef={ref}
          valueAsLabel={true}
          onChange={(selected) => {
            const tokenInUrl = selected.value !== ALL_ASSETS ? selected.value : undefined

            setSelectedToken(selected.value)
            if (url) void push(`${url}${selectedProduct}${tokenInUrl ? `/${selected.value}` : ''}`)
          }}
        />
      </Heading>
    </Box>
  )
}
