import { useTranslation } from 'next-i18next'
import React from 'react'
import { Flex, Grid } from 'theme-ui'

import { useAppContext } from '../../components/AppContextProvider'
import { ProductCardMultiply } from '../../components/ProductCardMultiply'
import { ProductCardsFilter } from '../../components/ProductCardsFilter'
import { ProductHeader } from '../../components/ProductHeader'
import { AppSpinner, WithLoadingIndicator } from '../../helpers/AppSpinner'
import { WithErrorHandler } from '../../helpers/errorHandlers/WithErrorHandler'
import { useObservableWithError } from '../../helpers/observableHook'
import { multiplyPageCardsData, productCardsConfig } from '../../helpers/productCards'

export function MultiplyView() {
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
        mb: ['123px', '343px'],
      }}
    >
      <ProductHeader
        title={t('product-page.multiply.title')}
        description={t('product-page.multiply.description')}
        link={{
          href: 'https://kb.oasis.app/help/what-is-multiply',
          text: t('product-page.multiply.link'),
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
            <ProductCardsFilter filters={productCardsConfig.multiply.cardsFilters}>
              {(cardsFilter) => (
                <Grid columns={[1, 2, 3]} sx={{ justifyItems: 'center' }}>
                  {multiplyPageCardsData({ productCardsData, cardsFilter }).map((cardData) => (
                    <ProductCardMultiply cardData={cardData} key={cardData.ilk} />
                  ))}
                </Grid>
              )}
            </ProductCardsFilter>
          )}
        </WithLoadingIndicator>
      </WithErrorHandler>
    </Grid>
  )
}
