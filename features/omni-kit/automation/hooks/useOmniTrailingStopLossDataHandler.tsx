import type { AaveLikePositionV2 } from '@oasisdex/dma-library'
import BigNumber from 'bignumber.js'
import { mapTrailingStopLossFromLambda } from 'features/aave/manage/helpers/map-trailing-stop-loss-from-lambda'
import { AutomationFeatures } from 'features/automation/common/types'
import {
  OmniCardDataDynamicStopLossPriceModal,
  OmniCardDataEstTokenOnTriggerModal,
  useOmniCardDataDynamicStopLossPrice,
  useOmniCardDataEstTokenOnTrigger,
  useOmniCardTrailingDistance,
} from 'features/omni-kit/components/details-section'
import { useOmniGeneralContext, useOmniProductContext } from 'features/omni-kit/contexts'
import { formatCryptoBalance } from 'helpers/formatters/format'
import { one, zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import React, { useCallback, useMemo } from 'react'

const getSliderStep = (tokenPrice: BigNumber) => {
  if (tokenPrice.isGreaterThan(100000)) {
    return 1000
  }
  if (tokenPrice.isGreaterThan(10000)) {
    return 100
  }
  if (tokenPrice.isGreaterThan(1000)) {
    return 10
  }
  if (tokenPrice.isGreaterThan(100)) {
    return 1
  }
  if (tokenPrice.isGreaterThan(1)) {
    return 0.1
  }
  return 0.001
}

export const useOmniTrailingStopLossDataHandler = () => {
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

  const trailingStopLossLambdaData = useMemo(
    () => mapTrailingStopLossFromLambda(positionTriggers.triggers),
    [positionTriggers.triggers],
  )

  // during clean up extend LendingPosition with common properties
  const castedPosition = position as AaveLikePositionV2

  const isActive = state.uiDropdownProtection === AutomationFeatures.TRAILING_STOP_LOSS

  const closeTo = automation?.triggers.trailingStopLoss?.decodedParams?.closeToCollateral
    ? 'collateral'
    : 'debt'

  const isTrailingStopLossEnabled = !!automation?.flags.isTrailingStopLossEnabled
  const isCloseToCollateral = closeTo === 'collateral'

  const currentMarketPrice = isShort
    ? quotePrice.div(collateralPrice)
    : collateralPrice.div(quotePrice)

  const isCollateralActive = !!automation?.triggers.stopLoss?.triggerTypeName.includes('Collateral')
  const closeToToken = isCollateralActive ? collateralToken : quoteToken
  const stateCloseToToken = state.resolveTo === 'collateral' ? collateralToken : quoteToken

  const afterTraillingStopLossLevel = state.trailingDistance
  const liquidationPrice =
    castedPosition.debtAmount.div(
      castedPosition.collateralAmount.times(castedPosition.maxRiskRatio.loanToValue),
    ) || zero

  const priceRatio = useMemo(() => {
    if (trailingStopLossLambdaData.dynamicParams?.executionPrice) {
      const trailingPricePlusDistance =
        trailingStopLossLambdaData.dynamicParams.executionPrice.plus(
          trailingStopLossLambdaData.trailingDistance,
        )
      if (isShort) {
        return one.div(trailingPricePlusDistance).div(collateralPrice)
      }
      return trailingPricePlusDistance.div(quotePrice)
    }
    if (isShort) {
      return quotePrice.div(collateralPrice)
    }
    return collateralPrice.div(quotePrice)
  }, [
    collateralPrice,
    quotePrice,
    isShort,
    trailingStopLossLambdaData.dynamicParams,
    trailingStopLossLambdaData.trailingDistance,
  ])
  const sliderStep = getSliderStep(isShort ? quotePrice : collateralPrice)
  const sliderMin = new BigNumber(
    (liquidationPrice || one).div(sliderStep).toFixed(0, BigNumber.ROUND_DOWN),
  ).times(sliderStep)

  const sliderMax = new BigNumber(
    priceRatio.div(sliderStep).toFixed(0, BigNumber.ROUND_DOWN),
  ).times(sliderStep)
  const getTrailingDistanceValue = useCallback((td: BigNumber) => sliderMax.minus(td), [sliderMax])
  // then the trailing distance - if it's lower (by default) than the slider min, I'm setting it to the slider min
  // the actual value of the trailing distance used in the TX is called "trailingDistanceValue"
  const trailingDistance = useMemo(() => {
    if (afterTraillingStopLossLevel) {
      return afterTraillingStopLossLevel.lt(sliderMin) ? sliderMin : afterTraillingStopLossLevel
    }
    return sliderMax
  }, [afterTraillingStopLossLevel, sliderMax, sliderMin])
  const trailingDistanceValue = useMemo(
    // we use the opposite value when handling state
    // it's hard to have the slider go from token price to zero, so we do the opposite
    // then the actual value (distance) is sliderMax (token price) minus "trailingDistance" value
    () => getTrailingDistanceValue(trailingDistance),
    [getTrailingDistanceValue, trailingDistance],
  )
  const currentTrailingDistanceValue = useMemo(() => {
    const distance = trailingStopLossLambdaData.trailingDistance ?? zero
    if (isShort) {
      const oppositePrice = one.div(priceRatio)
      const executionPrice = oppositePrice.minus(distance)
      const executionHumanReadable = one.div(executionPrice)
      return priceRatio.minus(executionHumanReadable).abs()
    }
    return distance
  }, [trailingStopLossLambdaData, isShort, priceRatio])
  const dynamicStopPrice = useMemo(() => {
    const lambdaDistanceValue = currentTrailingDistanceValue
    if (isShort) {
      return priceRatio.times(collateralPrice).plus(lambdaDistanceValue)
    }
    return priceRatio.times(quotePrice).minus(lambdaDistanceValue)
  }, [collateralPrice, currentTrailingDistanceValue, quotePrice, isShort, priceRatio])
  const dynamicStopPriceChange = useMemo(() => {
    if (isShort) {
      return priceRatio.times(collateralPrice).plus(trailingDistanceValue)
    }
    return priceRatio.times(quotePrice).minus(trailingDistanceValue)
  }, [isShort, priceRatio, trailingDistanceValue, quotePrice, collateralPrice])
  const estimatedTokenOnSLTrigger = useMemo(() => {
    if (isShort) {
      return isCloseToCollateral
        ? castedPosition.collateralAmount
            .times(one.div(dynamicStopPrice))
            .minus(castedPosition.debtAmount)
            .div(one.div(dynamicStopPrice))
        : castedPosition.collateralAmount
            .times(one.div(dynamicStopPrice))
            .minus(castedPosition.debtAmount)
    }
    return isCloseToCollateral
      ? castedPosition.collateralAmount
          .times(dynamicStopPrice)
          .minus(castedPosition.debtAmount)
          .div(dynamicStopPrice)
      : castedPosition.collateralAmount.times(dynamicStopPrice).minus(castedPosition.debtAmount)
  }, [
    castedPosition.debtAmount,
    dynamicStopPrice,
    isCloseToCollateral,
    isShort,
    castedPosition.collateralAmount,
  ])
  const estimatedTokenOnSLTriggerChange = useMemo(() => {
    if (isShort) {
      return isCloseToCollateral
        ? castedPosition.collateralAmount
            .times(one.div(dynamicStopPriceChange))
            .minus(castedPosition.debtAmount)
            .div(one.div(dynamicStopPriceChange))
        : castedPosition.collateralAmount
            .times(one.div(dynamicStopPriceChange))
            .minus(castedPosition.debtAmount)
    }
    return isCloseToCollateral
      ? castedPosition.collateralAmount
          .times(dynamicStopPriceChange)
          .minus(castedPosition.debtAmount)
          .div(dynamicStopPriceChange)
      : castedPosition.collateralAmount
          .times(dynamicStopPriceChange)
          .minus(castedPosition.debtAmount)
  }, [
    castedPosition.debtAmount,
    dynamicStopPriceChange,
    isCloseToCollateral,
    isShort,
    castedPosition.collateralAmount,
  ])

  const trailingDistanceContentCardCommonData = useOmniCardTrailingDistance({
    trailingDistance: isTrailingStopLossEnabled ? currentTrailingDistanceValue : undefined,
    afterTrailingDistance:
      afterTraillingStopLossLevel && isActive ? trailingDistanceValue : undefined,
    priceFormat,
  })

  const resolvedDynamicStopLossPrice = isTrailingStopLossEnabled ? dynamicStopPrice : undefined
  const resolvedAfterDynamicStopLossPrice =
    afterTraillingStopLossLevel && isActive ? dynamicStopPriceChange : undefined

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
    afterMaxToken:
      afterTraillingStopLossLevel && isActive ? estimatedTokenOnSLTriggerChange : undefined,
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

  const simpleView = state.uiDropdownProtection !== AutomationFeatures.TRAILING_STOP_LOSS
  return {
    trailingStopLossLambdaData,
    castedPosition,
    isActive,
    closeTo,
    isTrailingStopLossEnabled,
    isCloseToCollateral,
    currentMarketPrice,
    isCollateralActive,
    closeToToken,
    stateCloseToToken,
    afterTraillingStopLossLevel,
    liquidationPrice,
    priceRatio,
    sliderStep,
    sliderMin,
    sliderMax,
    getTrailingDistanceValue,
    trailingDistance,
    trailingDistanceValue,
    currentTrailingDistanceValue,
    dynamicStopPrice,
    dynamicStopPriceChange,
    estimatedTokenOnSLTrigger,
    estimatedTokenOnSLTriggerChange,
    trailingDistanceContentCardCommonData,
    resolvedDynamicStopLossPrice,
    resolvedAfterDynamicStopLossPrice,
    dynamicStopPriceContentCardCommonData,
    estTokenOnTriggerContentCardCommonData,
    currentMarketPriceContentCardCommonData,
    simpleView,
  }
}
