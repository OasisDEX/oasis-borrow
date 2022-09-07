import { IlkData } from 'blockchain/ilks'
import { InstiVault } from 'blockchain/instiVault'
import { Vault } from 'blockchain/vaults'
import { useAppContext } from 'components/AppContextProvider'
import { BasicBSTriggerData } from 'features/automation/common/basicBSTriggerData'
import {
  calculateCollRatioFromMultiple,
  getEligibleMultipliers,
} from 'features/automation/common/helpers'
import {
  ConstantMultipleTriggerData,
  prepareConstantMultipleResetData,
} from 'features/automation/optimization/common/constantMultipleTriggerData'
import { getConstantMutliplyMinMaxValues } from 'features/automation/optimization/common/helpers'
import {
  getConstantMultipleMultipliers,
  getDefaultMultiplier,
} from 'features/automation/optimization/common/multipliers'
import { StopLossTriggerData } from 'features/automation/protection/common/stopLossTriggerData'
import { useEffect } from 'react'

import { CONSTANT_MULTIPLE_FORM_CHANGE } from './common/UITypes/constantMultipleFormChange'

export const CONSTANT_MULTIPLE_GROUP_TYPE = 1

export const DEFAULT_TARGET_OFFSET = 10

export function useConstantMultipleStateInitialization(
  ilkData: IlkData,
  vault: Vault | InstiVault,
  constantMultipleTriggerData: ConstantMultipleTriggerData,
  autoBuyTriggerData: BasicBSTriggerData,
  autoSellTriggerData: BasicBSTriggerData,
  stopLossTriggerData: StopLossTriggerData,
) {
  const { uiChanges } = useAppContext()

  const collateralizationRatio = vault.collateralizationRatio.toNumber()

  const { min, max } = getConstantMutliplyMinMaxValues({
    autoBuyTriggerData,
    stopLossTriggerData,
    ilkData,
  })

  const multipliers = getConstantMultipleMultipliers({
    ilk: ilkData.ilk,
    minColRatio: min,
    maxColRatio: max,
  })

  const eligibleMultipliers = getEligibleMultipliers({
    multipliers,
    collateralizationRatio: vault.collateralizationRatio,
    lockedCollateral: vault.lockedCollateral,
    debt: vault.debt,
    debtFloor: ilkData.debtFloor,
    deviation: constantMultipleTriggerData.deviation,
    minTargetRatio: min,
    maxTargetRatio: max,
  })

  const defaultMultiplier =
    getDefaultMultiplier({
      multipliers: eligibleMultipliers,
      minColRatio: min,
      maxColRatio: max,
    }) || multipliers[0] // fallback to not break data preparation

  const defaultCollRatio = calculateCollRatioFromMultiple(defaultMultiplier)

  useEffect(() => {
    uiChanges.publish(CONSTANT_MULTIPLE_FORM_CHANGE, {
      type: 'form-defaults',
      multipliers,
      defaultMultiplier,
      eligibleMultipliers,
      defaultCollRatio,
      minTargetRatio: min,
      maxTargetRatio: max,
    })
    uiChanges.publish(CONSTANT_MULTIPLE_FORM_CHANGE, {
      type: 'is-reset-action',
      isResetAction: false,
    })
    uiChanges.publish(CONSTANT_MULTIPLE_FORM_CHANGE, {
      type: 'reset',
      resetData: prepareConstantMultipleResetData({
        defaultMultiplier,
        defaultCollRatio,
        constantMultipleTriggerData,
      }),
    })
    uiChanges.publish(CONSTANT_MULTIPLE_FORM_CHANGE, {
      type: 'continuous',
      continuous: constantMultipleTriggerData.continuous,
    })
    uiChanges.publish(CONSTANT_MULTIPLE_FORM_CHANGE, {
      type: 'deviation',
      deviation: constantMultipleTriggerData.deviation,
    })
    uiChanges.publish(CONSTANT_MULTIPLE_FORM_CHANGE, {
      type: 'current-form',
      currentForm: 'add',
    })
  }, [
    collateralizationRatio,
    stopLossTriggerData.triggerId.toNumber(),
    autoBuyTriggerData.triggerId.toNumber(),
    autoSellTriggerData.triggerId.toNumber(),
  ])

  return constantMultipleTriggerData.isTriggerEnabled
}
