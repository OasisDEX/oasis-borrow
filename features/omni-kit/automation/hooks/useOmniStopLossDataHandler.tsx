import { type LendingPosition } from '@oasisdex/dma-library'
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
    environment: { productType, collateralToken, quoteToken, isShort, priceFormat },
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

  const liquidationPriceLtv = debtAmount.div(collateralAmount.times(liquidationPrice))
  const liquidationRatio = one.div(liquidationPriceLtv)
  const liquidationPenalty =
    'liquidationPenalty' in position ? (position.liquidationPenalty as BigNumber) : zero

  const defaultStopLossLevel = maxLoanToValue.minus(stopLossConstants.offsets.max)
  const stopLossLevel = currentTriggerLtv
  const afterStopLossLevel = triggerLtv
  const resolvedAfterStopLossLevel = isActive ? afterStopLossLevel : undefined
  const displayStopLossLevel = afterStopLossLevel || stopLossLevel || defaultStopLossLevel

  const closeToToken = isWithCollateral ? collateralToken : quoteToken
  const resolvedCloseToToken = isCollateralActive ? collateralToken : quoteToken

  const dynamicStopLossPrice =
    stopLossLevel &&
    getDynamicStopLossPrice({
      liquidationPrice,
      liquidationRatio,
      stopLossLevel: isShort ? one.div(stopLossLevel) : one.div(stopLossLevel.div(100)).times(100),
    })

  const afterDynamicStopLossPrice =
    resolvedAfterStopLossLevel &&
    getDynamicStopLossPrice({
      liquidationPrice,
      liquidationRatio,
      stopLossLevel: isShort
        ? one.div(resolvedAfterStopLossLevel)
        : one.div(resolvedAfterStopLossLevel.div(100)).times(100),
    })

  const resolvedAfterDynamicStopLossPrice =
    afterDynamicStopLossPrice &&
    (isShort ? one.div(afterDynamicStopLossPrice) : afterDynamicStopLossPrice).div(100)

  const resolvedDynamicStopLossPrice = dynamicStopLossPrice
    ? (isShort ? one.div(dynamicStopLossPrice) : dynamicStopLossPrice).div(100)
    : undefined

  const stopLossLtvContentCardCommonData = useOmniCardDataStopLossLtv({
    afterStopLossLtv: resolvedAfterStopLossLevel,
    loanToValue: loanToValue,
    ratioToPositionLtv: stopLossLevel?.minus(loanToValue),
    stopLossLtv: stopLossLevel,
    modal: <OmniCardDataStopLossLtvModal stopLossLtv={stopLossLevel} />,
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
    stopLossLevel &&
    getMaxToken({
      debt: debtAmount,
      isCollateralActive,
      liquidationPrice,
      liquidationRatio,
      lockedCollateral: collateralAmount,
      stopLossLevel: one.div(stopLossLevel).times(100),
    })

  const afterMaxToken =
    resolvedAfterStopLossLevel &&
    getMaxToken({
      debt: debtAmount,
      isCollateralActive,
      liquidationPrice,
      liquidationRatio,
      lockedCollateral: collateralAmount,
      stopLossLevel: one.div(resolvedAfterStopLossLevel).times(100),
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
    stopLossLikeTriggerLevel: stopLossLevel,
    stopLossType: AutomationFeatures.STOP_LOSS,
  }

  const ltvContentCardCommonData = useOmniCardDataLtv({
    automation: omniCardLtvAutomationData,
    ltv: loanToValue,
    maxLtv: liquidationPriceLtv,
    modal: (
      <OmniCardDataLtvModal
        ltv={loanToValue}
        maxLtv={liquidationPriceLtv}
        automation={omniCardLtvAutomationData}
      />
    ),
  })
  const sliderMin = useMemo(() => loanToValue.plus(stopLossConstants.offsets.min), [loanToValue])
  const sliderMax = useMemo(
    () => liquidationPriceLtv.minus(stopLossConstants.offsets.max),
    [liquidationPriceLtv],
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
