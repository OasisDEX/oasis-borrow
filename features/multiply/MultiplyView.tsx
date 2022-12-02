import { getTokens } from 'blockchain/tokensMetadata'
import { aaveStrategiesList } from 'features/aave/strategyConfig'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Grid } from 'theme-ui'

import { ProductCardMultiplyMaker } from '../../components/productCards/ProductCardMultiplyMaker'
import { ProductCardsFilter } from '../../components/productCards/ProductCardsFilter'
import { ProductHeader } from '../../components/ProductHeader'
import { multiplyPageCardsData, productCardsConfig } from '../../helpers/productCards'

export function MultiplyView() {
  const { t } = useTranslation()
  const tab = window.location.hash.replace(/^#/, '')
  const aaveMultiplyStrategies = getTokens(aaveStrategiesList('multiply').map(({ name }) => name))

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
        makerProductCardComponent={ProductCardMultiplyMaker}
        filterCardsFunction={multiplyPageCardsData}
        otherStrategies={aaveMultiplyStrategies}
      />
    </Grid>
  )
}
