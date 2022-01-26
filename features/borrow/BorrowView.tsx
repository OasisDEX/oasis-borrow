import { useTranslation } from 'next-i18next'
import React from 'react'
import { Flex, Grid } from 'theme-ui'

import { useAppContext } from '../../components/AppContextProvider'
import { ProductCardBorrow } from '../../components/ProductCardBorrow'
import { ProductCardsFilter } from '../../components/ProductCardsFilter'
import { ProductCardsWrapper } from '../../components/ProductCardsWrapper'
import { ProductHeader } from '../../components/ProductHeader'
import { AppSpinner, WithLoadingIndicator } from '../../helpers/AppSpinner'
import { WithErrorHandler } from '../../helpers/errorHandlers/WithErrorHandler'
import { useObservableWithError } from '../../helpers/observableHook'
import { borrowPageCardsData, productCardsConfig } from '../../helpers/productCards'

export function BorrowView() {
  const { t } = useTranslation()
  const { productCardsData$ } = useAppContext()
  const { error: productCardsDataError, value: productCardsDataValue } = useObservableWithError(
    productCardsData$,
  )

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
            <ProductCardsFilter filters={productCardsConfig.borrow.cardsFilters}>
              {(cardsFilter) => {
                const filteredCards = borrowPageCardsData({ productCardsData, cardsFilter })

                return (
                  <ProductCardsWrapper cardsNumber={filteredCards.length}>
                    {filteredCards.map((cardData) => (
                      <ProductCardBorrow cardData={cardData} key={cardData.ilk} />
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
