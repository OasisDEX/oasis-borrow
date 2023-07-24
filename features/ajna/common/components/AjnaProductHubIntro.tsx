import { AppLink } from 'components/Links'
import { WithArrow } from 'components/WithArrow'
import { productHubLinksMap } from 'features/productHub/meta'
import { ProductHubProductType } from 'features/productHub/types'
import React, { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { Box, Text } from 'theme-ui'

interface AjnaProductHubIntroProps {
  selectedProduct: ProductHubProductType
  selectedToken: string
}

export const AjnaProductHubIntro: FC<AjnaProductHubIntroProps> = ({ selectedProduct }) => {
  const { t } = useTranslation()

  return (
    <Box sx={{ my: 5 }}>
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
    </Box>
  )
}
