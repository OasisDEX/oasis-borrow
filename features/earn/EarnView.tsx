import { useAppContext } from 'components/AppContextProvider'
import { ProductCardEarnAave } from 'components/productCards/ProductCardEarnAave'
import { ProductCardEarnDsr } from 'components/productCards/ProductCardEarnDsr'
import { ProductCardEarnMaker } from 'components/productCards/ProductCardEarnMaker'
import {
  ProductCardsLoader,
  ProductCardsWrapper,
} from 'components/productCards/ProductCardsWrapper'
import { ProductHeader } from 'components/ProductHeader'
import { aaveStrategiesList } from 'features/aave/strategyConfig'
import { EXTERNAL_LINKS } from 'helpers/applicationLinks'
import { WithLoadingIndicator } from 'helpers/AppSpinner'
import { WithErrorHandler } from 'helpers/errorHandlers/WithErrorHandler'
import { mapStrategyToToken } from 'helpers/mapStrategyToToken'
import { useObservable } from 'helpers/observableHook'
import { supportedEarnIlks } from 'helpers/productCards'
import { useFeatureToggle } from 'helpers/useFeatureToggle'
import { LendingProtocol } from 'lendingProtocols'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Grid } from 'theme-ui'

export function EarnView() {
  const { t } = useTranslation()
  const { productCardsData$ } = useAppContext()
  const [productCardsIlksData, productCardsIlksDataError] = useObservable(
    productCardsData$(supportedEarnIlks),
  )
  const daiSavingsRate = useFeatureToggle('DaiSavingsRate')

  const aaveEarnV2Strategies = aaveStrategiesList('Earn', LendingProtocol.AaveV2).map(
    mapStrategyToToken,
  )
  const aaveEarnV3Strategies = aaveStrategiesList('Earn', LendingProtocol.AaveV3).map(
    mapStrategyToToken,
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
          href: EXTERNAL_LINKS.KB.EARN_DAI_GUNI_MULTIPLY,
          text: t('product-page.earn.link'),
        }}
      />

      <WithErrorHandler error={[productCardsIlksDataError]}>
        <WithLoadingIndicator value={[productCardsIlksData]} customLoader={<ProductCardsLoader />}>
          {([_productCardsIlksData]) => (
            <ProductCardsWrapper>
              {[...aaveEarnV3Strategies, ...aaveEarnV2Strategies].map(
                ({ strategy, tokenConfig }) => (
                  <ProductCardEarnAave
                    key={tokenConfig.symbol}
                    cardData={tokenConfig}
                    strategy={strategy}
                  />
                ),
              )}
              {/* TODO move logic regarding dsr to productCardsData$ */}
              {daiSavingsRate && <ProductCardEarnDsr />}
              {_productCardsIlksData.map((cardData) => (
                <ProductCardEarnMaker key={cardData.ilk} cardData={cardData} />
              ))}
            </ProductCardsWrapper>
          )}
        </WithLoadingIndicator>
      </WithErrorHandler>
    </Grid>
  )
}
