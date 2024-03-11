import type { AaveLikePositionV2 } from '@oasisdex/dma-library'
import { DetailsSection } from 'components/DetailsSection'
import { DetailsSectionContentCardWrapper } from 'components/DetailsSectionContentCard'
import { mapTrailingStopLossFromLambda } from 'features/aave/manage/helpers/map-trailing-stop-loss-from-lambda'
import { getTrailingStopLossParams } from 'features/aave/open/helpers/get-aave-like-trailing-stop-loss-params'
import {
  OmniCardDataDynamicStopLossPriceModal,
  OmniCardDataEstTokenOnTriggerModal,
  OmniContentCard,
  useOmniCardDataDynamicStopLossPrice,
  useOmniCardDataEstTokenOnTrigger,
  useOmniCardTrailingDistance,
} from 'features/omni-kit/components/details-section'
import { useOmniGeneralContext, useOmniProductContext } from 'features/omni-kit/contexts'
import { formatCryptoBalance } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'

export const OmniTrailingStopLossOverviewDetailsSection = () => {
  const { t } = useTranslation()
  const {
    environment: {
      productType,
      isShort,
      collateralPrice,
      quotePrice,
      priceFormat,
      collateralToken,
      quoteToken,
    },
  } = useOmniGeneralContext()
  const {
    dynamicMetadata: {
      values: { automation },
    },
    automation: {
      automationForm: { state },
      positionTriggers,
    },
    position: {
      currentPosition: { position },
    },
  } = useOmniProductContext(productType)

  // during clean up extend LendingPosition with common properties
  const castedPosition = position as AaveLikePositionV2

  const closeTo = automation?.triggers.trailingStopLoss?.decodedParams?.closeToCollateral
    ? 'collateral'
    : 'debt'

  const isTrailingStopLossEnabled = !!automation?.flags.isTrailingStopLossEnabled

  const currentMarketPrice = isShort
    ? quotePrice.div(collateralPrice)
    : collateralPrice.div(quotePrice)

  const isCollateralActive = !!automation?.triggers.stopLoss?.triggerTypeName.includes('Collateral')
  const closeToToken = isCollateralActive ? collateralToken : quoteToken
  const stateCloseToToken = state.resolveTo === 'collateral' ? collateralToken : quoteToken

  const afterTraillingStopLossLevel = state.trailingDistance

  // since values returned from this fn are always defined, to keep the same approach
  // as we have in omni (if something is not defined we don't default it to zero), in the code
  // below I'm checking if trigger exists and if not I'm overwriting these with undefined
  // it's something to be updated during clean up
  const {
    trailingDistanceValue,
    dynamicStopPrice,
    dynamicStopPriceChange,
    estimatedTokenOnSLTrigger,
    estimatedTokenOnSLTriggerChange,
    currentTrailingDistanceValue,
  } = getTrailingStopLossParams.manage({
    state: {
      collateralAmount: castedPosition.collateralAmount,
      quoteAmount: castedPosition.debtAmount,
      loanToValue: castedPosition.riskRatio.loanToValue,
      maxLoanToValue: castedPosition.maxRiskRatio.loanToValue,
      collateralPrice,
      quotePrice,
      isShort,
      liquidationPenalty: castedPosition.liquidationPenalty,
      contextTrailingDistance: afterTraillingStopLossLevel,
    },
    trailingStopLossLambdaData: mapTrailingStopLossFromLambda(positionTriggers.triggers),
    trailingStopLossToken: closeTo,
  })

  const trailingDistanceContentCardCommonData = useOmniCardTrailingDistance({
    trailingDistance: isTrailingStopLossEnabled ? currentTrailingDistanceValue : undefined,
    afterTrailingDistance: afterTraillingStopLossLevel ? trailingDistanceValue : undefined,
    priceFormat,
  })

  const resolvedDynamicStopLossPrice = isTrailingStopLossEnabled ? dynamicStopPrice : undefined
  const resolvedAfterDynamicStopLossPrice = afterTraillingStopLossLevel
    ? dynamicStopPriceChange
    : undefined

  const dynamicStopPriceContentCardCommonData = useOmniCardDataDynamicStopLossPrice({
    dynamicStopPrice: resolvedDynamicStopLossPrice,
    afterDynamicStopPrice: resolvedAfterDynamicStopLossPrice,
    priceFormat,
    ratioToLiquidationPrice: resolvedDynamicStopLossPrice?.minus(castedPosition.liquidationPrice),
    modal: (
      <OmniCardDataDynamicStopLossPriceModal
        dynamicStopLossPrice={resolvedDynamicStopLossPrice}
        priceFormat={priceFormat}
      />
    ),
  })

  const estTokenOnTriggerContentCardCommonData = useOmniCardDataEstTokenOnTrigger({
    isCollateralActive,
    liquidationPrice: castedPosition.liquidationPrice,
    collateralAmount: castedPosition.collateralAmount,
    debtAmount: castedPosition.debtAmount,
    collateralToken,
    liquidationPenalty: castedPosition.liquidationPenalty,
    dynamicStopLossPrice: resolvedDynamicStopLossPrice,
    afterDynamicStopLossPrice: resolvedAfterDynamicStopLossPrice,
    closeToToken,
    stateCloseToToken,
    maxToken: isTrailingStopLossEnabled ? estimatedTokenOnSLTrigger : undefined,
    afterMaxToken: afterTraillingStopLossLevel ? estimatedTokenOnSLTriggerChange : undefined,
    modal: (
      <OmniCardDataEstTokenOnTriggerModal
        token={closeToToken}
        liquidationPenalty={castedPosition.liquidationPenalty}
      />
    ),
  })

  const currentMarketPriceContentCardCommonData = {
    title: t('protection.current-market-price'),
    value: `${formatCryptoBalance(currentMarketPrice)}`,
    unit: priceFormat,
  }

  return (
    <DetailsSection
      title={t('system.trailing-stop-loss')}
      badge={!!automation?.flags.isTrailingStopLossEnabled}
      content={
        <DetailsSectionContentCardWrapper>
          <OmniContentCard {...trailingDistanceContentCardCommonData} />
          <OmniContentCard {...currentMarketPriceContentCardCommonData} />
          <OmniContentCard {...dynamicStopPriceContentCardCommonData} />
          <OmniContentCard {...estTokenOnTriggerContentCardCommonData} />
        </DetailsSectionContentCardWrapper>
      }
    />
  )
}
