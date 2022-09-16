import BigNumber from 'bignumber.js'
import { IlkData } from 'blockchain/ilks'
import { collateralPriceAtRatio } from 'blockchain/vault.maths'
import {
  DEFAULT_AUTO_BS_MAX_SLIDER_VALUE,
  MIX_MAX_COL_RATIO_TRIGGER_OFFSET,
} from 'features/automation/common/consts'
import {
  calculateCollRatioFromMultiple,
  calculateMultipleFromTargetCollRatio,
  getAutoBSVaultChange,
  resolveMaxBuyOrMinSellPrice,
} from 'features/automation/common/helpers'
import { AutoBSTriggerData } from 'features/automation/common/state/autoBSTriggerData'
import { ConstantMultipleFormChange } from 'features/automation/optimization/constantMultiple/state/constantMultipleFormChange'
import { ConstantMultipleTriggerData } from 'features/automation/optimization/constantMultiple/state/constantMultipleTriggerData'
import { getAutoSellMinMaxValues } from 'features/automation/protection/autoSell/helpers'
import { StopLossTriggerData } from 'features/automation/protection/stopLoss/state/stopLossTriggerData'
import { SidebarVaultStages } from 'features/types/vaults/sidebarLabels'

export function getConstantMutliplyMinMaxValues({
  ilkData,
  autoBuyTriggerData,
  stopLossTriggerData,
}: {
  ilkData: IlkData
  autoBuyTriggerData: AutoBSTriggerData
  stopLossTriggerData: StopLossTriggerData
}) {
  return {
    min: getAutoSellMinMaxValues({
      autoBuyTriggerData,
      stopLossTriggerData,
      ilkData,
    }).min,
    max: DEFAULT_AUTO_BS_MAX_SLIDER_VALUE,
  }
}

export function checkIfIsEditingConstantMultiple({
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
      const sellExecutionExtremes = [
        minTargetRatio,
        targetCollRatio.minus(MIX_MAX_COL_RATIO_TRIGGER_OFFSET),
      ]

      const verifiedSellExtremes = sellExecutionExtremes.map((sellExecutionCollRatio) => {
        const sellExecutionPrice = collateralPriceAtRatio({
          colRatio: sellExecutionCollRatio.div(100),
          collateral: lockedCollateral,
          vaultDebt: debt,
        })

        const { debtDelta } = getAutoBSVaultChange({
          targetCollRatio,
          execCollRatio: sellExecutionCollRatio,
          deviation,
          executionPrice: sellExecutionPrice,
          lockedCollateral,
          debt,
        })

        return !debtFloor.gt(debt.plus(debtDelta))
      })

      // IF following array is equal to [false] it means that whole range of sell execution coll ratio would lead
      // to dust limit issue and therefore multiplier should be disabled
      const deduplicatedVerifiedSellExtremes = [...new Set(verifiedSellExtremes)]

      const executionPriceAtCurrentCollRatio = collateralPriceAtRatio({
        colRatio: collateralizationRatio,
        collateral: lockedCollateral,
        vaultDebt: debt,
      })

      const { debtDelta: debtDeltaAtCurrentCollRatio } = getAutoBSVaultChange({
        targetCollRatio,
        execCollRatio: collateralizationRatio.times(100),
        deviation,
        executionPrice: executionPriceAtCurrentCollRatio,
        lockedCollateral,
        debt,
      })

      return !(
        debtFloor.gt(debt.plus(debtDeltaAtCurrentCollRatio)) ||
        (deduplicatedVerifiedSellExtremes.length === 1 && !deduplicatedVerifiedSellExtremes[0])
      )
    })
    .filter((item) => item >= minMultiplier && item <= maxMultiplier)
}

export function checkIfIsDisabledConstantMultiple({
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
