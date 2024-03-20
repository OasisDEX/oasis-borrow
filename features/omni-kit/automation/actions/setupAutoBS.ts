import BigNumber from 'bignumber.js'
import { lambdaPriceDenomination } from 'features/aave/constants'
import { AutomationFeatures } from 'features/automation/common/types'
import { defaultAutomationActionPromise } from 'features/omni-kit/automation/actions/common'
import type { OmniAutoBSAutomationTypes } from 'features/omni-kit/automation/components/auto-buy-sell/types'
import { autoBuySellConstants } from 'features/omni-kit/automation/constants'
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
  const existingAutoBSTrigger = automation?.triggers[uiDropdown]?.decodedMappedParams

  const stateExecutionLtv = automationState.triggerLtv
  const currentExecutionLtv = existingAutoBSTrigger?.executionLtv

  const executionLTV = (stateExecutionLtv || currentExecutionLtv)?.times(100)

  const stateTargetLtv = automationState.targetLtv
  const currentTargetLtv = existingAutoBSTrigger?.targetLtv

  const targetLTV = (stateTargetLtv || currentTargetLtv)?.times(100)

  const statePrice = automationState.price
  const currentPrice =
    existingAutoBSTrigger && 'minSellPrice' in existingAutoBSTrigger
      ? existingAutoBSTrigger?.minSellPrice
      : existingAutoBSTrigger?.maxBuyPrice

  const price = (statePrice || currentPrice)?.times(lambdaPriceDenomination)

  const stateMaxBaseFee = automationState.maxGasFee
  const currentMaxBaseFee = existingAutoBSTrigger?.maxBaseFeeInGwei
    ? new BigNumber(existingAutoBSTrigger.maxBaseFeeInGwei)
    : new BigNumber(autoBuySellConstants.defaultGasFee)
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
    price,
    executionLTV,
    targetLTV,
    maxBaseFee,
    usePrice: !!automationState.useThreshold,
    action: automationState.action,
  })
}
