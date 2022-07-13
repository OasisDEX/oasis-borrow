import BigNumber from 'bignumber.js'
import { BasicBSTriggerData, maxUint256 } from 'features/automation/common/basicBSTriggerData'
import { BasicBSFormChange } from 'features/automation/protection/common/UITypes/basicBSFormChange'
import { SidebarVaultStages } from 'features/types/vaults/sidebarLabels'

export function resolveMaxBuyOrMinSellPrice(maxBuyOrMinSellPrice: BigNumber) {
  return maxBuyOrMinSellPrice.isZero() || maxBuyOrMinSellPrice.isEqualTo(maxUint256)
    ? undefined
    : maxBuyOrMinSellPrice
}

export function resolveWithThreshold({
  maxBuyOrMinSellPrice,
  triggerId,
}: {
  maxBuyOrMinSellPrice: BigNumber
  triggerId: BigNumber
}) {
  return (
    (!maxBuyOrMinSellPrice.isZero() && !maxBuyOrMinSellPrice.isEqualTo(maxUint256)) ||
    triggerId.isZero()
  )
}

export function prepareBasicBSResetData(basicBSTriggersData: BasicBSTriggerData) {
  return {
    targetCollRatio: basicBSTriggersData.targetCollRatio,
    execCollRatio: basicBSTriggersData.execCollRatio,
    maxBuyOrMinSellPrice: resolveMaxBuyOrMinSellPrice(basicBSTriggersData.maxBuyOrMinSellPrice),
    maxBaseFeeInGwei: basicBSTriggersData.maxBaseFeeInGwei,
    withThreshold: resolveWithThreshold({
      maxBuyOrMinSellPrice: basicBSTriggersData.maxBuyOrMinSellPrice,
      triggerId: basicBSTriggersData.triggerId,
    }),
    txDetails: {},
  }
}

export function checkIfEditingBasicBS({
  basicBSTriggerData,
  basicBSState,
  isRemoveForm,
}: {
  basicBSTriggerData: BasicBSTriggerData
  basicBSState: BasicBSFormChange
  isRemoveForm: boolean
}) {
  const maxBuyOrMinSellPrice = resolveMaxBuyOrMinSellPrice(basicBSTriggerData.maxBuyOrMinSellPrice)

  return (
    !basicBSTriggerData.targetCollRatio.isEqualTo(basicBSState.targetCollRatio) ||
    !basicBSTriggerData.execCollRatio.isEqualTo(basicBSState.execCollRatio) ||
    !basicBSTriggerData.maxBaseFeeInGwei.isEqualTo(basicBSState.maxBaseFeeInGwei) ||
    (maxBuyOrMinSellPrice?.toNumber() !== basicBSState.maxBuyOrMinSellPrice?.toNumber() &&
      !basicBSTriggerData.triggerId.isZero()) ||
    isRemoveForm
  )
}

export function checkIfDisabledBasicBS({
  isProgressStage,
  isOwner,
  isEditing,
  isAddForm,
  basicBSState,
  stage,
}: {
  isProgressStage?: boolean
  isOwner: boolean
  isEditing: boolean
  isAddForm: boolean
  basicBSState: BasicBSFormChange
  stage: SidebarVaultStages
}) {
  return (
    (isProgressStage ||
      !isOwner ||
      !isEditing ||
      (isAddForm &&
        basicBSState.withThreshold &&
        (basicBSState.maxBuyOrMinSellPrice === undefined ||
          basicBSState.maxBuyOrMinSellPrice?.isZero())) ||
      basicBSState.execCollRatio.isZero()) &&
    stage !== 'txSuccess'
  )
}
