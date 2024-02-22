import { DetailsSection } from 'components/DetailsSection'
import { DetailsSectionContentCardWrapper } from 'components/DetailsSectionContentCard'
import { getFormattedPrice } from 'features/aave/helpers'
import type { mapTrailingStopLossFromLambda } from 'features/aave/manage/helpers/map-trailing-stop-loss-from-lambda'
import type { ManageAaveStateProps } from 'features/aave/manage/sidebars/SidebarManageAaveVault'
import { getAaveLikeTrailingStopLossParams } from 'features/aave/open/helpers/get-aave-like-trailing-stop-loss-params'
import { OmniContentCard } from 'features/omni-kit/components/details-section'
import { formatAmount } from 'helpers/formatters/format'
import { zero } from 'helpers/zero'
import React from 'react'
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
  const { strategyConfig } = state.context
  const isTrailingStopLossEnabled = trailingStopLossLambdaData.trailingDistance !== undefined

  const {
    trailingDistanceValue,
    dynamicStopPrice,
    dynamicStopPriceChange,
    collateralPriceInDebt,
    estimatedTokenOnSLTrigger,
    estimatedTokenOnSLTriggerChange,
  } = getAaveLikeTrailingStopLossParams.manage({
    state,
    trailingStopLossLambdaData,
    trailingStopLossToken,
  })
  const trailingDistanceCurrent = trailingStopLossLambdaData.trailingDistance || zero
  const trailingDistanceDisplayValue = getFormattedPrice(trailingDistanceCurrent, strategyConfig)
  const trailingDistanceChangeDisplayValue =
    isEditing &&
    trailingDistanceValue &&
    !trailingDistanceValue.eq(trailingDistanceCurrent) &&
    getFormattedPrice(trailingDistanceValue, strategyConfig)

  const dynamicStopLossPriceValue = getFormattedPrice(
    isTrailingStopLossEnabled ? dynamicStopPrice : zero,
    strategyConfig,
  )
  const dynamicStopLossPriceChangeValue =
    isEditing &&
    !dynamicStopPrice.eq(dynamicStopPriceChange) &&
    getFormattedPrice(dynamicStopPriceChange, strategyConfig)

  const estimatedTokenOnSLTriggerValue = `${formatAmount(
    isTrailingStopLossEnabled ? estimatedTokenOnSLTrigger : zero,
    strategyConfig.tokens[trailingStopLossToken],
  )} ${strategyConfig.tokens[trailingStopLossToken]}`

  const currentMarketPrice = getFormattedPrice(collateralPriceInDebt, strategyConfig)
  const estimatedTokenOnSLTriggerChangeValue =
    isEditing &&
    (!estimatedTokenOnSLTrigger.eq(estimatedTokenOnSLTriggerChange) ||
      !isTrailingStopLossEnabled) &&
    `${formatAmount(
      estimatedTokenOnSLTriggerChange,
      strategyConfig.tokens[trailingStopLossToken],
    )} ${strategyConfig.tokens[trailingStopLossToken]}`
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
            value={currentMarketPrice}
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
