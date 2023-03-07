import { ProductCardBorrow } from 'components/productCards/ProductCardBorrow'
import { ProductCardsFilter } from 'components/productCards/ProductCardsFilter'
import { ProductHeader } from 'components/ProductHeader'
import { aaveStrategiesList } from 'features/aave/strategyConfig'
import { EXTERNAL_LINKS } from 'helpers/applicationLinks'
import { borrowPageCardsData, productCardsConfig } from 'helpers/productCards'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Grid } from 'theme-ui'

export function BorrowView() {
  const { t } = useTranslation()
  const tab = window.location.hash.replace(/^#/, '')
  const aaveBorrowStrategies = aaveStrategiesList('Borrow')

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
          href: EXTERNAL_LINKS.KB.WHAT_IS_BORROW,
          text: t('product-page.borrow.link'),
        }}
        scrollToId={tab}
      />
      <ProductCardsFilter
        filters={productCardsConfig.borrow.cardsFilters}
        selectedFilter={tab}
        makerProductCardComponent={ProductCardBorrow}
        filterCardsFunction={borrowPageCardsData}
        otherStrategies={aaveBorrowStrategies}
      />
    </Grid>
  )
}
