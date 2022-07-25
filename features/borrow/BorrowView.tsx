import { useTranslation } from 'next-i18next'
import React from 'react'
import { Grid } from 'theme-ui'

import { ProductCardBorrow } from '../../components/productCards/ProductCardBorrow'
import { ProductCardsFilter } from '../../components/productCards/ProductCardsFilter'
import { ProductHeader } from '../../components/ProductHeader'
import { borrowPageCardsData, productCardsConfig } from '../../helpers/productCards'

export function BorrowView() {
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
        title={t('product-page.borrow.title')}
        description={t('product-page.borrow.description')}
        link={{
          href: 'https://kb.oasis.app/help/what-is-oasis-borrow ',
          text: t('product-page.borrow.link'),
        }}
        scrollToId={tab}
      />
      <ProductCardsFilter
        filters={productCardsConfig.borrow.cardsFilters}
        selectedFilter={tab}
        productCardComponent={ProductCardBorrow}
        filterCardsFunction={borrowPageCardsData}
      />
    </Grid>
  )
}
