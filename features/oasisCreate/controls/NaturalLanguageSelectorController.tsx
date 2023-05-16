import { HeaderSelector, HeaderSelectorOption } from 'components/HeaderSelector'
import { oasisCreateOptionsMap } from 'features/oasisCreate/meta'
import { ProductType } from 'features/oasisCreate/types'
import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'
import React, { useEffect, useRef, useState } from 'react'
import { Box, Heading } from 'theme-ui'

interface NaturalLanguageSelectorControllerProps {
  product: ProductType
  url?: string
  onChange?: (product: ProductType, token: string) => void
}

export function NaturalLanguageSelectorController({
  product,
  url,
  onChange,
}: NaturalLanguageSelectorControllerProps) {
  const { t } = useTranslation()

  const [overwriteOption, setOverwriteOption] = useState<HeaderSelectorOption>()
  const [selectedProduct, setSelectedProduct] = useState<ProductType>(
    oasisCreateOptionsMap[product].product.value as ProductType,
  )
  const [selectedToken, setSelectedToken] = useState<string>(
    oasisCreateOptionsMap[product].tokens[0].value,
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

            setSelectedProduct(typedValue)
            setOverwriteOption(
              !oasisCreateOptionsMap[typedValue].tokens.some(
                (option) => option.value === selectedToken,
              )
                ? oasisCreateOptionsMap[typedValue].tokens[0]
                : undefined,
            )
            if (url) void push(`${url}${selected.value}`)
          }}
        />
        {t('oasis-create.header.with')}
        <HeaderSelector
          gradient={['#2a30ee', '#a4a6ff']}
          options={oasisCreateOptionsMap[selectedProduct].tokens}
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
