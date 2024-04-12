import { AppLink } from 'components/Links'
import { WithArrow } from 'components/WithArrow'
import type { OmniProductType } from 'features/omni-kit/types'
import type { ParsedUrlQueryInput } from 'querystring'
import React, { type FC } from 'react'
import { useTranslation } from 'react-i18next'
import { Flex } from 'theme-ui'

interface ProductHubViewAllProps {
  selectedProduct: OmniProductType
  query: ParsedUrlQueryInput
}

export const ProductHubViewAll: FC<ProductHubViewAllProps> = ({ query, selectedProduct }) => {
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
      <AppLink href={`/${selectedProduct}`} query={query}>
        <WithArrow sx={{ color: 'interactive100', fontWeight: 'regular', fontSize: '16px' }}>
          {t('view-all')}
        </WithArrow>
      </AppLink>
    </Flex>
  )
}
