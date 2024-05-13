import { AutomationFeatures } from 'features/automation/common/types'
import { getMappedAutomationMetadataValues } from 'features/omni-kit/automation/helpers'
import type { OmniAutomationFormState } from 'features/omni-kit/state/automation/common/automationFormReducto.types'
import type { GetTriggersResponse } from 'helpers/lambda/triggers'
import type { LendingProtocol } from 'lendingProtocols'

interface GetAutomationFormDefaultsParams {
  poolId?: string
  positionTriggers: GetTriggersResponse
  protocol: LendingProtocol
}

export const getAutomationFormDefaults = ({
  poolId,
  positionTriggers,
  protocol,
}: GetAutomationFormDefaultsParams): OmniAutomationFormState => {
  const {
    flags: {
      isStopLossEnabled,
      isTrailingStopLossEnabled,
      isAutoSellEnabled,
      isAutoBuyEnabled,
      isPartialTakeProfitEnabled,
    },
  } = getMappedAutomationMetadataValues({ poolId, positionTriggers, protocol })

  return {
    uiDropdownProtection: isTrailingStopLossEnabled
      ? AutomationFeatures.TRAILING_STOP_LOSS
      : isStopLossEnabled
        ? AutomationFeatures.STOP_LOSS
        : isAutoSellEnabled
          ? AutomationFeatures.AUTO_SELL
          : undefined,
    uiDropdownOptimization: isPartialTakeProfitEnabled
      ? AutomationFeatures.PARTIAL_TAKE_PROFIT
      : isAutoBuyEnabled
        ? AutomationFeatures.AUTO_BUY
        : undefined,
  }
}
