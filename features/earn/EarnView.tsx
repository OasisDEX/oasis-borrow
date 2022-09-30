import { getTokens } from 'blockchain/tokensMetadata'
import { ProductCardEarnAave } from 'components/productCards/ProductCardEarnAave'
import { useFeatureToggle } from 'helpers/useFeatureToggle'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Grid } from 'theme-ui'

import { useAppContext } from '../../components/AppContextProvider'
import { ProductCardEarnIlk } from '../../components/productCards/ProductCardEarnIlk'
import {
  ProductCardsLoader,
  ProductCardsWrapper,
} from '../../components/productCards/ProductCardsWrapper'
import { ProductHeader } from '../../components/ProductHeader'
import { WithLoadingIndicator } from '../../helpers/AppSpinner'
import { WithErrorHandler } from '../../helpers/errorHandlers/WithErrorHandler'
import { useObservable } from '../../helpers/observableHook'
import { supportedEarnIlks } from '../../helpers/productCards'
import { useAaveContext } from './aave/AaveContextProvider'
import { aaveStrategiesList } from './aave/constants'

export function EarnView() {
  const showAaveStETHETHProductCard = useFeatureToggle('AaveStETHETHProductCard')
  const { t } = useTranslation()
  const { productCardsData$ } = useAppContext()
  const [productCardsIlksData, productCardsIlksDataError] = useObservable(
    productCardsData$(supportedEarnIlks),
  )

  const {
    aaveReserveConfigurationData,
    aaveSthEthYieldsQuery,
    aaveAvailableLiquidityETH$,
  } = useAaveContext()
  const [aaveReserveState, aaveReserveStateError] = useObservable(aaveReserveConfigurationData)
  const [aaveAvailableLiquidityETH, aaveAvailableLiquidityETHError] = useObservable(
    aaveAvailableLiquidityETH$,
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

      <WithErrorHandler
        error={[productCardsIlksDataError, aaveReserveStateError, aaveAvailableLiquidityETHError]}
      >
        <WithLoadingIndicator
          value={[productCardsIlksData, aaveReserveState, aaveAvailableLiquidityETH]}
          customLoader={<ProductCardsLoader />}
        >
          {([_productCardsIlksData, _aaveReserveState, _availableLiquidity]) => (
            <ProductCardsWrapper>
              {_productCardsIlksData.map((cardData) => (
                <ProductCardEarnIlk cardData={cardData} key={cardData.ilk} />
              ))}
              {showAaveStETHETHProductCard &&
                aaveStrategiesTokens.map((cardData) => (
                  <ProductCardEarnAave
                    key={`ProductCardEarnAave_${cardData.symbol}`}
                    cardData={cardData}
                    aaveReserveState={_aaveReserveState}
                    availableLiquidity={_availableLiquidity}
                    aaveSthEthYieldsQuery={aaveSthEthYieldsQuery}
                  />
                ))}
            </ProductCardsWrapper>
          )}
        </WithLoadingIndicator>
      </WithErrorHandler>
    </Grid>
  )
}
