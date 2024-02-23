import { DetailsSection } from 'components/DetailsSection'
import { DetailsSectionContentCardWrapper } from 'components/DetailsSectionContentCard'
import type { mapTrailingStopLossFromLambda } from 'features/aave/manage/helpers/map-trailing-stop-loss-from-lambda'
import type { ManageAaveStateProps } from 'features/aave/manage/sidebars/SidebarManageAaveVault'
import { getAaveLikeTrailingStopLossParams } from 'features/aave/open/helpers/get-aave-like-trailing-stop-loss-params'
import { StrategyType } from 'features/aave/types'
import { OmniContentCard } from 'features/omni-kit/components/details-section'
import { formatAmount } from 'helpers/formatters/format'
import { zero } from 'helpers/zero'
import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

export const AaveTrailingStopLossManageDetails = ({
  trailingStopLossLambdaData,
  trailingStopLossToken,
  state,
  isEditing,
}: {
  trailingStopLossLambdaData: ReturnType<typeof mapTrailingStopLossFromLambda>
  state: ManageAaveStateProps['state']
  trailingStopLossToken: 'debt' | 'collateral'
  isEditing: boolean
}) => {
  const { t } = useTranslation()
  const { strategyConfig, strategyInfo } = state.context

  const {
    trailingDistanceValue,
    dynamicStopPrice,
    dynamicStopPriceChange,
    estimatedTokenOnSLTrigger,
    estimatedTokenOnSLTriggerChange,
    currentTrailingDistanceValue,
  } = getAaveLikeTrailingStopLossParams.manage({
    state,
    trailingStopLossLambdaData,
    trailingStopLossToken,
  })
  const isShort = strategyConfig.strategyType === StrategyType.Short
  const trailingDistanceToken = isShort
    ? strategyConfig.tokens.collateral
    : strategyConfig.tokens.debt
  const trailingDistanceDisplayValue = `${formatAmount(
    currentTrailingDistanceValue,
    trailingDistanceToken,
  )} ${trailingDistanceToken}`
  const trailingDistanceChangeDisplayValue =
    isEditing &&
    trailingDistanceValue &&
    !currentTrailingDistanceValue.eq(trailingDistanceValue) &&
    `${formatAmount(trailingDistanceValue, trailingDistanceToken)} ${trailingDistanceToken}`
  const dynamicStopLossPriceValue = `${formatAmount(
    trailingStopLossLambdaData.trailingDistance ? dynamicStopPrice : zero,
    trailingDistanceToken,
  )} ${trailingDistanceToken}`
  const dynamicStopLossPriceChangeValue =
    isEditing &&
    !dynamicStopPrice.eq(dynamicStopPriceChange) &&
    `${formatAmount(dynamicStopPriceChange, trailingDistanceToken)} ${trailingDistanceToken}`
  const estimatedTokenOnSLTriggerValue = `${formatAmount(
    trailingStopLossLambdaData.trailingDistance ? estimatedTokenOnSLTrigger : zero,
    strategyConfig.tokens[trailingStopLossToken],
  )} ${strategyConfig.tokens[trailingStopLossToken]}`
  const estimatedTokenOnSLTriggerChangeValue =
    isEditing &&
    !estimatedTokenOnSLTrigger.eq(estimatedTokenOnSLTriggerChange) &&
    `${formatAmount(
      estimatedTokenOnSLTriggerChange,
      strategyConfig.tokens[trailingStopLossToken],
    )} ${strategyConfig.tokens[trailingStopLossToken]}`

  const currentMarketPrice = useMemo(() => {
    if (!strategyInfo) {
      return zero
    }
    return isShort
      ? strategyInfo.oracleAssetPrice.debt.div(strategyInfo.oracleAssetPrice.collateral)
      : strategyInfo.oracleAssetPrice.collateral.div(strategyInfo.oracleAssetPrice.debt)
  }, [isShort, strategyInfo])
  const currentmarketPriceTokens = useMemo(() => {
    if (isShort) {
      return `${strategyConfig.tokens.debt}/${strategyConfig.tokens.collateral}`
    }
    return `${strategyConfig.tokens.collateral}/${strategyConfig.tokens.debt}`
  }, [isShort, strategyConfig.tokens.collateral, strategyConfig.tokens.debt])
  return (
    <DetailsSection
      title={t('system.trailing-stop-loss')}
      badge={!!trailingStopLossLambdaData.trailingDistance}
      content={
        <DetailsSectionContentCardWrapper>
          <OmniContentCard
            title={t('protection.trailing-distance')}
            value={trailingDistanceDisplayValue}
            change={
              trailingDistanceChangeDisplayValue ? [trailingDistanceChangeDisplayValue] : undefined
            }
            changeVariant="positive"
          />
          <OmniContentCard
            title={t('protection.current-market-price')}
            value={`${formatAmount(
              currentMarketPrice,
              trailingDistanceToken,
            )} ${currentmarketPriceTokens}`}
          />
          <OmniContentCard
            title={t('protection.trailing-stop-loss-price')}
            value={dynamicStopLossPriceValue}
            change={dynamicStopLossPriceChangeValue ? [dynamicStopLossPriceChangeValue] : undefined}
            changeVariant="positive"
          />
          <OmniContentCard
            title={t('protection.est-token-on-tsl-trigger', {
              trailingStopLossToken,
            })}
            value={estimatedTokenOnSLTriggerValue}
            change={
              estimatedTokenOnSLTriggerChangeValue
                ? [estimatedTokenOnSLTriggerChangeValue]
                : undefined
            }
            changeVariant="positive"
          />
        </DetailsSectionContentCardWrapper>
      }
    />
  )
}
