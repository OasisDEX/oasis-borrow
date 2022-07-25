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
import { multiplyPageCardsData, productCardsConfig } from '../../helpers/productCards'

export function MultiplyView() {
  const { t } = useTranslation()
  const { productCardsData$ } = useAppContext()
  const [productCardsDataValue, productCardsDataError] = useObservable(productCardsData$)
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
      <WithErrorHandler error={[productCardsDataError]}>
        <WithLoadingIndicator
          value={[productCardsDataValue]}
          customLoader={
            <Flex sx={{ alignItems: 'flex-start', justifyContent: 'center', height: '500px' }}>
              <AppSpinner sx={{ mt: 5 }} variant="styles.spinner.large" />
            </Flex>
          }
        >
          {([productCardsData]) => (
            <ProductCardsFilter
              filters={productCardsConfig.multiply.cardsFilters.filter((f) => f.name !== 'UNI LP')}
              selectedFilter={tab}
            >
              {(cardsFilter) => {
                const filteredCards = multiplyPageCardsData({
                  productCardsData,
                  cardsFilter,
                })

                return (
                  <ProductCardsWrapper>
                    {filteredCards.map((cardData) => (
                      <ProductCardMultiply cardData={cardData} key={cardData.ilk} />
                    ))}
                  </ProductCardsWrapper>
                )
              }}
            </ProductCardsFilter>
          )}
        </WithLoadingIndicator>
      </WithErrorHandler>
    </Grid>
  )
}
