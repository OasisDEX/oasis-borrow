import type { AaveLikePositionV2 } from '@oasisdex/dma-library'
import BigNumber from 'bignumber.js'
import { AutomationFeatures } from 'features/automation/common/types'
import {
  getDynamicStopLossPrice,
  getMaxToken,
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
import { one } from 'helpers/zero'
import { useMemo } from 'react'

export const useOmniStopLossDataHandler = () => {
  const {
    environment: { productType, collateralToken, quoteToken, isShort, priceFormat },
  } = useOmniGeneralContext()
  const {
    dynamicMetadata: {
      values: { automation },
    },
    automation: {
      automationForm: { state },
    },
    position: {
      currentPosition: { position },
    },
  } = useOmniProductContext(productType)
  const isStopLossEnabled = !!automation?.flags.isStopLossEnabled
  const castedPosition = position as AaveLikePositionV2

  // maybe we could always resolve it to either ltv or executionLtv
  const currentTriggerLtv =
    automation?.triggers.stopLoss?.decodedParams?.ltv ||
    automation?.triggers.stopLoss?.decodedParams?.executionLtv

  const liquidationPrice = castedPosition.liquidationPrice
  const liquidationRatio = one.div(castedPosition.maxRiskRatio.loanToValue)
  const positionLtv = castedPosition.riskRatio.loanToValue
  const positionMaxLtv = castedPosition.category.liquidationThreshold
  const positionLiquidationPenalty = castedPosition.liquidationPenalty

  const defaultStopLossLevel = useMemo(
    () => castedPosition.category.maxLoanToValue.minus(stopLossConstants.offsets.manage.max),
    [castedPosition.category.maxLoanToValue],
  )

  const isActive = state.uiDropdownProtection === AutomationFeatures.STOP_LOSS
  const stopLossLevel = currentTriggerLtv ? new BigNumber(currentTriggerLtv) : undefined
  const afterStopLossLevel = state.triggerLtv
  const resolvedAfterStopLossLevel = isActive ? afterStopLossLevel : undefined

  const displayStopLossLevel = afterStopLossLevel || stopLossLevel || defaultStopLossLevel

  const isCollateralActive = !!automation?.triggers.stopLoss?.triggerTypeName.includes('Collateral')
  const closeToToken = isCollateralActive ? collateralToken : quoteToken
  const stateCloseToToken = state.resolveTo === 'collateral' ? collateralToken : quoteToken

  const dynamicStopLossPrice =
    stopLossLevel &&
    getDynamicStopLossPrice({
      liquidationPrice,
      liquidationRatio,
      stopLossLevel: one.div(stopLossLevel.div(100)).times(100),
    })

  const afterDynamicStopLossPrice =
    resolvedAfterStopLossLevel &&
    getDynamicStopLossPrice({
      liquidationPrice,
      liquidationRatio,
      stopLossLevel: one.div(resolvedAfterStopLossLevel.div(100)).times(100),
    })

  const resolvedAfterDynamicStopLossPrice =
    afterDynamicStopLossPrice &&
    (isShort ? one.div(afterDynamicStopLossPrice) : afterDynamicStopLossPrice).div(100)

  const resolvedDynamicStopLossPrice = dynamicStopLossPrice
    ? (isShort ? one.div(dynamicStopLossPrice) : dynamicStopLossPrice).div(100)
    : undefined

  const stopLossLtvContentCardCommonData = useOmniCardDataStopLossLtv({
    stopLossLtv: stopLossLevel,
    afterStopLossLtv: resolvedAfterStopLossLevel,
    loanToValue: positionLtv,
    ratioToPositionLtv: stopLossLevel?.minus(positionLtv),
    modal: <OmniCardDataStopLossLtvModal stopLossLtv={stopLossLevel} />,
  })

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

  const maxToken =
    stopLossLevel &&
    getMaxToken({
      stopLossLevel: one.div(stopLossLevel).times(100),
      lockedCollateral: castedPosition.collateralAmount,
      liquidationRatio,
      liquidationPrice,
      debt: castedPosition.debtAmount,
    })

  const afterMaxToken =
    resolvedAfterStopLossLevel &&
    getMaxToken({
      stopLossLevel: one.div(resolvedAfterStopLossLevel).times(100),
      lockedCollateral: castedPosition.collateralAmount,
      liquidationRatio,
      liquidationPrice,
      debt: castedPosition.debtAmount,
    })

  const estTokenOnTriggerContentCardCommonData = useOmniCardDataEstTokenOnTrigger({
    isCollateralActive,
    liquidationPrice,
    collateralAmount: castedPosition.collateralAmount,
    debtAmount: castedPosition.debtAmount,
    collateralToken,
    liquidationPenalty: positionLiquidationPenalty,
    dynamicStopLossPrice: resolvedDynamicStopLossPrice,
    afterDynamicStopLossPrice: resolvedAfterDynamicStopLossPrice,
    closeToToken,
    stateCloseToToken,
    maxToken,
    afterMaxToken,
    modal: (
      <OmniCardDataEstTokenOnTriggerModal
        token={closeToToken}
        liquidationPenalty={positionLiquidationPenalty}
      />
    ),
  })

  const omniCardLtvAutomationData: OmniCardLtvAutomationData = {
    isStopLossLikeEnabled: isStopLossEnabled,
    stopLossLikeTriggerLevel: stopLossLevel,
    stopLossType: AutomationFeatures.STOP_LOSS,
  }

  const ltvContentCardCommonData = useOmniCardDataLtv({
    ltv: positionLtv,
    maxLtv: positionMaxLtv,
    automation: omniCardLtvAutomationData,
    modal: (
      <OmniCardDataLtvModal
        ltv={positionLtv}
        maxLtv={positionMaxLtv}
        automation={omniCardLtvAutomationData}
      />
    ),
  })
  const sliderMin = useMemo(
    () => positionLtv.plus(stopLossConstants.offsets.manage.min),
    [positionLtv],
  )
  const sliderMax = useMemo(
    () => positionMaxLtv.minus(stopLossConstants.offsets.manage.max),
    [positionMaxLtv],
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
  const sliderStep = stopLossConstants.sliderStep
  return {
    isStopLossEnabled,
    castedPosition,
    currentTriggerLtv,
    stopLossLevel,
    afterStopLossLevel,
    defaultStopLossLevel,
    /**
     * Contains the stop loss level in order: afterStopLossLevel, stopLossLevel, defaultStopLossLevel
     */
    displayStopLossLevel,
    isCollateralActive,
    closeToToken,
    stateCloseToToken,
    dynamicStopLossPrice,
    afterDynamicStopLossPrice,
    resolvedAfterDynamicStopLossPrice,
    resolvedDynamicStopLossPrice,
    stopLossLtvContentCardCommonData,
    dynamicStopPriceContentCardCommonData,
    maxToken,
    afterMaxToken,
    estTokenOnTriggerContentCardCommonData,
    omniCardLtvAutomationData,
    ltvContentCardCommonData,
    sliderMin,
    sliderMax,
    sliderPercentageFill,
    sliderStep,
  }
}
