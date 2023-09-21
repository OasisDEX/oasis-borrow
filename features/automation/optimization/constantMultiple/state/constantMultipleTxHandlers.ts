import { maxUint256 } from 'blockchain/calls/erc20.constants'
import { prepareAddConstantMultipleTriggerData } from 'features/automation/optimization/constantMultiple/state/constantMultipleTriggersData'
import { uiChanges } from 'helpers/uiChanges'
import { zero } from 'helpers/zero'
import { useMemo } from 'react'

import { CONSTANT_MULTIPLE_FORM_CHANGE } from './constantMultipleFormChange.constants'
import type {
  ConstantMultipleTxHandlers,
  GetConstantMultipleTxHandlersParams,
} from './constantMultipleTxHandlers.types'

export function getConstantMultipleTxHandlers({
  autoBuyTriggerData,
  autoSellTriggerData,
  constantMultipleState,
  constantMultipleTriggerData,
  isAddForm,
  positionRatio,
  id,
  owner,
}: GetConstantMultipleTxHandlersParams): ConstantMultipleTxHandlers {
  const addTxData = useMemo(
    () =>
      prepareAddConstantMultipleTriggerData({
        id,
        owner,
        triggersId: constantMultipleTriggerData.triggersId,
        autoBuyTriggerId: autoBuyTriggerData.triggerId,
        autoSellTriggerId: autoSellTriggerData.triggerId,
        maxBuyPrice: constantMultipleState.buyWithThreshold
          ? constantMultipleState.maxBuyPrice || maxUint256
          : maxUint256,
        minSellPrice: constantMultipleState.sellWithThreshold
          ? constantMultipleState.minSellPrice || zero
          : zero,
        buyExecutionCollRatio: constantMultipleState.buyExecutionCollRatio,
        sellExecutionCollRatio: constantMultipleState.sellExecutionCollRatio,
        targetCollRatio: constantMultipleState.targetCollRatio, // TODO calculate using constantMultipleState.multiplier
        continuous: constantMultipleState.continuous,
        deviation: constantMultipleState.deviation,
        maxBaseFeeInGwei: constantMultipleState.maxBaseFeeInGwei,
      }),
    [
      constantMultipleTriggerData.triggersId,
      positionRatio.toNumber(),
      constantMultipleState.maxBuyPrice?.toNumber(),
      constantMultipleState.minSellPrice?.toNumber(),
      constantMultipleState.buyExecutionCollRatio?.toNumber(),
      constantMultipleState.sellExecutionCollRatio?.toNumber(),
      constantMultipleState.buyWithThreshold,
      constantMultipleState.sellWithThreshold,
      constantMultipleState.targetCollRatio.toNumber(),
      constantMultipleState.continuous,
      constantMultipleState.deviation?.toNumber(),
      constantMultipleState.maxBaseFeeInGwei?.toNumber(),
    ],
  )

  function textButtonHandlerExtension() {
    if (isAddForm) {
      uiChanges.publish(CONSTANT_MULTIPLE_FORM_CHANGE, {
        type: 'multiplier',
        multiplier: 0,
      })
      uiChanges.publish(CONSTANT_MULTIPLE_FORM_CHANGE, {
        type: 'sell-execution-coll-ratio',
        sellExecutionCollRatio: zero,
      })
      uiChanges.publish(CONSTANT_MULTIPLE_FORM_CHANGE, {
        type: 'buy-execution-coll-ratio',
        buyExecutionCollRatio: zero,
      })
    }
  }

  return {
    addTxData,
    textButtonHandlerExtension,
  }
}
