import { AppLink } from 'components/Links'
import { WithArrow } from 'components/WithArrow'
import { ALL_ASSETS } from 'features/productHub/meta'
import type { FC } from 'react'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Flex } from 'theme-ui'

interface ProductHubViewAllProps {
  query: {
    [key: string]: string
  }
  selectedProduct: string
  selectedToken?: string
}

export const ProductHubViewAll: FC<ProductHubViewAllProps> = ({
  query,
  selectedProduct,
  selectedToken,
}) => {
  const { t } = useTranslation()

  return (
    <Flex
      sx={{
        justifyContent: 'center',
        py: 4,
        borderBottom: '1px solid',
        borderBottomColor: 'neutral20',
      }}
    >
      <AppLink
        href={
          selectedToken === ALL_ASSETS
            ? `/${selectedProduct}`
            : `/${selectedProduct}/${selectedToken}`
        }
        query={query}
      >
        <WithArrow sx={{ color: 'interactive100', fontWeight: 'regular', fontSize: '16px' }}>
          {t('view-all')}
        </WithArrow>
      </AppLink>
    </Flex>
  )
}
