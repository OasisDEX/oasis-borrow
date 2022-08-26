import { IlkData } from 'blockchain/ilks'
import { BasicBSTriggerData } from 'features/automation/common/basicBSTriggerData'
import { DEFAULT_BASIC_BS_MAX_SLIDER_VALUE } from 'features/automation/common/consts'
import { resolveMaxBuyOrMinSellPrice } from 'features/automation/common/helpers'
import { ConstantMultipleTriggerData } from 'features/automation/optimization/common/constantMultipleTriggerData'
import { getBasicSellMinMaxValues } from 'features/automation/protection/common/helpers'
import { StopLossTriggerData } from 'features/automation/protection/common/stopLossTriggerData'
import { ConstantMultipleFormChange } from 'features/automation/protection/common/UITypes/constantMultipleFormChange'
import { SidebarVaultStages } from 'features/types/vaults/sidebarLabels'

export function getConstantMutliplyMinMaxValues({
  ilkData,
  autoBuyTriggerData,
  stopLossTriggerData,
}: {
  ilkData: IlkData
  autoBuyTriggerData: BasicBSTriggerData
  stopLossTriggerData: StopLossTriggerData
}) {
  return {
    min: getBasicSellMinMaxValues({
      autoBuyTriggerData,
      stopLossTriggerData,
      ilkData,
    }).min,
    max: DEFAULT_BASIC_BS_MAX_SLIDER_VALUE,
  }
}

export function checkIfEditingConstantMultiple({
  triggerData,
  state,
  isRemoveForm = false,
}: {
  triggerData: ConstantMultipleTriggerData
  state: ConstantMultipleFormChange
  isRemoveForm?: boolean
}) {
  const resolvedMaxBuyPrice = resolveMaxBuyOrMinSellPrice(triggerData.maxBuyPrice)
  const resolvedMinSellPrice = resolveMaxBuyOrMinSellPrice(triggerData.minSellPrice)

  return (
    (!triggerData.isTriggerEnabled && state.isEditing) ||
    (triggerData.isTriggerEnabled &&
      (!triggerData.buyExecutionCollRatio.isEqualTo(state.buyExecutionCollRatio) ||
        !triggerData.sellExecutionCollRatio.isEqualTo(state.sellExecutionCollRatio) ||
        !triggerData.targetCollRatio.isEqualTo(state.targetCollRatio) ||
        !triggerData.maxBaseFeeInGwei.isEqualTo(state.maxBaseFeeInGwei) ||
        resolvedMaxBuyPrice?.toNumber() !== state.maxBuyPrice?.toNumber() ||
        resolvedMinSellPrice?.toNumber() !== state.minSellPrice?.toNumber())) ||
    isRemoveForm
  )
}

export function checkIfDisabledConstantMultiple({
  isProgressStage,
  isOwner,
  isEditing,
  isAddForm,
  state,
  stage,
}: {
  isProgressStage?: boolean
  isOwner: boolean
  isEditing: boolean
  isAddForm: boolean
  state: ConstantMultipleFormChange
  stage: SidebarVaultStages
}) {
  return (
    (isProgressStage ||
      !isOwner ||
      !isEditing ||
      (isAddForm &&
        (state.buyExecutionCollRatio.isZero() ||
          state.sellExecutionCollRatio.isZero() ||
          state.targetCollRatio.isZero() ||
          (state.buyWithThreshold &&
            (state.maxBuyPrice === undefined || state.maxBuyPrice?.isZero())) ||
          (state.sellWithThreshold &&
            (state.minSellPrice === undefined || state.minSellPrice?.isZero()))))) &&
    stage !== 'txSuccess'
  )
}
