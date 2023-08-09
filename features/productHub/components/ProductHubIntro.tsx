import { AppLink } from 'components/Links'
import { WithArrow } from 'components/WithArrow'
import { productHubLinksMap } from 'features/productHub/meta'
import { ProductHubProductType } from 'features/productHub/types'
import React, { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { Text } from 'theme-ui'

interface ProductHubIntroProps {
  selectedProduct: ProductHubProductType
  selectedToken?: string
}

export const ProductHubIntro: FC<ProductHubIntroProps> = ({ selectedProduct }) => {
  const { t } = useTranslation()

  return (
    <Text
      as="p"
      variant="paragraph2"
      sx={{
        mx: 'auto',
        mt: '24px',
      }}
    >
      {t(`product-hub.intro.${selectedProduct}`)}{' '}
      <AppLink href={productHubLinksMap[selectedProduct]}>
        <WithArrow
          variant="paragraph2"
          sx={{
            display: 'inline-block',
            fontSize: 3,
            color: 'interactive100',
            fontWeight: 'regular',
          }}
        >
          Summer.fi {t(`nav.${selectedProduct}`)}
        </WithArrow>
      </AppLink>
    </Text>
  )
}
