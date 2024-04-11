import { AutomationFeatures } from 'features/automation/common/types'
import { getAaveLikeAutomationMetadataCommonValues } from 'features/omni-kit/protocols/aave-like/helpers'
import type { OmniAutomationFormState } from 'features/omni-kit/state/automation/common/automationFormReducto.types'
import type { GetTriggersResponse } from 'helpers/lambda/triggers'

export const getAutomationFormDefaults = (
  positionTriggers: GetTriggersResponse,
): OmniAutomationFormState => {
  const {
    flags: {
      isStopLossEnabled,
      isTrailingStopLossEnabled,
      isAutoSellEnabled,
      isAutoBuyEnabled,
      isPartialTakeProfitEnabled,
    },
  } = getAaveLikeAutomationMetadataCommonValues({ positionTriggers })

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
