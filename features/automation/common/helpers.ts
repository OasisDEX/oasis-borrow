import { Result } from '@ethersproject/abi'
import { TriggerType } from '@oasisdex/automation'
import { decodeTriggerDataAsJson } from '@oasisdex/automation'
import {
  AutomationEventIds,
  CommonAnalyticsSections,
  Pages,
  trackingEvents,
} from 'analytics/analytics'
import BigNumber from 'bignumber.js'
import { NetworkIds } from 'blockchain/networkIds'
import { UIChanges } from 'components/AppContext'
import { TriggerRecord, TriggersData } from 'features/automation/api/automationTriggersData'
import {
  aaveTokenPairsAllowedAutomation,
  DEFAULT_DISTANCE_FROM_TRIGGER_TO_TARGET,
  DEFAULT_THRESHOLD_FROM_LOWEST_POSSIBLE_SL_VALUE,
  maxUint256,
  MIX_MAX_COL_RATIO_TRIGGER_OFFSET,
  protocolAutomations,
} from 'features/automation/common/consts'
import {
  AUTO_BUY_FORM_CHANGE,
  AUTO_SELL_FORM_CHANGE,
  AutoBSFormChange,
} from 'features/automation/common/state/autoBSFormChange'
import { AutoBSTriggerData } from 'features/automation/common/state/autoBSTriggerData'
import {
  AutomationFeatures,
  AutomationKinds,
  SidebarAutomationStages,
} from 'features/automation/common/types'
import { CloseVaultTo } from 'features/multiply/manage/pipes/manageMultiplyVault'
import { getVaultChange } from 'features/multiply/manage/pipes/manageMultiplyVaultCalculations'
import { SidebarVaultStages } from 'features/types/vaults/sidebarLabels'
import { getNetworkId } from 'features/web3Context'
import { VaultProtocol } from 'helpers/getVaultProtocol'
import { LOAN_FEE, OAZO_FEE } from 'helpers/multiply/calculations'
import { useDebouncedCallback } from 'helpers/useDebouncedCallback'
import { one, zero } from 'helpers/zero'

export interface TriggerDataType {
  triggerId: number
  result: Result
  executionParams: string
  commandAddress: string
}

