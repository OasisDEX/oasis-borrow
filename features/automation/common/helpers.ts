import BigNumber from 'bignumber.js'
import { collateralPriceAtRatio } from 'blockchain/vault.maths'
import { BasicBSTriggerData, maxUint256 } from 'features/automation/common/basicBSTriggerData'
import { MIX_MAX_COL_RATIO_TRIGGER_OFFSET } from 'features/automation/optimization/common/multipliers'
import { BasicBSFormChange } from 'features/automation/protection/common/UITypes/basicBSFormChange'
import { TriggersData } from 'features/automation/protection/triggers/AutomationTriggersData'
import { getVaultChange } from 'features/multiply/manage/pipes/manageMultiplyVaultCalculations'
import { SidebarVaultStages } from 'features/types/vaults/sidebarLabels'
import { LOAN_FEE, OAZO_FEE } from 'helpers/multiply/calculations'
import { one, zero } from 'helpers/zero'

export const ACCEPTABLE_FEE_DIFF = new BigNumber(3)

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
  targetCollRatio,
  execCollRatio,
  deviation,
  executionPrice,
  debt,
  lockedCollateral,
}: {
  targetCollRatio: BigNumber
  execCollRatio: BigNumber
  executionPrice: BigNumber
  deviation: BigNumber
  debt: BigNumber
  lockedCollateral: BigNumber
}) {
  return targetCollRatio.gt(zero) && execCollRatio.gt(zero) && executionPrice.gt(zero)
    ? getVaultChange({
        currentCollateralPrice: executionPrice,
        marketPrice: executionPrice,
        slippage: deviation.div(100),
        debt: debt,
        lockedCollateral: lockedCollateral,
        requiredCollRatio: targetCollRatio.div(100),
        depositAmount: zero,
        paybackAmount: zero,
        generateAmount: zero,
        withdrawAmount: zero,
        OF: OAZO_FEE,
        FF: LOAN_FEE,
      })
    : { debtDelta: zero, collateralDelta: zero }
}

export function calculateCollRatioFromMultiple(multiplier: number) {
  return new BigNumber(multiplier / (multiplier - 1))
    .decimalPlaces(2, BigNumber.ROUND_DOWN)
    .times(100)
}

export function calculateMultipleFromTargetCollRatio(targetCollRatio: BigNumber) {
  return one.div(targetCollRatio.div(100).minus(one)).plus(one)
}

export function getShouldRemoveAllowance(automationTriggersData: TriggersData) {
  return automationTriggersData.triggers?.length === 1
}

export function getEligibleMultipliers({
  multipliers,
  collateralizationRatio,
  lockedCollateral,
  debt,
  debtFloor,
  deviation,
  minTargetRatio,
  maxTargetRatio,
}: {
  multipliers: number[]
  collateralizationRatio: BigNumber
  lockedCollateral: BigNumber
  debt: BigNumber
  debtFloor: BigNumber
  deviation: BigNumber
  minTargetRatio: BigNumber
  maxTargetRatio: BigNumber
}) {
  const maxMultiplier = calculateMultipleFromTargetCollRatio(
    minTargetRatio.plus(MIX_MAX_COL_RATIO_TRIGGER_OFFSET),
  ).toNumber()

  const minMultiplier = calculateMultipleFromTargetCollRatio(
    maxTargetRatio.minus(MIX_MAX_COL_RATIO_TRIGGER_OFFSET),
  ).toNumber()

  return multipliers
    .filter((multiplier) => {
      const targetCollRatio = calculateCollRatioFromMultiple(multiplier)

      const executionPrice = collateralPriceAtRatio({
        colRatio: collateralizationRatio,
        collateral: lockedCollateral,
        vaultDebt: debt,
      })

      const { debtDelta } = getBasicBSVaultChange({
        targetCollRatio,
        execCollRatio: collateralizationRatio.times(100),
        deviation,
        executionPrice,
        lockedCollateral,
        debt: debt,
      })
      return !debtFloor.gt(debt.plus(debtDelta))
    })
    .filter((item) => item >= minMultiplier && item <= maxMultiplier)
}
