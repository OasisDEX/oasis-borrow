import type { LendingPosition } from '@oasisdex/dma-library'
import BigNumber from 'bignumber.js'
import { mapTrailingStopLossFromLambda } from 'features/aave/manage/helpers/map-trailing-stop-loss-from-lambda'
import { AutomationFeatures } from 'features/automation/common/types'
import {
  getCollateralDuringLiquidation,
  getSavingCompareToLiquidation,
  getSliderPercentageFill,
} from 'features/automation/protection/stopLoss/helpers'
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
import React, { useMemo } from 'react'

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
      collateralPrice,
      collateralToken,
      isShort,
      poolId,
      priceFormat,
      productType,
      protocol,
      quotePrice,
      quoteToken,
    },
  } = useOmniGeneralContext()
  const {
    dynamicMetadata: {
      values: { automation },
    },
    automation: {
      automationForms: {
        trailingStopLoss: {
          state: { price, resolveTo },
        },
      },
      commonForm: {
        state: { uiDropdownProtection },
      },
      positionTriggers: { triggers },
    },
    position: {
      currentPosition: { position },
    },
  } = useOmniProductContext(productType)

  const {
    // riskRatio: { loanToValue },
    collateralAmount,
    debtAmount,
    liquidationPrice,
    marketPrice,
    maxRiskRatio: { loanToValue: maxLoanToValue },
  } = position as LendingPosition

  const trailingStopLossLambdaData = useMemo(
    () =>
      mapTrailingStopLossFromLambda({
        poolId,
        protocol,
        triggers,
      }),
    [poolId, protocol, triggers],
  )

  const isActive = uiDropdownProtection === AutomationFeatures.TRAILING_STOP_LOSS
  const isTrailingStopLossEnabled = !!automation?.flags.isTrailingStopLossEnabled
  const isLambdaCloseToCollateral =
    automation?.triggers.trailingStopLoss?.decodedParams.closeToCollateral === 'true'
  const isCollateralActive = resolveTo ? resolveTo === 'collateral' : isLambdaCloseToCollateral
  const isSimpleView = uiDropdownProtection !== AutomationFeatures.TRAILING_STOP_LOSS

  const liquidationPenalty =
    'liquidationPenalty' in position ? (position.liquidationPenalty as BigNumber) : zero

  const maxLtvPrice = debtAmount.div(collateralAmount.times(maxLoanToValue))

  const closeToToken = isLambdaCloseToCollateral ? collateralToken : quoteToken
  const resolvedCloseToToken = isCollateralActive ? collateralToken : quoteToken

  const afterTraillingDistance = price

  const priceRatio = useMemo(() => {
    if (trailingStopLossLambdaData.dynamicParams?.executionPrice) {
      const trailingPricePlusDistance =
        trailingStopLossLambdaData.dynamicParams.executionPrice.plus(
          trailingStopLossLambdaData.trailingDistance,
        )

      return isShort
        ? one.div(trailingPricePlusDistance).div(collateralPrice)
        : trailingPricePlusDistance.div(quotePrice)
    }

    return isShort ? quotePrice.div(collateralPrice) : collateralPrice.div(quotePrice)
  }, [
    collateralPrice,
    isShort,
    quotePrice,
    trailingStopLossLambdaData.dynamicParams,
    trailingStopLossLambdaData.trailingDistance,
  ])

  const sliderStep = getSliderStep(isShort ? quotePrice : collateralPrice)
  const sliderMin = new BigNumber(
    maxLtvPrice.div(sliderStep).toFixed(0, BigNumber.ROUND_DOWN),
  ).times(sliderStep)
  const sliderMax = new BigNumber(
    priceRatio.div(sliderStep).toFixed(0, BigNumber.ROUND_DOWN),
  ).times(sliderStep)

  // then the trailing distance - if it's lower (by default) than the slider min, I'm setting it to the slider min
  // the actual value of the trailing distance used in the TX is called "trailingDistanceValue"
  const trailingDistance = useMemo(() => {
    if (afterTraillingDistance)
      return afterTraillingDistance.lt(sliderMin) ? sliderMin : afterTraillingDistance

    if (trailingStopLossLambdaData.trailingDistance)
      return sliderMax.minus(trailingStopLossLambdaData.trailingDistance)

    return sliderMax
  }, [afterTraillingDistance, sliderMax, sliderMin, trailingStopLossLambdaData.trailingDistance])
  const trailingDistanceValue = useMemo(
    // we use the opposite value when handling state
    // it's hard to have the slider go from token price to zero, so we do the opposite
    // then the actual value (distance) is sliderMax (token price) minus "trailingDistance" value
    () => sliderMax.minus(trailingDistance),
    [sliderMax, trailingDistance],
  )

  const sliderPercentageFill = getSliderPercentageFill({
    min: sliderMin,
    max: sliderMax.minus(sliderStep),
    value: trailingDistance,
  })

  const currentTrailingDistanceValue = useMemo(() => {
    const distance = trailingStopLossLambdaData.trailingDistance ?? zero
    if (isShort) {
      const oppositePrice = one.div(priceRatio)
      const executionPrice = oppositePrice.minus(distance)
      const executionHumanReadable = one.div(executionPrice)

      return priceRatio.minus(executionHumanReadable).abs()
    }

    return distance
  }, [isShort, priceRatio, trailingStopLossLambdaData.trailingDistance])

  const dynamicStopPrice = useMemo(() => {
    const lambdaDistanceValue = currentTrailingDistanceValue

    return isShort
      ? priceRatio.times(collateralPrice).plus(lambdaDistanceValue)
      : priceRatio.times(quotePrice).minus(lambdaDistanceValue)
  }, [collateralPrice, currentTrailingDistanceValue, isShort, priceRatio, quotePrice])
  const dynamicStopPriceChange = useMemo(() => {
    return isShort
      ? priceRatio.times(collateralPrice).plus(trailingDistanceValue)
      : priceRatio.times(quotePrice).minus(trailingDistanceValue)
  }, [collateralPrice, isShort, priceRatio, quotePrice, trailingDistanceValue])

  const estimatedTokenOnSLTrigger = useMemo(() => {
    if (isShort)
      return isLambdaCloseToCollateral
        ? collateralAmount
            .times(one.div(dynamicStopPrice))
            .minus(debtAmount)
            .div(one.div(dynamicStopPrice))
        : collateralAmount.times(one.div(dynamicStopPrice)).minus(debtAmount)

    return isLambdaCloseToCollateral
      ? collateralAmount.times(dynamicStopPrice).minus(debtAmount).div(dynamicStopPrice)
      : collateralAmount.times(dynamicStopPrice).minus(debtAmount)
  }, [collateralAmount, debtAmount, dynamicStopPrice, isLambdaCloseToCollateral, isShort])
  const estimatedTokenOnSLTriggerChange = useMemo(() => {
    if (isShort)
      return isCollateralActive
        ? collateralAmount
            .times(one.div(dynamicStopPriceChange))
            .minus(debtAmount)
            .div(one.div(dynamicStopPriceChange))
        : collateralAmount.times(one.div(dynamicStopPriceChange)).minus(debtAmount)

    return isCollateralActive
      ? collateralAmount.times(dynamicStopPriceChange).minus(debtAmount).div(dynamicStopPriceChange)
      : collateralAmount.times(dynamicStopPriceChange).minus(debtAmount)
  }, [isShort, isCollateralActive, collateralAmount, dynamicStopPriceChange, debtAmount])

  const trailingDistanceContentCardCommonData = useOmniCardTrailingDistance({
    afterTrailingDistance: afterTraillingDistance && isActive ? trailingDistanceValue : undefined,
    priceFormat,
    trailingDistance: isTrailingStopLossEnabled ? currentTrailingDistanceValue : undefined,
  })

  const resolvedDynamicStopLossPrice = isTrailingStopLossEnabled ? dynamicStopPrice : undefined
  const resolvedAfterDynamicStopLossPrice =
    afterTraillingDistance && isActive ? dynamicStopPriceChange : undefined

  const dynamicStopPriceContentCardCommonData = useOmniCardDataDynamicStopLossPrice({
    afterDynamicStopPrice: resolvedAfterDynamicStopLossPrice,
    dynamicStopPrice: resolvedDynamicStopLossPrice,
    priceFormat,
    ratioToLiquidationPrice: resolvedDynamicStopLossPrice?.minus(liquidationPrice),
    modal: (
      <OmniCardDataDynamicStopLossPriceModal
        dynamicStopLossPrice={resolvedDynamicStopLossPrice}
        priceFormat={priceFormat}
      />
    ),
  })

  const maxToken = isTrailingStopLossEnabled ? estimatedTokenOnSLTrigger : undefined
  const afterMaxToken =
    afterTraillingDistance && isActive ? estimatedTokenOnSLTriggerChange : undefined

  const collateralDuringLiquidation = getCollateralDuringLiquidation({
    debt: debtAmount,
    liquidationPenalty,
    liquidationPrice: maxLtvPrice,
    lockedCollateral: collateralAmount,
  })
  const savingCompareToLiquidation = getSavingCompareToLiquidation({
    afterDynamicStopLossPrice: resolvedAfterDynamicStopLossPrice,
    afterMaxToken,
    collateralDuringLiquidation,
    dynamicStopLossPrice: resolvedDynamicStopLossPrice,
    isCollateralActive,
    maxToken,
  })

  const estTokenOnTriggerContentCardCommonData = useOmniCardDataEstTokenOnTrigger({
    afterDynamicStopLossPrice: resolvedAfterDynamicStopLossPrice,
    afterMaxToken,
    closeToToken,
    dynamicStopLossPrice: resolvedDynamicStopLossPrice,
    maxToken,
    savingCompareToLiquidation,
    stateCloseToToken: resolvedCloseToToken,
    modal: (
      <OmniCardDataEstTokenOnTriggerModal
        token={closeToToken}
        liquidationPenalty={liquidationPenalty}
      />
    ),
  })

  const currentMarketPriceContentCardCommonData = {
    title: t('protection.current-market-price'),
    unit: priceFormat,
    value: `${formatCryptoBalance(isShort ? one.div(marketPrice) : marketPrice)}`,
  }

  const trailingDistanceForTx = trailingDistanceValue.eq(zero)
    ? currentTrailingDistanceValue
    : trailingDistanceValue

  return {
    afterMaxToken,
    currentMarketPriceContentCardCommonData,
    dynamicStopPriceChange,
    dynamicStopPriceContentCardCommonData,
    estTokenOnTriggerContentCardCommonData,
    isCollateralActive,
    isSimpleView,
    savingCompareToLiquidation,
    sliderMax,
    sliderMin,
    sliderPercentageFill,
    sliderStep,
    trailingDistance,
    trailingDistanceContentCardCommonData,
    trailingDistanceForTx,
  }
}
