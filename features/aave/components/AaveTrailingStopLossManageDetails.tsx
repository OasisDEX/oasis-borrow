import { DetailsSection } from 'components/DetailsSection'
import { DetailsSectionContentCardWrapper } from 'components/DetailsSectionContentCard'
import type { mapTrailingStopLossFromLambda } from 'features/aave/manage/helpers/map-trailing-stop-loss-from-lambda'
import type { ManageAaveStateProps } from 'features/aave/manage/sidebars/SidebarManageAaveVault'
import { getAaveLikeTrailingStopLossParams } from 'features/aave/open/helpers/get-aave-like-trailing-stop-loss-params'
import { OmniContentCard } from 'features/omni-kit/components/details-section'
import { formatAmount } from 'helpers/formatters/format'
import { one, zero } from 'helpers/zero'
import React from 'react'
import { useTranslation } from 'react-i18next'

export const AaveTrailingStopLossManageDetails = ({
  trailingStopLossLambdaData,
  trailingStopLossToken,
  state,
}: {
  trailingStopLossLambdaData: ReturnType<typeof mapTrailingStopLossFromLambda>
  state: ManageAaveStateProps['state']
  trailingStopLossToken: 'debt' | 'collateral'
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

  const trailingDistanceDisplayValue = `${formatAmount(
    trailingStopLossLambdaData.trailingDistance || zero,
    strategyConfig.tokens.debt,
  )} ${strategyConfig.tokens.debt}`
  const trailingDistanceChangeDisplayValue =
    trailingDistanceValue &&
    !trailingDistanceValue.eq(trailingStopLossLambdaData.trailingDistance || one) &&
    `${formatAmount(trailingDistanceValue, strategyConfig.tokens.debt)} ${
      strategyConfig.tokens.debt
    }`
  const dynamicStopLossPriceValue = `${formatAmount(
    isTrailingStopLossEnabled ? dynamicStopPrice : zero,
    strategyConfig.tokens.debt,
  )} ${strategyConfig.tokens.debt}`
  const dynamicStopLossPriceChangeValue =
    !dynamicStopPrice.eq(dynamicStopPriceChange) &&
    `${formatAmount(dynamicStopPriceChange, strategyConfig.tokens.debt)} ${
      strategyConfig.tokens.debt
    }`
  const estimatedTokenOnSLTriggerValue = `${formatAmount(
    isTrailingStopLossEnabled ? estimatedTokenOnSLTrigger : zero,
    strategyConfig.tokens[trailingStopLossToken],
  )} ${strategyConfig.tokens[trailingStopLossToken]}`
  const estimatedTokenOnSLTriggerChangeValue =
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
            title="Trailing Distance"
            value={trailingDistanceDisplayValue}
            change={
              trailingDistanceChangeDisplayValue ? [trailingDistanceChangeDisplayValue] : undefined
            }
            changeVariant="positive"
          />
          <OmniContentCard
            title="Current Market Price"
            value={`${formatAmount(collateralPriceInDebt, strategyConfig.tokens.debt)} ${
              strategyConfig.tokens.debt
            }`}
          />
          <OmniContentCard
            title="Trailing Stop-Loss Price"
            value={dynamicStopLossPriceValue}
            change={dynamicStopLossPriceChangeValue ? [dynamicStopLossPriceChangeValue] : undefined}
            changeVariant="positive"
          />
          <OmniContentCard
            title={`Est. ${trailingStopLossToken} on Trailing Stop-Loss triggered`}
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
