import type { LendingPosition } from '@oasisdex/dma-library'
import type BigNumber from 'bignumber.js'
import { AutomationFeatures } from 'features/automation/common/types'
import {
  getCollateralDuringLiquidation,
  getDynamicStopLossPrice,
  getMaxToken,
  getSavingCompareToLiquidation,
  getSliderPercentageFill,
} from 'features/automation/protection/stopLoss/helpers'
import { stopLossConstants } from 'features/omni-kit/automation/constants'
import type { OmniCardLtvAutomationData } from 'features/omni-kit/components/details-section'
import {
  OmniCardDataDynamicStopLossPriceModal,
  OmniCardDataEstTokenOnTriggerModal,
  OmniCardDataLtvModal,
  OmniCardDataStopLossLtvModal,
  useOmniCardDataDynamicStopLossPrice,
  useOmniCardDataEstTokenOnTrigger,
  useOmniCardDataLtv,
  useOmniCardDataStopLossLtv,
} from 'features/omni-kit/components/details-section'
import { useOmniGeneralContext, useOmniProductContext } from 'features/omni-kit/contexts'
import { one, zero } from 'helpers/zero'
import React, { useMemo } from 'react'

export const useOmniStopLossDataHandler = () => {
  const {
    environment: { collateralToken, isShort, priceFormat, productType, quoteToken },
  } = useOmniGeneralContext()
  const {
    dynamicMetadata: {
      values: { automation },
    },
    automation: {
      commonForm: {
        state: { uiDropdownProtection },
      },
      automationForms: {
        stopLoss: {
          state: { triggerLtv, resolveTo },
        },
      },
    },
    position: {
      currentPosition: { position },
    },
  } = useOmniProductContext(productType)

  const {
    debtAmount,
    collateralAmount,
    liquidationPrice,
    riskRatio: { loanToValue },
    maxRiskRatio: { loanToValue: maxLoanToValue },
  } = position as LendingPosition

  const isStopLossEnabled = !!automation?.flags.isStopLossEnabled
  const isActive = uiDropdownProtection === AutomationFeatures.STOP_LOSS
  const isWithCollateral = automation?.triggers.stopLoss?.triggerTypeName
    .toLowerCase()
    .includes('collateral')
  const isCollateralActive = resolveTo ? resolveTo === 'collateral' : !!isWithCollateral

  // maybe we could always resolve it to either ltv or executionLtv
  const currentTriggerLtv =
    automation?.triggers.stopLoss?.decodedMappedParams?.ltv ||
    automation?.triggers.stopLoss?.decodedMappedParams?.executionLtv

  // const positionMaxLtv = castedPosition.category.liquidationThreshold
  const liquidationRatio = one.div(maxLoanToValue)
  const liquidationPenalty =
    'liquidationPenalty' in position ? (position.liquidationPenalty as BigNumber) : zero
  const defaultStopLossLevel = maxLoanToValue.minus(stopLossConstants.offsets.max)
  const resolvedTriggerLtv = isActive ? triggerLtv : undefined
  const displayStopLossLevel = triggerLtv ?? currentTriggerLtv ?? defaultStopLossLevel

  const closeToToken = isWithCollateral ? collateralToken : quoteToken
  const resolvedCloseToToken = isCollateralActive ? collateralToken : quoteToken

  const dynamicStopLossPrice =
    currentTriggerLtv &&
    getDynamicStopLossPrice({
      liquidationPrice,
      liquidationRatio,
      stopLossLevel: isShort
        ? one.div(currentTriggerLtv)
        : one.div(currentTriggerLtv.div(100)).times(100),
    })

  const afterDynamicStopLossPrice =
    resolvedTriggerLtv &&
    getDynamicStopLossPrice({
      liquidationPrice,
      liquidationRatio,
      stopLossLevel: isShort
        ? one.div(resolvedTriggerLtv)
        : one.div(resolvedTriggerLtv.div(100)).times(100),
    })

  const resolvedAfterDynamicStopLossPrice =
    afterDynamicStopLossPrice &&
    (isShort ? one.div(afterDynamicStopLossPrice) : afterDynamicStopLossPrice).div(100)

  const resolvedDynamicStopLossPrice = dynamicStopLossPrice
    ? (isShort ? one.div(dynamicStopLossPrice) : dynamicStopLossPrice).div(100)
    : undefined

  const stopLossLtvContentCardCommonData = useOmniCardDataStopLossLtv({
    afterStopLossLtv: resolvedTriggerLtv,
    loanToValue: loanToValue,
    ratioToPositionLtv: currentTriggerLtv?.minus(loanToValue),
    stopLossLtv: currentTriggerLtv,
    modal: <OmniCardDataStopLossLtvModal stopLossLtv={currentTriggerLtv} />,
  })

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

  const maxToken =
    currentTriggerLtv &&
    getMaxToken({
      debt: debtAmount,
      isCollateralActive: !!isWithCollateral,
      liquidationPrice,
      liquidationRatio,
      lockedCollateral: collateralAmount,
      stopLossLevel: one.div(currentTriggerLtv).times(100),
    })

  const afterMaxToken =
    resolvedTriggerLtv &&
    getMaxToken({
      debt: debtAmount,
      isCollateralActive,
      liquidationPrice,
      liquidationRatio,
      lockedCollateral: collateralAmount,
      stopLossLevel: one.div(resolvedTriggerLtv).times(100),
    })

  const collateralDuringLiquidation = getCollateralDuringLiquidation({
    debt: debtAmount,
    liquidationPenalty,
    liquidationPrice,
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

  const omniCardLtvAutomationData: OmniCardLtvAutomationData = {
    isStopLossLikeEnabled: isStopLossEnabled,
    stopLossLikeTriggerLevel: currentTriggerLtv,
    stopLossType: AutomationFeatures.STOP_LOSS,
  }

  const ltvContentCardCommonData = useOmniCardDataLtv({
    automation: omniCardLtvAutomationData,
    ltv: loanToValue,
    maxLtv: maxLoanToValue,
    modal: (
      <OmniCardDataLtvModal
        ltv={loanToValue}
        maxLtv={maxLoanToValue}
        automation={omniCardLtvAutomationData}
      />
    ),
  })
  const sliderMin = useMemo(() => loanToValue.plus(stopLossConstants.offsets.min), [loanToValue])
  const sliderMax = useMemo(
    () => maxLoanToValue.minus(stopLossConstants.offsets.max),
    [maxLoanToValue],
  )

  const sliderPercentageFill = useMemo(
    () =>
      getSliderPercentageFill({
        min: sliderMin,
        max: sliderMax,
        value: displayStopLossLevel,
      }),
    [sliderMax, sliderMin, displayStopLossLevel],
  )

  return {
    afterMaxToken,
    displayStopLossLevel,
    dynamicStopPriceContentCardCommonData,
    estTokenOnTriggerContentCardCommonData,
    isCollateralActive,
    isStopLossEnabled,
    ltvContentCardCommonData,
    resolvedAfterDynamicStopLossPrice,
    resolvedDynamicStopLossPrice,
    savingCompareToLiquidation,
    sliderMax,
    sliderMin,
    sliderPercentageFill,
    sliderStep: stopLossConstants.sliderStep,
    stopLossLtvContentCardCommonData,
  }
}
