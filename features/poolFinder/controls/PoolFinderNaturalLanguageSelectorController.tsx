import { HeaderSelector } from 'components/HeaderSelector'
import { productHubOptionsMapFiltered } from 'features/productHub/meta'
import { ProductHubProductType } from 'features/productHub/types'
import { INTERNAL_LINKS } from 'helpers/applicationLinks'
import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'
import React, { FC, useRef } from 'react'
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
  const ref = useRef<HTMLDivElement>(null)
  const { push } = useRouter()

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
            onChange && onChange(selected.value as ProductHubProductType)
            void push(`${INTERNAL_LINKS.ajnaPoolFinder}/${selected.value}`)
          }}
        />
        {t('pool-finder.header.using-ajna')}
      </Heading>
    </Box>
  )
}
