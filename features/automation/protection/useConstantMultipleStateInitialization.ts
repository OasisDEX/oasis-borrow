import { TriggerType } from '@oasisdex/automation'
import { IlkData } from 'blockchain/ilks'
import { InstiVault } from 'blockchain/instiVault'
import { Vault } from 'blockchain/vaults'
import { useAppContext } from 'components/AppContextProvider'
import { extractBasicBSData } from 'features/automation/common/basicBSTriggerData'
import { calculateCollRatioFromMultiple } from 'features/automation/common/helpers'
import {
  extractConstantMultipleData,
  prepareConstantMultipleResetData,
} from 'features/automation/optimization/common/constantMultipleTriggerData'
import { getConstantMutliplyMinMaxValues } from 'features/automation/optimization/common/helpers'
import { getConstantMultipleMultipliers } from 'features/automation/optimization/common/multipliers'
import { extractStopLossData } from 'features/automation/protection/common/stopLossTriggerData'
import { useEffect } from 'react'

import { CONSTANT_MULTIPLE_FORM_CHANGE } from './common/UITypes/constantMultipleFormChange'
import { TriggersData } from './triggers/AutomationTriggersData'

export const CONSTANT_MULTIPLE_GROUP_TYPE = 1

export const DEFAULT_TARGET_OFFSET = 10

export function useConstantMultipleStateInitialization(
  ilkData: IlkData,
  vault: Vault | InstiVault,
  autoTriggersData: TriggersData,
) {
  const { uiChanges } = useAppContext()

  const stopLossTriggerData = extractStopLossData(autoTriggersData)
  const autoBuyTriggerData = extractBasicBSData({
    triggersData: autoTriggersData,
    triggerType: TriggerType.BasicBuy,
  })
  const constantMultipleTriggerData = extractConstantMultipleData(autoTriggersData)
  const collateralizationRatio = vault.collateralizationRatio.toNumber()

  const { min, max } = getConstantMutliplyMinMaxValues({
    autoBuyTriggerData,
    stopLossTriggerData,
    ilkData,
    lockedCollateralUSD: vault.lockedCollateralUSD,
  })

  const acceptableMultipliers = getConstantMultipleMultipliers({
    ilk: ilkData.ilk,
    minColRatio: min,
    maxColRatio: max,
  })
  const defaultMultiplier = acceptableMultipliers[Math.floor(acceptableMultipliers.length / 2) - 1]
  const defaultCollRatio = calculateCollRatioFromMultiple(defaultMultiplier)

  useEffect(() => {
    uiChanges.publish(CONSTANT_MULTIPLE_FORM_CHANGE, {
      type: 'form-defaults',
      acceptableMultipliers,
      defaultMultiplier,
      defaultCollRatio,
      minTargetRatio: min,
      maxTargetRatio: max,
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
  }, [collateralizationRatio])

  return constantMultipleTriggerData.isTriggerEnabled
}
