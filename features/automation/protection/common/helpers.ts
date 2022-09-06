import BigNumber from 'bignumber.js'
import { IlkData } from 'blockchain/ilks'
import { BasicBSTriggerData } from 'features/automation/common/basicBSTriggerData'
import {
  DEFAULT_BASIC_BS_MAX_SLIDER_VALUE,
  MIX_MAX_COL_RATIO_TRIGGER_OFFSET,
} from 'features/automation/common/consts'
import { StopLossTriggerData } from 'features/automation/protection/common/stopLossTriggerData'
import {
  AutomationOptimizationFeatures,
  AutomationProtectionFeatures,
} from 'features/automation/protection/common/UITypes/AutomationFeatureChange'
import { useFeatureToggle } from 'helpers/useFeatureToggle'

export function getIsEditingProtection({
  isStopLossEnabled,
  selectedSLValue,
  stopLossLevel,
  isRemoveForm,
  collateralActive,
  isToCollateral,
}: {
  isStopLossEnabled: boolean
  selectedSLValue: BigNumber
  stopLossLevel: BigNumber
  isRemoveForm: boolean
  collateralActive?: boolean
  isToCollateral?: boolean
}) {
  if (
    (collateralActive === undefined && isToCollateral === undefined) ||
    selectedSLValue.isZero()
  ) {
    return false
  }

  return (
    (isStopLossEnabled && !selectedSLValue.eq(stopLossLevel.multipliedBy(100))) ||
    collateralActive !== isToCollateral ||
    isRemoveForm
  )
}

export function getStartingSlRatio({
  isStopLossEnabled,
  stopLossLevel,
  initialStopLossSelected,
}: {
  isStopLossEnabled: boolean
  stopLossLevel: BigNumber
  initialStopLossSelected: BigNumber
}) {
  return isStopLossEnabled ? stopLossLevel : initialStopLossSelected
}

export function getSliderPercentageFill({
  value,
  min,
  max,
}: {
  value: BigNumber
  min: BigNumber
  max: BigNumber
}) {
  return value
    .minus(min.times(100))
    .div(max.times(100).decimalPlaces(0, BigNumber.ROUND_DOWN).div(100).minus(min))
}

export function getActiveProtectionFeature({
  isAutoSellOn,
  isStopLossOn,
  section,
  currentProtectionFeature,
}: {
  isAutoSellOn: boolean
  isStopLossOn: boolean
  section: 'form' | 'details'
  currentProtectionFeature?: AutomationProtectionFeatures
}) {
  const basicBSEnabled = useFeatureToggle('BasicBS')

  if (section === 'form') {
    return {
      isAutoSellActive:
        (isAutoSellOn && !isStopLossOn && currentProtectionFeature !== 'stopLoss') ||
        currentProtectionFeature === 'autoSell',
      isStopLossActive:
        (isStopLossOn && currentProtectionFeature !== 'autoSell') ||
        currentProtectionFeature === 'stopLoss',
    }
  }

  if (section === 'details') {
    return {
      isAutoSellActive: isAutoSellOn || currentProtectionFeature === 'autoSell',
      isStopLossActive: isStopLossOn || currentProtectionFeature === 'stopLoss' || !basicBSEnabled,
    }
  }

  return {
    isAutoSellActive: false,
    isStopLossActive: false,
  }
}

export function getActiveOptimizationFeature({
  isAutoBuyOn,
  isConstantMultipleOn,
  section,
  currentOptimizationFeature,
}: {
  isAutoBuyOn: boolean
  isConstantMultipleOn: boolean
  section: 'form' | 'details'
  currentOptimizationFeature?: AutomationOptimizationFeatures
}) {
  const constantMultipleEnabled = useFeatureToggle('ConstantMultiple')

  if (section === 'form') {
    return {
      isAutoBuyActive:
        (isAutoBuyOn &&
          !isConstantMultipleOn &&
          currentOptimizationFeature !== 'constantMultiple') ||
        currentOptimizationFeature === 'autoBuy',
      isConstantMultipleActive:
        (isConstantMultipleOn && currentOptimizationFeature !== 'autoBuy') ||
        currentOptimizationFeature === 'constantMultiple',
    }
  }

  if (section === 'details') {
    return {
      isAutoBuyActive: isAutoBuyOn || currentOptimizationFeature === 'autoBuy',
      isConstantMultipleActive:
        isConstantMultipleOn ||
        currentOptimizationFeature === 'constantMultiple' ||
        !constantMultipleEnabled,
    }
  }

  return {
    isAutoBuyActive: false,
    isConstantMultipleActive: false,
  }
}

export function getBasicSellMinMaxValues({
  ilkData,
  autoBuyTriggerData,
  stopLossTriggerData,
}: {
  ilkData: IlkData
  autoBuyTriggerData: BasicBSTriggerData
  stopLossTriggerData: StopLossTriggerData
}) {
  if (autoBuyTriggerData.isTriggerEnabled && stopLossTriggerData.isStopLossEnabled) {
    return {
      min: stopLossTriggerData.stopLossLevel.times(100).plus(MIX_MAX_COL_RATIO_TRIGGER_OFFSET),
      max: autoBuyTriggerData.execCollRatio.minus(MIX_MAX_COL_RATIO_TRIGGER_OFFSET),
    }
  }

  if (autoBuyTriggerData.isTriggerEnabled) {
    return {
      min: ilkData.liquidationRatio.times(100).plus(MIX_MAX_COL_RATIO_TRIGGER_OFFSET),
      max: autoBuyTriggerData.execCollRatio.minus(MIX_MAX_COL_RATIO_TRIGGER_OFFSET),
    }
  }

  if (stopLossTriggerData.isStopLossEnabled) {
    return {
      min: stopLossTriggerData.stopLossLevel.times(100).plus(MIX_MAX_COL_RATIO_TRIGGER_OFFSET),
      max: DEFAULT_BASIC_BS_MAX_SLIDER_VALUE,
    }
  }

  return {
    min: ilkData.liquidationRatio.times(100).plus(MIX_MAX_COL_RATIO_TRIGGER_OFFSET),
    max: DEFAULT_BASIC_BS_MAX_SLIDER_VALUE,
  }
}
