import BigNumber from 'bignumber.js'
import { Vault } from 'blockchain/vaults'
import { BasicBSTriggerData, maxUint256 } from 'features/automation/common/basicBSTriggerData'
import { BasicBSFormChange } from 'features/automation/protection/common/UITypes/basicBSFormChange'
import { getVaultChange } from 'features/multiply/manage/pipes/manageMultiplyVaultCalculations'
import { SidebarVaultStages } from 'features/types/vaults/sidebarLabels'
import { LOAN_FEE, OAZO_FEE } from 'helpers/multiply/calculations'
import { zero } from 'helpers/zero'

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
        (basicBSState.execCollRatio.isZero() ||
          basicBSState.targetCollRatio.isZero() ||
          (basicBSState.withThreshold &&
            (basicBSState.maxBuyOrMinSellPrice === undefined ||
              basicBSState.maxBuyOrMinSellPrice?.isZero()))))) &&
    stage !== 'txSuccess'
  )
}

export function getBasicBSVaultChange({
  basicBSState,
  executionPrice,
  vault,
}: {
  basicBSState: BasicBSFormChange
  executionPrice: BigNumber
  vault: Vault
}) {
  return basicBSState.targetCollRatio.gt(zero) &&
    basicBSState.execCollRatio.gt(zero) &&
    executionPrice.gt(zero)
    ? getVaultChange({
        currentCollateralPrice: executionPrice,
        marketPrice: executionPrice,
        slippage: basicBSState.deviation.div(100),
        debt: vault.debt,
        lockedCollateral: vault.lockedCollateral,
        requiredCollRatio: basicBSState.targetCollRatio.div(100),
        depositAmount: zero,
        paybackAmount: zero,
        generateAmount: zero,
        withdrawAmount: zero,
        OF: OAZO_FEE,
        FF: LOAN_FEE,
      })
    : { debtDelta: zero, collateralDelta: zero }
}
