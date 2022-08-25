import { decodeTriggerData, TriggerType } from '@oasisdex/automation'
import { getNetworkId } from '@oasisdex/web3-context'
import BigNumber from 'bignumber.js'
import { NetworkIds } from 'blockchain/network'
import { collateralPriceAtRatio } from 'blockchain/vault.maths'
import { TriggerRecord, TriggersData } from 'features/automation/api/automationTriggersData'
import { maxUint256, MIX_MAX_COL_RATIO_TRIGGER_OFFSET } from 'features/automation/common/consts'
import { AutoBSFormChange } from 'features/automation/common/state/autoBSFormChange'
import { AutoBSTriggerData } from 'features/automation/common/state/autoBSTriggerData'
import { getVaultChange } from 'features/multiply/manage/pipes/manageMultiplyVaultCalculations'
import { SidebarVaultStages } from 'features/types/vaults/sidebarLabels'
import { LOAN_FEE, OAZO_FEE } from 'helpers/multiply/calculations'
import { one, zero } from 'helpers/zero'

export function getTriggersByType(triggers: TriggerRecord[], triggerTypes: TriggerType[]) {
  const networkId = getNetworkId() === NetworkIds.GOERLI ? NetworkIds.GOERLI : NetworkIds.MAINNET

  try {
    const decodedTriggers = triggers.map((trigger) => {
      return {
        triggerId: trigger.triggerId,
        result: decodeTriggerData(trigger.commandAddress, networkId, trigger.executionParams),
      }
    })

    return decodedTriggers.filter((decodedTrigger) => {
      const triggerType = decodedTrigger.result[1]

      return triggerTypes.includes(triggerType)
    })
  } catch (e) {
    console.error(e)
    return []
  }
}

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

export function prepareAutoBSResetData(autoBSTriggersData: AutoBSTriggerData) {
  return {
    targetCollRatio: autoBSTriggersData.targetCollRatio,
    execCollRatio: autoBSTriggersData.execCollRatio,
    maxBuyOrMinSellPrice: resolveMaxBuyOrMinSellPrice(autoBSTriggersData.maxBuyOrMinSellPrice),
    maxBaseFeeInGwei: autoBSTriggersData.maxBaseFeeInGwei,
    withThreshold: resolveWithThreshold({
      maxBuyOrMinSellPrice: autoBSTriggersData.maxBuyOrMinSellPrice,
      triggerId: autoBSTriggersData.triggerId,
    }),
    txDetails: {},
  }
}

export function checkIfEditingAutoBS({
  autoBSTriggerData,
  autoBSState,
  isRemoveForm,
}: {
  autoBSTriggerData: AutoBSTriggerData
  autoBSState: AutoBSFormChange
  isRemoveForm: boolean
}) {
  const maxBuyOrMinSellPrice = resolveMaxBuyOrMinSellPrice(autoBSTriggerData.maxBuyOrMinSellPrice)

  return (
    !autoBSTriggerData.targetCollRatio.isEqualTo(autoBSState.targetCollRatio) ||
    !autoBSTriggerData.execCollRatio.isEqualTo(autoBSState.execCollRatio) ||
    !autoBSTriggerData.maxBaseFeeInGwei.isEqualTo(autoBSState.maxBaseFeeInGwei) ||
    (maxBuyOrMinSellPrice?.toNumber() !== autoBSState.maxBuyOrMinSellPrice?.toNumber() &&
      !autoBSTriggerData.triggerId.isZero()) ||
    isRemoveForm
  )
}

export function checkIfDisabledAutoBS({
  isProgressStage,
  isOwner,
  isEditing,
  isAddForm,
  autoBSState,
  stage,
}: {
  isProgressStage?: boolean
  isOwner: boolean
  isEditing: boolean
  isAddForm: boolean
  autoBSState: AutoBSFormChange
  stage: SidebarVaultStages
}) {
  return (
    (isProgressStage ||
      !isOwner ||
      !isEditing ||
      (isAddForm &&
        (autoBSState.execCollRatio.isZero() ||
          autoBSState.targetCollRatio.isZero() ||
          (autoBSState.withThreshold &&
            (autoBSState.maxBuyOrMinSellPrice === undefined ||
              autoBSState.maxBuyOrMinSellPrice?.isZero()))))) &&
    stage !== 'txSuccess'
  )
}

export function getAutoBSVaultChange({
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
