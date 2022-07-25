import { useTranslation } from 'next-i18next'
import React from 'react'
import { Grid } from 'theme-ui'

import { useAppContext } from '../../components/AppContextProvider'
import { ProductCardEarn } from '../../components/productCards/ProductCardEarn'
import {
  ProductCardsLoader,
  ProductCardsWrapper,
} from '../../components/productCards/ProductCardsWrapper'
import { ProductHeader } from '../../components/ProductHeader'
import { WithLoadingIndicator } from '../../helpers/AppSpinner'
import { WithErrorHandler } from '../../helpers/errorHandlers/WithErrorHandler'
import { useObservable } from '../../helpers/observableHook'
import { supportedEarnIlks } from '../../helpers/productCards'

export function EarnView() {
  const { t } = useTranslation()
  const { productCardsData$ } = useAppContext()
  const [productCardsData, productCardsDataError] = useObservable(
    productCardsData$(supportedEarnIlks),
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
        title={t('product-page.earn.title')}
        description={t('product-page.earn.description')}
        link={{
          href: 'https://kb.oasis.app/help/earn-with-dai-and-g-uni-multiply',
          text: t('product-page.earn.link'),
        }}
      />

      <WithErrorHandler error={[productCardsDataError]}>
        <WithLoadingIndicator value={[productCardsData]} customLoader={<ProductCardsLoader />}>
          {([productCardsData]) => (
            <ProductCardsWrapper>
              {productCardsData.map((cardData) => (
                <ProductCardEarn cardData={cardData} key={cardData.ilk} />
              ))}
            </ProductCardsWrapper>
          )}
        </WithLoadingIndicator>
      </WithErrorHandler>
    </Grid>
  )
}
