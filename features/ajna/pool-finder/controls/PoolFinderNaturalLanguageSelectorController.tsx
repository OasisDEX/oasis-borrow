import { HeaderSelector } from 'components/HeaderSelector'
import type { OmniProductType } from 'features/omni-kit/types'
import { productHubProductOptions } from 'features/productHub/meta'
import { INTERNAL_LINKS } from 'helpers/applicationLinks'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import type { FC } from 'react'
import React, { useRef } from 'react'
import { Box, Heading } from 'theme-ui'

interface PoolFinderNaturalLanguageSelectorControllerProps {
  gradient: [string, string, ...string[]]
  product: OmniProductType
  onChange?: (product: OmniProductType) => void
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
          defaultOption={productHubProductOptions[product]}
          gradient={gradient}
          options={Object.values([
            productHubProductOptions.borrow,
            productHubProductOptions.earn,
          ]).map((option) => option)}
          parentRef={ref}
          withHeaders={true}
          onChange={(selected) => {
            onChange && onChange(selected.value as OmniProductType)
            void push(`${INTERNAL_LINKS.ajnaPoolFinder}/${selected.value}`)
          }}
        />
        {t('pool-finder.header.using-ajna')}
      </Heading>
    </Box>
  )
}
