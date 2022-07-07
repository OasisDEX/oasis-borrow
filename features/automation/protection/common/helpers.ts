import BigNumber from 'bignumber.js'
import { UIChanges } from 'components/AppContext'
import { VaultViewMode } from 'components/VaultTabSwitch'
import { AutomationProtectionFeatures } from 'features/automation/protection/common/UITypes/AutomationFeatureChange'
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
