import { HeaderSelector } from 'components/HeaderSelector'
import { productHubOptionsMap } from 'features/productHub/meta'
import type { ProductHubProductType } from 'features/productHub/types'
import { INTERNAL_LINKS } from 'helpers/applicationLinks'
import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'
import type { FC } from 'react'
import React, { useRef } from 'react'
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
          defaultOption={productHubOptionsMap[product].product}
          gradient={gradient}
          options={Object.values([productHubOptionsMap.borrow, productHubOptionsMap.earn]).map(
            (option) => option.product,
          )}
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
