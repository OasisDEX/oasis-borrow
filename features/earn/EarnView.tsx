import { getTokens } from 'blockchain/tokensMetadata'
import { ProductCardEarnAave } from 'components/productCards/ProductCardEarnAave'
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
import { aaveStrategiesList } from '../aave/strategyConfig'

export function EarnView() {
  const { t } = useTranslation()
  const { productCardsData$ } = useAppContext()
  const [productCardsIlksData, productCardsIlksDataError] = useObservable(
    productCardsData$(supportedEarnIlks),
  )

  const aaveEarnStrategies = getTokens(aaveStrategiesList('earn').map(({ name }) => name))
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
                <ProductCardEarnMaker key={cardData.ilk} cardData={cardData} />
              ))}
              {aaveEarnStrategies.map((cardData) => (
                <ProductCardEarnAave key={cardData.symbol} cardData={cardData} />
              ))}
            </ProductCardsWrapper>
          )}
        </WithLoadingIndicator>
      </WithErrorHandler>
    </Grid>
  )
}
