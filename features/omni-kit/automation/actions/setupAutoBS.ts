import BigNumber from 'bignumber.js'
import { AutomationFeatures } from 'features/automation/common/types'
import { defaultAutomationActionPromise } from 'features/omni-kit/automation/actions/common'
import type { OmniAutoBSAutomationTypes } from 'features/omni-kit/automation/components/auto-buy-sell/types'
import type { OmniAutomationCommonActionPayload } from 'features/omni-kit/automation/types'
import type { AutomationMetadataValues } from 'features/omni-kit/contexts'
import type { OmniAutomationAutoBSFormState } from 'features/omni-kit/state/automation/auto-bs'
import { setupAaveAutoBuy, setupAaveAutoSell } from 'helpers/triggers'

export const setupAutoBS = ({
  automation,
  commonPayload,
  automationState,
  uiDropdown,
}: {
  automation?: AutomationMetadataValues
  commonPayload: OmniAutomationCommonActionPayload
  automationState: OmniAutomationAutoBSFormState
  uiDropdown: OmniAutoBSAutomationTypes
}) => {
  const existingAutoSellTrigger = automation?.triggers[uiDropdown]?.decodedParams

  const stateExecutionLtv = automationState.triggerLtv
  const currentExecutionLtv = existingAutoSellTrigger?.executionLtv
    ? new BigNumber(existingAutoSellTrigger?.executionLtv)
    : undefined
  const executionLTV = stateExecutionLtv || currentExecutionLtv

  const stateTargetLtv = automationState.targetLtv
  const currentTargetLtv = existingAutoSellTrigger?.executionLtv
    ? new BigNumber(existingAutoSellTrigger?.executionLtv)
    : undefined
  const targetLTV = stateTargetLtv || currentTargetLtv

  const stateMaxBaseFee = automationState.maxGasFee
  const currentMaxBaseFee = existingAutoSellTrigger?.maxBaseFeeInGwei
    ? new BigNumber(existingAutoSellTrigger?.executionLtv)
    : undefined
  const maxBaseFee = stateMaxBaseFee || currentMaxBaseFee

  if (!targetLTV || !executionLTV || !maxBaseFee || !automationState.action) {
    console.warn('One of required action parameters missing')
    return defaultAutomationActionPromise
  }

  const setupFnMap = {
    [AutomationFeatures.AUTO_SELL]: setupAaveAutoSell,
    [AutomationFeatures.AUTO_BUY]: setupAaveAutoBuy,
  }[uiDropdown]

  return setupFnMap({
    ...commonPayload,
    price: automationState.price,
    executionLTV,
    targetLTV,
    maxBaseFee,
    usePrice: !!automationState.useThreshold,
    action: automationState.action,
  })
}
