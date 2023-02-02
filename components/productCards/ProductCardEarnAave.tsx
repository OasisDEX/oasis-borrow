import { RiskRatio } from '@oasisdex/oasis-actions'
import BigNumber from 'bignumber.js'
import { TokenMetadataType } from 'blockchain/tokensMetadata'
import { useAaveContext } from 'features/aave/AaveContextProvider'
import { AppSpinner, WithLoadingIndicator } from 'helpers/AppSpinner'
import { displayMultiple } from 'helpers/display-multiple'
import { WithErrorHandler } from 'helpers/errorHandlers/WithErrorHandler'
import { formatCryptoBalance, formatPercent } from 'helpers/formatters/format'
import { useObservable } from 'helpers/observableHook'
import { useSimulationYields } from 'helpers/useSimulationYields'
import { useTranslation } from 'next-i18next'
import React from 'react'

import { IStrategyConfig } from '../../features/aave/common/StrategyConfigTypes'
import { LendingProtocol } from '../../lendingProtocols'
import { ProductCard, ProductCardProtocolLink } from './ProductCard'
import { ProductCardsLoader } from './ProductCardsWrapper'

type ProductCardEarnAaveProps = {
  cardData: TokenMetadataType
  strategy: IStrategyConfig
}

const aaveEarnCalcValueBasis = {
  amount: new BigNumber(100),
  token: 'ETH',
}

export function ProductCardEarnAave({ cardData, strategy }: ProductCardEarnAaveProps) {
  const { t } = useTranslation()
  const { earnCollateralsReserveData, aaveAvailableLiquidityInUSDC$ } = useAaveContext(
    LendingProtocol.AaveV2,
  )
  const [aaveReserveState, aaveReserveStateError] = useObservable(
    earnCollateralsReserveData[strategy.tokens.collateral],
  )
  const [aaveAvailableLiquidityETH, aaveAvailableLiquidityETHError] = useObservable(
    aaveAvailableLiquidityInUSDC$({ token: 'ETH' }),
  )
  const maximumMultiple =
    aaveReserveState?.ltv && new RiskRatio(aaveReserveState.ltv, RiskRatio.TYPE.LTV)

  const simulationYields = useSimulationYields({
    amount: aaveEarnCalcValueBasis.amount,
    riskRatio: maximumMultiple,
    fields: ['7Days', '90Days'],
    strategy: strategy,
  })

  return (
    <WithErrorHandler error={[aaveReserveStateError, aaveAvailableLiquidityETHError]}>
      <WithLoadingIndicator
        value={[aaveReserveState, aaveAvailableLiquidityETH, maximumMultiple]}
        customLoader={<ProductCardsLoader />}
      >
        {([_aaveReserveState, _availableLiquidity, _maximumMultiple]) => (
          <ProductCard
            tokenImage={cardData.bannerIcon}
            tokenGif={cardData.bannerGif}
            title={t(`product-card.aave.${cardData.symbol}.title`)}
            description={t(`product-card.aave.${cardData.symbol}.description`)}
            banner={{
              title: t('product-card-banner.with', {
                value: aaveEarnCalcValueBasis.amount.toString(),
                token: aaveEarnCalcValueBasis.token,
              }),
              description: t(`product-card-banner.aave.${cardData.symbol}`, {
                value: _maximumMultiple.multiple.times(aaveEarnCalcValueBasis.amount).toFormat(0),
                token: cardData.symbol,
              }),
            }}
            labels={[
              {
                title: t('system.max-multiple'),
                value: displayMultiple(_maximumMultiple.multiple),
              },
              {
                title: '7 day net APY',
                value: simulationYields?.yields?.annualisedYield7days ? (
                  // this takes a while, so we show a spinner until it's ready
                  formatPercent(simulationYields.yields.annualisedYield7days, {
                    precision: 2,
                  })
                ) : (
                  <AppSpinner />
                ),
              },
              {
                title: '90 day net APY',
                value: simulationYields?.yields?.annualisedYield90days ? (
                  formatPercent(simulationYields.yields.annualisedYield90days, {
                    precision: 2,
                  })
                ) : (
                  <AppSpinner />
                ),
              },
              {
                title: 'Current Liquidity Available',
                value: formatCryptoBalance(_availableLiquidity),
              },
              {
                title: t('system.protocol'),
                value: (
                  <ProductCardProtocolLink ilk={cardData.symbol} protocol={cardData.protocol} />
                ),
              },
            ]}
            button={{
              link: `/earn/aave/v2/open/${cardData.symbol}`,
              text: t('nav.earn'),
            }}
            background={cardData.background}
            protocol={cardData.protocol}
            isFull={false}
          />
        )}
      </WithLoadingIndicator>
    </WithErrorHandler>
  )
}
