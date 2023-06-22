import { RiskRatio } from '@oasisdex/dma-library'
import BigNumber from 'bignumber.js'
import { TokenMetadataType } from 'blockchain/tokensMetadata'
import { useAaveContext } from 'features/aave'
import { IStrategyConfig } from 'features/aave/common'
import { AppSpinner } from 'helpers/AppSpinner'
import { displayMultiple } from 'helpers/display-multiple'
import { formatCryptoBalance, formatPercent } from 'helpers/formatters/format'
import { useObservable } from 'helpers/observableHook'
import { useFeatureToggle } from 'helpers/useFeatureToggle'
import { zero } from 'helpers/zero'
import { LendingProtocol } from 'lendingProtocols'
import { useTranslation } from 'next-i18next'
import React from 'react'

import { ProductCard, ProductCardNetworkRow, ProductCardProtocolLink } from './ProductCard'

type ProductCardMultiplyAaveProps = {
  cardData: TokenMetadataType
  strategy: IStrategyConfig
}

const aaveMultiplyCalcValueBasis = {
  amount: new BigNumber(100),
}

export function ProductCardMultiplyAave({ cardData, strategy }: ProductCardMultiplyAaveProps) {
  const { t } = useTranslation()
  const displayNetwork = useFeatureToggle('UseNetworkRowProductCard')
  const { getAaveReserveData$, aaveReserveConfigurationData$ } = useAaveContext(
    strategy.protocol,
    strategy.network,
  )
  const [debtReserveData] = useObservable(getAaveReserveData$({ token: strategy.tokens.debt }))
  const [collateralReserveConfigurationData] = useObservable(
    aaveReserveConfigurationData$({
      collateralToken: strategy.tokens.collateral,
      debtToken: strategy.tokens.debt,
    }),
  )

  const protocolVersion = strategy.protocol === LendingProtocol.AaveV2 ? 'v2' : 'v3'

  const maximumMultiple =
    collateralReserveConfigurationData?.ltv &&
    new RiskRatio(collateralReserveConfigurationData.ltv, RiskRatio.TYPE.LTV)

  return (
    <ProductCard
      tokenImage={cardData.bannerIcon}
      tokenGif={cardData.bannerGif}
      title={t(`product-card.aave.${cardData.symbol}.title`)}
      description={t(`product-card.aave.${cardData.symbol}.description`)}
      banner={{
        title: t('product-card-banner.with', {
          value: aaveMultiplyCalcValueBasis.amount.toString(),
          token: strategy.tokens.deposit,
        }),
        description: t(`product-card-banner.multiply`, {
          value: maximumMultiple
            ? maximumMultiple.multiple.times(aaveMultiplyCalcValueBasis.amount).toFormat(0)
            : zero.toString(),
          token: strategy.tokens.deposit,
        }),
        isLoading: !maximumMultiple,
      }}
      labels={[
        {
          title: t('system.max-multiple'),
          value: displayMultiple(maximumMultiple?.multiple),
        },
        {
          title: t('system.position'),
          value: cardData.name,
        },
        {
          title: t('system.liquidity-available'),
          value: debtReserveData ? (
            formatCryptoBalance(debtReserveData.availableLiquidity)
          ) : (
            <AppSpinner />
          ),
        },
        {
          title: t('system.variable-annual-fee'),
          value: debtReserveData?.variableBorrowRate ? (
            formatPercent(debtReserveData.variableBorrowRate.times(100), {
              precision: 2,
            })
          ) : (
            <AppSpinner />
          ),
        },
        {
          title: t('system.protocol'),
          value: <ProductCardProtocolLink ilk={cardData.symbol} protocol={cardData.protocol} />,
        },
        {
          title: t('system.network'),
          value: <ProductCardNetworkRow chain={cardData.chain} />,
          enabled: displayNetwork,
        },
      ]}
      floatingLabelText={t('product-card.tags.new')}
      button={{
        link: `/${strategy.network}/aave/${protocolVersion}/multiply/${strategy.urlSlug}`,
        text: t('nav.multiply'),
      }}
      background={cardData.background}
      protocol={cardData.protocol}
      isFull={false}
    />
  )
}
