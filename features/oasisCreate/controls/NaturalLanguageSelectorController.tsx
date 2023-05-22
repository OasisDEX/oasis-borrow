import { HeaderSelector, HeaderSelectorOption } from 'components/HeaderSelector'
import { ALL_ASSETS, oasisCreateOptionsMap } from 'features/oasisCreate/meta'
import { ProductType } from 'features/oasisCreate/types'
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
    oasisCreateOptionsMap[product].product.value as ProductType,
  )
  const [selectedToken, setSelectedToken] = useState<string>(
    (token
      ? oasisCreateOptionsMap[product].tokens[token]
      : oasisCreateOptionsMap[product].tokens.all
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
        {t('oasis-create.header.i-want-to')}
        <HeaderSelector
          defaultOption={oasisCreateOptionsMap[product].product}
          gradient={['#2a30ee', '#a4a6ff']}
          options={Object.values(oasisCreateOptionsMap).map((option) => option.product)}
          parentRef={ref}
          withHeaders={true}
          onChange={(selected) => {
            const typedValue = selected.value as ProductType
            const tokenInUrl = selectedToken !== ALL_ASSETS ? selectedToken : undefined
            const isSwitchingToAllAssets = !Object.values(
              oasisCreateOptionsMap[typedValue].tokens,
            ).some((option) => option.value === selectedToken)

            setSelectedProduct(typedValue)
            setOverwriteOption(
              isSwitchingToAllAssets ? oasisCreateOptionsMap[typedValue].tokens.all : undefined,
            )
            if (url)
              void push(
                `${url}${selected.value}${
                  tokenInUrl && !isSwitchingToAllAssets ? `/${selectedToken}` : ''
                }`,
              )
          }}
        />
        {t(`oasis-create.header.conjunction.${selectedProduct}`)}
        <HeaderSelector
          defaultOption={
            token
              ? oasisCreateOptionsMap[product].tokens[token]
              : oasisCreateOptionsMap[product].tokens.all
          }
          gradient={['#2a30ee', '#a4a6ff']}
          options={Object.values(oasisCreateOptionsMap[selectedProduct].tokens)}
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
