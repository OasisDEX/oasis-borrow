import { AppLink } from 'components/Links'
import { ProductCardMultiplyMaker } from 'components/productCards/ProductCardMultiplyMaker'
import { ProductCardsFilter } from 'components/productCards/ProductCardsFilter'
import { ProductHeader } from 'components/ProductHeader'
import { aaveStrategiesList } from 'features/aave/strategyConfig'
import { EXTERNAL_LINKS } from 'helpers/applicationLinks'
import { multiplyPageCardsData, productCardsConfig } from 'helpers/productCards'
import { LendingProtocol } from 'lendingProtocols'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Grid, Text } from 'theme-ui'

export function MultiplyView() {
  const { t } = useTranslation()
  const tab = window.location.hash.replace(/^#/, '')
  const aaveMultiplyStrategies = aaveStrategiesList('Multiply', LendingProtocol.AaveV2)

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
          href: EXTERNAL_LINKS.KB.WHAT_IS_MULTIPLY,
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
          href={EXTERNAL_LINKS.BLOG.MULTIPLY_FOR_AAVE}
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
