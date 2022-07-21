import { useTranslation } from 'next-i18next'
import React from 'react'
import { Flex, Grid } from 'theme-ui'

import { useAppContext } from '../../components/AppContextProvider'
import { ProductCardMultiply } from '../../components/ProductCardMultiply'
import { ProductCardsFilter } from '../../components/ProductCardsFilter'
import { ProductCardsWrapper } from '../../components/ProductCardsWrapper'
import { ProductHeader } from '../../components/ProductHeader'
import { AppSpinner, WithLoadingIndicator } from '../../helpers/AppSpinner'
import { WithErrorHandler } from '../../helpers/errorHandlers/WithErrorHandler'
import { useObservable } from '../../helpers/observableHook'
import {
  borrowPageCardsData,
  multiplyPageCardsData,
  productCardsConfig,
} from '../../helpers/productCards'
import { ProductCardBorrow } from '../../components/ProductCardBorrow'

export function MultiplyView() {
  const { t } = useTranslation()
  const tab = window.location.hash.replace(/^#/, '')

  return (
    <Grid
      sx={{
        flex: 1,
        position: 'relative',
        mb: ['123px', '187px'],
      }}
    >
      <ProductHeader
        title={t('product-page.multiply.title')}
        description={t('product-page.multiply.description')}
        link={{
          href: 'https://kb.oasis.app/help/what-is-multiply',
          text: t('product-page.multiply.link'),
        }}
        scrollToId={tab}
      />
      <ProductCardsFilter
        filters={productCardsConfig.multiply.cardsFilters}
        selectedFilter={tab}
        productCardComponent={ProductCardMultiply}
        filterCards={multiplyPageCardsData}
      />
    </Grid>
  )
}
