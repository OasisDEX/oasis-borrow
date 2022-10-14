import { decodeTriggerData, TriggerType } from '@oasisdex/automation'
import { getNetworkId } from '@oasisdex/web3-context'
import BigNumber from 'bignumber.js'
import { NetworkIds } from 'blockchain/network'
import { UIChanges } from 'components/AppContext'
import { TriggerRecord, TriggersData } from 'features/automation/api/automationTriggersData'
import {
  DEFAULT_DISTANCE_FROM_TRIGGER_TO_TARGET,
  maxUint256,
} from 'features/automation/common/consts'
import {
  AUTO_BUY_FORM_CHANGE,
  AUTO_SELL_FORM_CHANGE,
  AutoBSFormChange,
} from 'features/automation/common/state/autoBSFormChange'
import { AutoBSTriggerData } from 'features/automation/common/state/autoBSTriggerData'
import { AutomationKinds } from 'features/automation/common/types'
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

export function prepareAutoBSSliderDefaults({
  execCollRatio,
  targetCollRatio,
  collateralizationRatio,
  publishKey,
}: {
  execCollRatio: BigNumber
  targetCollRatio: BigNumber
  collateralizationRatio: BigNumber
  publishKey: 'AUTO_SELL_FORM_CHANGE' | 'AUTO_BUY_FORM_CHANGE'
}) {
  const defaultTargetCollRatio = new BigNumber(collateralizationRatio)

  const defaultTriggerForSell = new BigNumber(
    collateralizationRatio.minus(DEFAULT_DISTANCE_FROM_TRIGGER_TO_TARGET),
  )
  const defaultTriggerForBuy = new BigNumber(
    collateralizationRatio.plus(DEFAULT_DISTANCE_FROM_TRIGGER_TO_TARGET),
  )

  return {
    execCollRatio:
      execCollRatio.isZero() && collateralizationRatio.gt(zero)
        ? publishKey === 'AUTO_SELL_FORM_CHANGE'
          ? defaultTriggerForSell.times(100).decimalPlaces(0, BigNumber.ROUND_DOWN)
          : defaultTriggerForBuy.times(100).decimalPlaces(0, BigNumber.ROUND_DOWN)
        : execCollRatio,
    targetCollRatio:
      targetCollRatio.isZero() && collateralizationRatio.gt(zero)
        ? defaultTargetCollRatio.times(100).decimalPlaces(0, BigNumber.ROUND_DOWN)
        : targetCollRatio,
  }
}

export function prepareAutoBSResetData(
  autoBSTriggersData: AutoBSTriggerData,
  collateralizationRatio: BigNumber,
  publishKey: 'AUTO_SELL_FORM_CHANGE' | 'AUTO_BUY_FORM_CHANGE',
) {
  const defaultSliderValues = prepareAutoBSSliderDefaults({
    execCollRatio: autoBSTriggersData.execCollRatio,
    targetCollRatio: autoBSTriggersData.targetCollRatio,
    collateralizationRatio,
    publishKey,
  })
  return {
    ...defaultSliderValues,
    maxBuyOrMinSellPrice: resolveMaxBuyOrMinSellPrice(autoBSTriggersData.maxBuyOrMinSellPrice),
    maxBaseFeeInGwei: autoBSTriggersData.maxBaseFeeInGwei,
    withThreshold: resolveWithThreshold({
      maxBuyOrMinSellPrice: autoBSTriggersData.maxBuyOrMinSellPrice,
      triggerId: autoBSTriggersData.triggerId,
    }),
    txDetails: {},
    isEditing: false,
  }
}

export function checkIfIsEditingAutoBS({
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
    (!autoBSTriggerData.isTriggerEnabled && autoBSState.isEditing) ||
    (autoBSTriggerData.isTriggerEnabled &&
      (!autoBSTriggerData.targetCollRatio.isEqualTo(autoBSState.targetCollRatio) ||
        !autoBSTriggerData.execCollRatio.isEqualTo(autoBSState.execCollRatio) ||
        !autoBSTriggerData.maxBaseFeeInGwei.isEqualTo(autoBSState.maxBaseFeeInGwei) ||
        (maxBuyOrMinSellPrice?.toNumber() !== autoBSState.maxBuyOrMinSellPrice?.toNumber() &&
          !autoBSTriggerData.triggerId.isZero()))) ||
    isRemoveForm
  )
}

export function checkIfIsDisabledAutoBS({
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

export function adjustDefaultValuesIfOutsideSlider({
  autoBSState,
  sliderMin,
  sliderMax,
  uiChanges,
  publishType,
}: {
  autoBSState: AutoBSFormChange
  sliderMin: BigNumber
  sliderMax: BigNumber
  uiChanges: UIChanges
  publishType: typeof AUTO_SELL_FORM_CHANGE | typeof AUTO_BUY_FORM_CHANGE
}) {
  const sliderValuesMap = {
    [AUTO_BUY_FORM_CHANGE]: { targetCollRatio: sliderMin, execCollRatio: sliderMin.plus(5) },
    [AUTO_SELL_FORM_CHANGE]: { targetCollRatio: sliderMin.plus(5), execCollRatio: sliderMin },
  }

  if (
    autoBSState.targetCollRatio.lt(sliderMin) ||
    autoBSState.targetCollRatio.gt(sliderMax) ||
    autoBSState.execCollRatio.gt(sliderMax) ||
    autoBSState.execCollRatio.lt(sliderMin)
  ) {
    uiChanges.publish(publishType, {
      type: 'target-coll-ratio',
      targetCollRatio: sliderValuesMap[publishType].targetCollRatio,
    })
    uiChanges.publish(publishType, {
      type: 'execution-coll-ratio',
      execCollRatio: sliderValuesMap[publishType].execCollRatio,
    })
  }
}

export function getAutomationThatClosedVault({
  stopLossTriggered,
  autoTakeProfitTriggered,
}: {
  stopLossTriggered: boolean
  autoTakeProfitTriggered: boolean
}) {
  return stopLossTriggered
    ? AutomationKinds.STOP_LOSS
    : autoTakeProfitTriggered
    ? AutomationKinds.AUTO_TAKE_PROFIT
    : undefined
}
