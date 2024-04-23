import { AppLink } from 'components/Links'
import { WithArrow } from 'components/WithArrow'
import type { OmniProductType } from 'features/omni-kit/types'
import { productHubLinksMap } from 'features/productHub/meta'
import React, { type FC } from 'react'
import { useTranslation } from 'react-i18next'
import { Text } from 'theme-ui'

interface ProductHubIntroProps {
  selectedProduct: OmniProductType
}

export const ProductHubIntro: FC<ProductHubIntroProps> = ({ selectedProduct }) => {
  const { t } = useTranslation()

  return (
    <Text
      as="p"
      variant="paragraph1"
      sx={{
        mx: 'auto',
        mt: '24px',
      }}
    >
      {t(`product-hub.intro.${selectedProduct}`)}
      <br />
      {t('product-hub.intro.read-more')}{' '}
      <AppLink href={productHubLinksMap[selectedProduct]} sx={{ pr: 3 }}>
        <WithArrow
          variant="paragraph1"
          sx={{
            display: 'inline-block',
            fontSize: 4,
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