export function getTriggersByType(
  triggers: TriggerRecord[],
  triggerTypes: TriggerType[],
): TriggerDataType[] {
  const networkId = getNetworkId() === NetworkIds.GOERLI ? NetworkIds.GOERLI : NetworkIds.MAINNET

  try {
    const decodedTriggers = triggers.map((trigger) => {
      const result = decodeTriggerDataAsJson(
        trigger.commandAddress,
        networkId,
        trigger.executionParams,
      )

      return {
        triggerId: trigger.triggerId,
        result,
        executionParams: trigger.executionParams,
        commandAddress: trigger.commandAddress,
      }
    })

    return decodedTriggers.filter((decodedTrigger) => {
      const triggerType = Number(decodedTrigger.result.triggerType)
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
  positionRatio,
  publishKey,
}: {
  execCollRatio: BigNumber
  targetCollRatio: BigNumber
  positionRatio: BigNumber
  publishKey: 'AUTO_SELL_FORM_CHANGE' | 'AUTO_BUY_FORM_CHANGE'
}) {
  const defaultTargetCollRatio = new BigNumber(positionRatio)

  const defaultTriggerForSell = new BigNumber(
    positionRatio.minus(DEFAULT_DISTANCE_FROM_TRIGGER_TO_TARGET),
  )
  const defaultTriggerForBuy = new BigNumber(
    positionRatio.plus(DEFAULT_DISTANCE_FROM_TRIGGER_TO_TARGET),
  )

  return {
    execCollRatio:
      execCollRatio.isZero() && positionRatio.gt(zero)
        ? publishKey === 'AUTO_SELL_FORM_CHANGE'
          ? defaultTriggerForSell.times(100).decimalPlaces(0, BigNumber.ROUND_DOWN)
          : defaultTriggerForBuy.times(100).decimalPlaces(0, BigNumber.ROUND_DOWN)
        : execCollRatio,
    targetCollRatio:
      targetCollRatio.isZero() && positionRatio.gt(zero)
        ? defaultTargetCollRatio.times(100).decimalPlaces(0, BigNumber.ROUND_DOWN)
        : targetCollRatio,
  }
}

export function prepareAutoBSResetData(
  autoBSTriggersData: AutoBSTriggerData,
  positionRatio: BigNumber,
  publishKey: 'AUTO_SELL_FORM_CHANGE' | 'AUTO_BUY_FORM_CHANGE',
) {
  const defaultSliderValues = prepareAutoBSSliderDefaults({
    execCollRatio: autoBSTriggersData.execCollRatio,
    targetCollRatio: autoBSTriggersData.targetCollRatio,
    positionRatio,
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
  stage: SidebarVaultStages | SidebarAutomationStages
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

const analyticsPageMap = {
  [AutomationFeatures.AUTO_SELL]: Pages.AutoSell,
  [AutomationFeatures.AUTO_BUY]: Pages.AutoBuy,
  [AutomationFeatures.CONSTANT_MULTIPLE]: Pages.ConstantMultiple,
}

export function automationMultipleRangeSliderAnalytics({
  leftValue,
  rightValue,
  vaultId,
  positionRatio,
  ilk,
  type,
  targetMultiple,
}: {
  leftValue: BigNumber
  rightValue: BigNumber
  vaultId: BigNumber
  positionRatio: BigNumber
  ilk: string
  type:
    | AutomationFeatures.AUTO_SELL
    | AutomationFeatures.AUTO_BUY
    | AutomationFeatures.CONSTANT_MULTIPLE
  targetMultiple?: BigNumber
}) {
  const analyticsAdditionalParams = {
    vaultId: vaultId.toString(),
    ilk: ilk,
    collateralRatio: positionRatio.times(100).decimalPlaces(2).toString(),
    ...(targetMultiple && { targetMultiple: targetMultiple.toString() }),
  }

  const leftValueKeyMap = {
    [AutomationFeatures.AUTO_SELL]: 'triggerSellValue',
    [AutomationFeatures.AUTO_BUY]: 'targetValue',
    [AutomationFeatures.CONSTANT_MULTIPLE]: 'triggerSellValue',
  }

  const rightValueKeyMap = {
    [AutomationFeatures.AUTO_SELL]: 'targetValue',
    [AutomationFeatures.AUTO_BUY]: 'triggerBuyValue',
    [AutomationFeatures.CONSTANT_MULTIPLE]: 'triggerBuyValue',
  }

  useDebouncedCallback((value) => {
    const parsedValues = JSON.parse(value)
    trackingEvents.automation.inputChange(
      AutomationEventIds.MoveSlider,
      analyticsPageMap[type],
      CommonAnalyticsSections.Form,
      {
        ...analyticsAdditionalParams,
        [leftValueKeyMap[type]]: parsedValues.leftValue,
        [rightValueKeyMap[type]]: parsedValues.rightValue,
      },
    )
  }, JSON.stringify({ leftValue: leftValue.toString(), rightValue: rightValue.toString() }))
}

const noThreshold = 'NoThreshold'

export function resolveMinSellPriceAnalytics({
  withMinSellPriceThreshold,
  minSellPrice,
}: {
  withMinSellPriceThreshold?: boolean
  minSellPrice?: BigNumber
}) {
  return !withMinSellPriceThreshold ? noThreshold : minSellPrice ? minSellPrice.toString() : '0'
}

export function resolveMaxBuyPriceAnalytics({
  withMaxBuyPriceThreshold,
  maxBuyPrice,
}: {
  withMaxBuyPriceThreshold?: boolean
  maxBuyPrice?: BigNumber
}) {
  return !withMaxBuyPriceThreshold ? noThreshold : maxBuyPrice ? maxBuyPrice.toString() : '0'
}

export function automationInputsAnalytics({
  minSellPrice,
  withMinSellPriceThreshold,
  withMaxBuyPriceThreshold,
  maxBuyPrice,
  type,
  vaultId,
  ilk,
  positionRatio,
}: {
  minSellPrice?: BigNumber
  withMinSellPriceThreshold?: boolean
  maxBuyPrice?: BigNumber
  withMaxBuyPriceThreshold?: boolean
  type:
    | AutomationFeatures.AUTO_SELL
    | AutomationFeatures.AUTO_BUY
    | AutomationFeatures.CONSTANT_MULTIPLE
  vaultId: BigNumber
  positionRatio: BigNumber
  ilk: string
}) {
  const shouldTrackMinSellInput =
    type === AutomationFeatures.CONSTANT_MULTIPLE || type === AutomationFeatures.AUTO_SELL
  const shouldTrackMaxBuyInput =
    type === AutomationFeatures.CONSTANT_MULTIPLE || type === AutomationFeatures.AUTO_BUY

  const analyticsAdditionalParams = {
    vaultId: vaultId.toString(),
    ilk: ilk,
    collateralRatio: positionRatio.times(100).decimalPlaces(2).toString(),
  }

  const resolvedMinSellPrice = resolveMinSellPriceAnalytics({
    withMinSellPriceThreshold,
    minSellPrice,
  })

  const resolvedMaxBuyPrice = resolveMaxBuyPriceAnalytics({ withMaxBuyPriceThreshold, maxBuyPrice })

  shouldTrackMinSellInput &&
    useDebouncedCallback(
      (value) =>
        trackingEvents.automation.inputChange(
          AutomationEventIds.MinSellPrice,
          analyticsPageMap[type],
          CommonAnalyticsSections.Form,
          {
            ...analyticsAdditionalParams,
            minSellPrice: value,
          },
        ),
      resolvedMinSellPrice,
    )

  shouldTrackMaxBuyInput &&
    useDebouncedCallback(
      (value) =>
        trackingEvents.automation.inputChange(
          AutomationEventIds.MaxBuyPrice,
          analyticsPageMap[type],
          CommonAnalyticsSections.Form,
          {
            ...analyticsAdditionalParams,
            maxBuyPrice: value,
          },
        ),
      resolvedMaxBuyPrice,
    )
}

export function openVaultWithStopLossAnalytics({
  id,
  ilk,
  stopLossLevel,
  stopLossCloseType,
  afterCollateralizationRatio,
}: {
  id?: BigNumber
  ilk: string
  stopLossLevel: BigNumber
  stopLossCloseType: CloseVaultTo
  afterCollateralizationRatio: BigNumber
}) {
  trackingEvents.automation.buttonClick(
    AutomationEventIds.AddStopLoss,
    Pages.OpenVault,
    CommonAnalyticsSections.Form,
    {
      vaultId: id!.toString(),
      ilk,
      triggerValue: stopLossLevel.toString(),
      closeTo: stopLossCloseType,
      collateralRatio: afterCollateralizationRatio.times(100).decimalPlaces(2).toString(),
    },
  )
}

export function getAvailableAutomation(protocol: VaultProtocol) {
  return {
    isStopLossAvailable: protocolAutomations[protocol].includes(AutomationFeatures.STOP_LOSS),
    isAutoSellAvailable: protocolAutomations[protocol].includes(AutomationFeatures.AUTO_SELL),
    isAutoBuyAvailable: protocolAutomations[protocol].includes(AutomationFeatures.AUTO_BUY),
    isConstantMultipleAvailable: protocolAutomations[protocol].includes(
      AutomationFeatures.CONSTANT_MULTIPLE,
    ),
    isTakeProfitAvailable: protocolAutomations[protocol].includes(
      AutomationFeatures.AUTO_TAKE_PROFIT,
    ),
  }
}

export function openFlowInitialStopLossLevel({
  liquidationRatio,
}: {
  liquidationRatio: BigNumber
}) {
  const stopLossSliderMin = liquidationRatio.plus(MIX_MAX_COL_RATIO_TRIGGER_OFFSET.div(100))
  return stopLossSliderMin.plus(DEFAULT_THRESHOLD_FROM_LOWEST_POSSIBLE_SL_VALUE).times(100)
}

export function isSupportedAutomationTokenPair(collateralToken: string, debtToken: string) {
  const joined = [collateralToken, debtToken].join('-')

  return aaveTokenPairsAllowedAutomation.map((pair) => pair.join('-')).includes(joined)
}
