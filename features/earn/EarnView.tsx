import { getTokens } from 'blockchain/tokensMetadata'
import { ProductCardEarnAave } from 'components/productCards/ProductCardEarnAave'
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

const aaveStrategiesList = ['AAVE-STETH-ETH']

export function EarnView() {
  const { t } = useTranslation()
  const { productCardsData$ } = useAppContext()
  const [productCardsIlksData, productCardsIlksDataError] = useObservable(
    productCardsData$(supportedEarnIlks),
  )

  const {
    aaveTotalValueLocked$,
    aaveReserveConfigurationData,
    aaveSthEthYieldsQuery,
  } = useAaveContext()
  const [tvlState, tvlStateError] = useObservable(aaveTotalValueLocked$)
  const [aaveReserveState, aaveReserveStateError] = useObservable(aaveReserveConfigurationData)
  const aaveStrategiesTokens = getTokens(aaveStrategiesList)
  console.log('renderrr')

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

      <WithErrorHandler error={[productCardsIlksDataError, aaveReserveStateError, tvlStateError]}>
        <WithLoadingIndicator
          value={[productCardsIlksData, aaveReserveState, tvlState]}
          customLoader={<ProductCardsLoader />}
        >
          {([_productCardsIlksData, _aaveReserveState, _tvlState]) => (
            <ProductCardsWrapper>
              {_productCardsIlksData.map((cardData) => (
                <ProductCardEarnIlk cardData={cardData} key={cardData.ilk} />
              ))}
              {aaveStrategiesTokens.map((cardData) => (
                <ProductCardEarnAave
                  key={`ProductCardEarnAave_${cardData.symbol}`}
                  cardData={cardData}
                  aaveReserveState={_aaveReserveState}
                  tvlState={_tvlState}
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
