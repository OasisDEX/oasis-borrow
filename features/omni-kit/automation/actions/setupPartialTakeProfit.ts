import BigNumber from 'bignumber.js'
import { lambdaPriceDenomination } from 'features/aave/constants'
import { defaultAutomationActionPromise } from 'features/omni-kit/automation/actions/common'
import type { OmniAutomationCommonActionPayload } from 'features/omni-kit/automation/types'
import type { AutomationMetadataValues } from 'features/omni-kit/contexts'
import type { OmniAutomationFormState } from 'features/omni-kit/state/automation'
import { setupAaveLikePartialTakeProfit, TriggerAction } from 'helpers/triggers'

export const setupPartialTakeProfit = ({
  automation,
  commonPayload,
  automationState,
  debtAddress,
  collateralAddress,
  isShort,
}: {
  automation?: AutomationMetadataValues
  commonPayload: OmniAutomationCommonActionPayload
  automationState: OmniAutomationFormState
  debtAddress: string
  collateralAddress: string
  isShort: boolean
}) => {
  const existingPartialTakeProfitTrigger = automation?.triggers.partialTakeProfit?.decodedParams
  const existingSLTrigger = automation?.triggers.stopLoss?.decodedParams
  const existingTSLTrigger = automation?.triggers.trailingStopLoss?.decodedParams

  const stateTriggerLtv = automationState.triggerLtv?.times(100)
  const currentTriggerLtv = existingPartialTakeProfitTrigger?.executionLtv
    ? new BigNumber(existingPartialTakeProfitTrigger.executionLtv)
    : undefined
  const triggerLtv = stateTriggerLtv || currentTriggerLtv

  const statePrice = automationState.price?.times(100)
  const currentPrice = existingPartialTakeProfitTrigger?.executionPrice
    ? new BigNumber(existingPartialTakeProfitTrigger.executionPrice)
    : undefined
  const startingTakeProfitPrice = statePrice || currentPrice

  const stateWithdrawalLtv = automationState.ltvStep?.times(100)
  const currentWithdrawalLtv = existingPartialTakeProfitTrigger?.targetLtv
    ? new BigNumber(existingPartialTakeProfitTrigger.targetLtv)
    : undefined
  const withdrawalLtv = stateWithdrawalLtv || currentWithdrawalLtv

  if (!triggerLtv || !startingTakeProfitPrice || !withdrawalLtv) {
    return defaultAutomationActionPromise
  }

  const executionToken =
    automationState.resolveTo === 'quote' ||
    existingPartialTakeProfitTrigger?.withdrawToDebt === 'true'
      ? debtAddress
      : collateralAddress

  return setupAaveLikePartialTakeProfit({
    ...commonPayload,
    triggerLtv,
    startingTakeProfitPrice: isShort
      ? new BigNumber(lambdaPriceDenomination).div(startingTakeProfitPrice)
      : startingTakeProfitPrice.times(lambdaPriceDenomination),
    withdrawalLtv,
    executionToken,
    stopLoss: automationState.extraTriggerLtv
      ? {
          triggerData: {
            executionLTV: automationState.extraTriggerLtv.times(100),
            token: executionToken,
          },
          action:
            existingSLTrigger || existingTSLTrigger ? TriggerAction.Update : TriggerAction.Add,
        }
      : undefined,
    action:
      automationState.action === TriggerAction.Remove
        ? TriggerAction.Remove
        : existingPartialTakeProfitTrigger
        ? TriggerAction.Update
        : TriggerAction.Add,
  })
}
