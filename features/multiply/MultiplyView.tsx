import { AppLink } from 'components/Links'
import { aaveStrategiesList } from 'features/aave/strategyConfig'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Grid, Text } from 'theme-ui'

import { ProductCardMultiplyMaker } from '../../components/productCards/ProductCardMultiplyMaker'
import { ProductCardsFilter } from '../../components/productCards/ProductCardsFilter'
import { ProductHeader } from '../../components/ProductHeader'
import { multiplyPageCardsData, productCardsConfig } from '../../helpers/productCards'

export function MultiplyView() {
  const { t } = useTranslation()
  const tab = window.location.hash.replace(/^#/, '')
  const aaveMultiplyStrategies = aaveStrategiesList('Multiply')

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

      <Text
        variant="paragraph1"
        sx={{
          color: 'neutral80',
          mt: '-50px',
          textAlign: 'center',
        }}
      >
        {t('product-page.multiply.aaveDescription')}{' '}
        <AppLink
          href="https://blog.oasis.app/introducing-oasis-multiply-for-aave/"
          sx={{ fontSize: 4, fontWeight: 'body' }}
        >
          {t('product-page.multiply.aaveLink')}
        </AppLink>
      </Text>

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
