import BigNumber from 'bignumber.js'
import { UIChanges } from 'components/AppContext'
import { VaultViewMode } from 'components/VaultTabSwitch'
import {
  AutomationFromKind,
  PROTECTION_MODE_CHANGE_SUBJECT,
} from 'features/automation/protection/common/UITypes/ProtectionFormModeChange'
import { TAB_CHANGE_SUBJECT } from 'features/automation/protection/common/UITypes/TabChange'

export function getIsEditingProtection({
  isStopLossEnabled,
  selectedSLValue,
  startingSlRatio,
  stopLossLevel,
  collateralActive,
  isToCollateral,
}: {
  isStopLossEnabled: boolean
  selectedSLValue: BigNumber
  startingSlRatio: BigNumber
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
    (!isStopLossEnabled && !selectedSLValue.eq(startingSlRatio.multipliedBy(100))) ||
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
