import { useTranslation } from 'next-i18next'
import React from 'react'
import { Flex, Grid } from 'theme-ui'

import { useAppContext } from '../../components/AppContextProvider'
import { ProductCard } from '../../components/ProductCard'
import { ProductCardsFilter } from '../../components/ProductCardsFilter'
import { ProductHeader } from '../../components/ProductHeader'
import { AppSpinner, WithLoadingIndicator } from '../../helpers/AppSpinner'
import { WithErrorHandler } from '../../helpers/errorHandlers/WithErrorHandler'
import { formatPercent } from '../../helpers/formatters/format'
import { useObservableWithError } from '../../helpers/observableHook'
import { multiplyPageCardsData, productCardsConfig } from '../../helpers/productCards'
import { one } from '../../helpers/zero'

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
        link={{ href: '', text: t('product-page.multiply.link') }}
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
                  {multiplyPageCardsData({ productCardsData, cardsFilter }).map((cardData) => {
                    const maxMultiple = one.div(cardData.liquidationRatio.minus(one))

                    return (
                      <ProductCard
                        key={cardData.ilk}
                        tokenImage={cardData.bannerIcon}
                        title={cardData.ilk}
                        description={t(`product-card.multiply.description`, {
                          token: cardData.token,
                        })}
                        banner={{
                          title: t('product-card-banner.with', {
                            value: '100',
                            token: cardData.token,
                          }),
                          description: t(`product-card-banner.multiply.description`, {
                            value: maxMultiple.times(100).toFixed(2),
                            token: cardData.token,
                          }),
                        }}
                        leftSlot={{
                          title: t('system.max-multiple'),
                          value: `${maxMultiple.toFixed(2)}x`,
                        }}
                        rightSlot={{
                          title: t(t('system.stability-fee')),
                          value: formatPercent(cardData.stabilityFee.times(100), { precision: 2 }),
                        }}
                        button={{
                          link: `/vaults/open-multiply/${cardData.ilk}`,
                          text: t('nav.multiply'),
                        }}
                        background={cardData.background}
                      />
                    )
                  })}
                </Grid>
              )}
            </ProductCardsFilter>
          )}
        </WithLoadingIndicator>
      </WithErrorHandler>
    </Grid>
  )
}
