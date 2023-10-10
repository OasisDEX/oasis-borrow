import type BigNumber from 'bignumber.js'
import { calculateCollRatioFromMultiple } from 'features/automation/common/helpers/calculateCollRatioFromMultiple'
import type { AutoBSTriggerData } from 'features/automation/common/state/autoBSTriggerData.types'
import {
  getConstantMultipleMultipliers,
  getDefaultMultiplier,
} from 'features/automation/optimization/common/multipliers'
import {
  getConstantMutliplyMinMaxValues,
  getEligibleMultipliers,
} from 'features/automation/optimization/constantMultiple/helpers'
import { prepareConstantMultipleResetData } from 'features/automation/optimization/constantMultiple/state/constantMultipleTriggerData'
import type { StopLossTriggerData } from 'features/automation/protection/stopLoss/state/stopLossTriggerData.types'
import { uiChanges } from 'helpers/uiChanges'
import { useEffect } from 'react'

import { CONSTANT_MULTIPLE_FORM_CHANGE } from './constantMultipleFormChange.constants'
import type { ConstantMultipleTriggerData } from './constantMultipleTriggerData.types'

export function useConstantMultipleStateInitialization({
  debt,
  ilk,
  debtFloor,
  liquidationRatio,
  lockedCollateral,
  positionRatio,
  constantMultipleTriggerData,
  autoSellTriggerData,
  stopLossTriggerData,
  autoBuyTriggerData,
}: {
  ilk: string
  positionRatio: BigNumber
  liquidationRatio: BigNumber
  lockedCollateral: BigNumber
  debtFloor: BigNumber
  debt: BigNumber
  constantMultipleTriggerData: ConstantMultipleTriggerData
  autoBuyTriggerData: AutoBSTriggerData
  autoSellTriggerData: AutoBSTriggerData
  stopLossTriggerData: StopLossTriggerData
}) {
  const { min, max } = getConstantMutliplyMinMaxValues({
    autoBuyTriggerData,
    stopLossTriggerData,
    liquidationRatio,
  })

  const multipliers = getConstantMultipleMultipliers({
    ilk,
    minColRatio: min,
    maxColRatio: max,
  })

  const eligibleMultipliers = getEligibleMultipliers({
    multipliers,
    positionRatio,
    lockedCollateral: lockedCollateral,
    debt: debt,
    debtFloor: debtFloor,
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
      isResetAction: true,
    })
    uiChanges.publish(CONSTANT_MULTIPLE_FORM_CHANGE, {
      type: 'is-awaiting-confirmation',
      isAwaitingConfirmation: false,
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
  }, [
    constantMultipleTriggerData.triggersId.join('-'),
    positionRatio.toNumber(),
    stopLossTriggerData.triggerId.toNumber(),
    autoBuyTriggerData.triggerId.toNumber(),
    autoSellTriggerData.triggerId.toNumber(),
  ])

  useEffect(() => {
    uiChanges.publish(CONSTANT_MULTIPLE_FORM_CHANGE, {
      type: 'current-form',
      currentForm: 'add',
    })
  }, [])

  return constantMultipleTriggerData.isTriggerEnabled
}
