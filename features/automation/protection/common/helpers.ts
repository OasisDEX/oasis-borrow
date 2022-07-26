import BigNumber from 'bignumber.js'
import { IlkData } from 'blockchain/ilks'
import { UIChanges } from 'components/AppContext'
import { VaultViewMode } from 'components/vault/GeneralManageTabBar'
import { BasicBSTriggerData } from 'features/automation/common/basicBSTriggerData'
import { DEFAULT_BASIC_BS_MAX_SLIDER_VALUE } from 'features/automation/protection/common/consts/automationDefaults'
import { StopLossTriggerData } from 'features/automation/protection/common/stopLossTriggerData'
import {
  AutomationOptimizationFeatures,
  AutomationProtectionFeatures,
} from 'features/automation/protection/common/UITypes/AutomationFeatureChange'
import {
  AutomationFromKind,
  PROTECTION_MODE_CHANGE_SUBJECT,
} from 'features/automation/protection/common/UITypes/ProtectionFormModeChange'
import { TAB_CHANGE_SUBJECT } from 'features/automation/protection/common/UITypes/TabChange'
import { useFeatureToggle } from 'helpers/useFeatureToggle'

export function getIsEditingProtection({
  isStopLossEnabled,
  selectedSLValue,
  stopLossLevel,
  collateralActive,
  isToCollateral,
}: {
  isStopLossEnabled: boolean
  selectedSLValue: BigNumber
  stopLossLevel: BigNumber
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
    collateralActive !== isToCollateral
  )
}

export function getStartingSlRatio({
  isStopLossEnabled,
  stopLossLevel,
  initialVaultCollRatio,
}: {
  isStopLossEnabled: boolean
  stopLossLevel: BigNumber
  initialVaultCollRatio: BigNumber
}) {
  return isStopLossEnabled ? stopLossLevel : initialVaultCollRatio
}

export function backToVaultOverview(uiChanges: UIChanges) {
  uiChanges.publish(TAB_CHANGE_SUBJECT, {
    type: 'change-tab',
    currentMode: VaultViewMode.Overview,
  })
  uiChanges.publish(PROTECTION_MODE_CHANGE_SUBJECT, {
    currentMode: AutomationFromKind.ADJUST,
    type: 'change-mode',
  })
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
      min: stopLossTriggerData.stopLossLevel.times(100).plus(5),
      max: autoBuyTriggerData.execCollRatio.minus(5),
    }
  }

  if (autoBuyTriggerData.isTriggerEnabled) {
    return {
      min: ilkData.liquidationRatio.times(100).plus(5),
      max: autoBuyTriggerData.execCollRatio.minus(5),
    }
  }

  if (stopLossTriggerData.isStopLossEnabled) {
    return {
      min: stopLossTriggerData.stopLossLevel.times(100).plus(5),
      max: DEFAULT_BASIC_BS_MAX_SLIDER_VALUE.times(100),
    }
  }

  return {
    min: ilkData.liquidationRatio.times(100).plus(5),
    max: DEFAULT_BASIC_BS_MAX_SLIDER_VALUE.times(100),
  }
}
