import { decodeTriggerData, TriggerType } from '@oasisdex/automation'
import { getNetworkId } from '@oasisdex/web3-context'
import BigNumber from 'bignumber.js'
import { NetworkIds } from 'blockchain/network'
import { collateralPriceAtRatio } from 'blockchain/vault.maths'
import { BasicBSTriggerData } from 'features/automation/common/basicBSTriggerData'
import { maxUint256, MIX_MAX_COL_RATIO_TRIGGER_OFFSET } from 'features/automation/common/consts'
import { BasicBSFormChange } from 'features/automation/protection/common/UITypes/basicBSFormChange'
import {
  TriggerRecord,
  TriggersData,
} from 'features/automation/protection/triggers/AutomationTriggersData'
import { getVaultChange } from 'features/multiply/manage/pipes/manageMultiplyVaultCalculations'
import { SidebarVaultStages } from 'features/types/vaults/sidebarLabels'
import { LOAN_FEE, OAZO_FEE } from 'helpers/multiply/calculations'
import { one, zero } from 'helpers/zero'

export const ACCEPTABLE_FEE_DIFF = new BigNumber(3)
export const DEFAULT_DISTANCE_FROM_TRIGGER_TO_TARGET = 0.2
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

export function prepareBasicBSSliderDefaults({
  execCollRatio,
  targetCollRatio,
  collateralizationRatio,
  publishKey,
}: {
  execCollRatio: BigNumber
  targetCollRatio: BigNumber
  collateralizationRatio: BigNumber
  publishKey: 'BASIC_SELL_FORM_CHANGE' | 'BASIC_BUY_FORM_CHANGE'
}) {
  const defaultTargetCollRatio = new BigNumber(collateralizationRatio)

  const defaultTriggerForSell = new BigNumber(
    collateralizationRatio.minus(DEFAULT_DISTANCE_FROM_TRIGGER_TO_TARGET),
  )
  const defaultTriggerForBuy = new BigNumber(
    collateralizationRatio.plus(DEFAULT_DISTANCE_FROM_TRIGGER_TO_TARGET),
  )

  return {
    execCollRatio: execCollRatio.isZero()
      ? publishKey === 'BASIC_SELL_FORM_CHANGE'
        ? defaultTriggerForSell.times(100).decimalPlaces(0, BigNumber.ROUND_DOWN)
        : defaultTriggerForBuy.times(100).decimalPlaces(0, BigNumber.ROUND_DOWN)
      : execCollRatio,
    targetCollRatio: targetCollRatio.isZero()
      ? defaultTargetCollRatio.times(100).decimalPlaces(0, BigNumber.ROUND_DOWN)
      : targetCollRatio,
  }
}

export function prepareBasicBSResetData(
  basicBSTriggersData: BasicBSTriggerData,
  collateralizationRatio: BigNumber,
  publishKey: 'BASIC_SELL_FORM_CHANGE' | 'BASIC_BUY_FORM_CHANGE',
) {
  const defaultSliderValues = prepareBasicBSSliderDefaults({
    execCollRatio: basicBSTriggersData.execCollRatio,
    targetCollRatio: basicBSTriggersData.targetCollRatio,
    collateralizationRatio,
    publishKey,
  })
  return {
    ...defaultSliderValues,
    maxBuyOrMinSellPrice: resolveMaxBuyOrMinSellPrice(basicBSTriggersData.maxBuyOrMinSellPrice),
    maxBaseFeeInGwei: basicBSTriggersData.maxBaseFeeInGwei,
    withThreshold: resolveWithThreshold({
      maxBuyOrMinSellPrice: basicBSTriggersData.maxBuyOrMinSellPrice,
      triggerId: basicBSTriggersData.triggerId,
    }),
    txDetails: {},
    isEditing: false,
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
    (!basicBSTriggerData.isTriggerEnabled && basicBSState.isEditing) ||
    (basicBSTriggerData.isTriggerEnabled &&
      (!basicBSTriggerData.targetCollRatio.isEqualTo(basicBSState.targetCollRatio) ||
        !basicBSTriggerData.execCollRatio.isEqualTo(basicBSState.execCollRatio) ||
        !basicBSTriggerData.maxBaseFeeInGwei.isEqualTo(basicBSState.maxBaseFeeInGwei) ||
        (maxBuyOrMinSellPrice?.toNumber() !== basicBSState.maxBuyOrMinSellPrice?.toNumber() &&
          !basicBSTriggerData.triggerId.isZero()))) ||
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

        const { debtDelta } = getBasicBSVaultChange({
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

      const { debtDelta: debtDeltaAtCurrentCollRatio } = getBasicBSVaultChange({
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
