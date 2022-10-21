import { getTokens } from 'blockchain/tokensMetadata'
import { ProductCardEarnAave } from 'components/productCards/ProductCardEarnAave'
import { useFeatureToggle } from 'helpers/useFeatureToggle'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Grid } from 'theme-ui'

import { useAppContext } from '../../components/AppContextProvider'
import { ProductCardEarnMaker } from '../../components/productCards/ProductCardEarnMaker'
import {
  ProductCardsLoader,
  ProductCardsWrapper,
} from '../../components/productCards/ProductCardsWrapper'
import { ProductHeader } from '../../components/ProductHeader'
import { WithLoadingIndicator } from '../../helpers/AppSpinner'
import { WithErrorHandler } from '../../helpers/errorHandlers/WithErrorHandler'
import { useObservable } from '../../helpers/observableHook'
import { supportedEarnIlks } from '../../helpers/productCards'
import { aaveStrategiesList } from './aave/constants'

export function EarnView() {
  const showAaveStETHETHProductCard = useFeatureToggle('ShowAaveStETHETHProductCard')
  const { t } = useTranslation()
  const { productCardsData$ } = useAppContext()
  const [productCardsIlksData, productCardsIlksDataError] = useObservable(
    productCardsData$(supportedEarnIlks),
  )

  const aaveStrategiesTokens = getTokens(aaveStrategiesList)
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

      <WithErrorHandler error={[productCardsIlksDataError]}>
        <WithLoadingIndicator value={[productCardsIlksData]} customLoader={<ProductCardsLoader />}>
          {([_productCardsIlksData]) => (
            <ProductCardsWrapper>
              {_productCardsIlksData.map((cardData) => (
                <ProductCardEarnMaker cardData={cardData} key={cardData.ilk} />
              ))}
              {showAaveStETHETHProductCard &&
              _productCardsIlksData.length && // just to show them simultanously
                aaveStrategiesTokens.map((cardData) => (
                  <ProductCardEarnAave
                    key={`ProductCardEarnAave_${cardData.symbol}`}
                    cardData={cardData}
                  />
                ))}
            </ProductCardsWrapper>
          )}
        </WithLoadingIndicator>
      </WithErrorHandler>
    </Grid>
  )
}
