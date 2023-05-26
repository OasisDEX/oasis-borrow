import { HeaderSelector, HeaderSelectorOption } from 'components/HeaderSelector'
import { ALL_ASSETS, productHubOptionsMap } from 'features/productHub/meta'
import { ProductType } from 'features/productHub/types'
import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'
import React, { useEffect, useRef, useState } from 'react'
import { Box, Heading } from 'theme-ui'

interface NaturalLanguageSelectorControllerProps {
  product: ProductType
  token?: string
  url?: string
  onChange?: (product: ProductType, token: string) => void
}

export function NaturalLanguageSelectorController({
  product,
  token,
  url,
  onChange,
}: NaturalLanguageSelectorControllerProps) {
  const { t } = useTranslation()

  const [overwriteOption, setOverwriteOption] = useState<HeaderSelectorOption>()
  const [selectedProduct, setSelectedProduct] = useState<ProductType>(
    productHubOptionsMap[product].product.value as ProductType,
  )
  const [selectedToken, setSelectedToken] = useState<string>(
    (token
      ? productHubOptionsMap[product].tokens[token]
      : productHubOptionsMap[product].tokens.all
    ).value,
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
          defaultOption={productHubOptionsMap[product].product}
          gradient={['#2a30ee', '#a4a6ff']}
          options={Object.values(productHubOptionsMap).map((option) => option.product)}
          parentRef={ref}
          withHeaders={true}
          onChange={(selected) => {
            const typedValue = selected.value as ProductType
            const tokenInUrl = selectedToken !== ALL_ASSETS ? selectedToken : undefined
            const isSwitchingToAllAssets = !Object.values(
              productHubOptionsMap[typedValue].tokens,
            ).some((option) => option.value === selectedToken)

            setSelectedProduct(typedValue)
            setOverwriteOption(
              isSwitchingToAllAssets ? productHubOptionsMap[typedValue].tokens.all : undefined,
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
              ? productHubOptionsMap[product].tokens[token]
              : productHubOptionsMap[product].tokens.all
          }
          gradient={['#2a30ee', '#a4a6ff']}
          options={Object.values(productHubOptionsMap[selectedProduct].tokens)}
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
