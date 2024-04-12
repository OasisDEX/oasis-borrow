import { lambdaPriceDenomination } from 'features/aave/constants'
import { defaultAutomationActionPromise } from 'features/omni-kit/automation/actions/common'
import type { OmniAutomationCommonActionPayload } from 'features/omni-kit/automation/types'
import type { OmniAutomationPartialTakeProfitFormState } from 'features/omni-kit/state/automation/partial-take-profit'
import type { AutomationMetadataValues } from 'features/omni-kit/types'
import { setupAaveLikePartialTakeProfit, TriggerAction } from 'helpers/triggers'
import { one } from 'helpers/zero'

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
  automationState: OmniAutomationPartialTakeProfitFormState
  debtAddress: string
  collateralAddress: string
  isShort: boolean
}) => {
  const existingPartialTakeProfitTrigger =
    automation?.triggers.partialTakeProfit?.decodedMappedParams
  const existingSLTrigger = automation?.triggers.stopLoss?.decodedMappedParams
  const existingTSLTrigger = automation?.triggers.trailingStopLoss?.decodedMappedParams

  const stateTriggerLtv = automationState.triggerLtv
  const currentTriggerLtv = existingPartialTakeProfitTrigger?.executionLtv?.times(100)

  const triggerLtv = stateTriggerLtv || currentTriggerLtv

  const statePrice = automationState.price
  const currentPrice = existingPartialTakeProfitTrigger?.executionPrice

  const startingTakeProfitPrice = statePrice || currentPrice

  const stateWithdrawalLtv = automationState.ltvStep
  const currentWithdrawalLtv = existingPartialTakeProfitTrigger?.ltvStep?.times(100)
  const withdrawalLtv = stateWithdrawalLtv || currentWithdrawalLtv

  if (!triggerLtv || !startingTakeProfitPrice || !withdrawalLtv || !automationState.action) {
    console.warn('One of required action parameters missing')
    return defaultAutomationActionPromise
  }

  const executionToken = automationState.resolveTo === 'quote' ? debtAddress : collateralAddress

  return setupAaveLikePartialTakeProfit({
    ...commonPayload,
    triggerLtv,
    startingTakeProfitPrice: (isShort
      ? one.div(startingTakeProfitPrice)
      : startingTakeProfitPrice
    ).times(lambdaPriceDenomination),
    withdrawalLtv,
    executionToken,
    stopLoss: automationState.extraTriggerLtv
      ? {
          triggerData: {
            executionLTV: automationState.extraTriggerLtv,
            token: executionToken,
          },
          action:
            existingSLTrigger || existingTSLTrigger ? TriggerAction.Update : TriggerAction.Add,
        }
      : undefined,
    action: automationState.action,
  })
}
