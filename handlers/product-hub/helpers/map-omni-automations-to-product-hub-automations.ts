import { AutomationFeature } from '@prisma/client'
import { AutomationFeatures } from 'features/automation/common/types'
import type { OmniProtocolSettings, OmniSupportedNetworkIds } from 'features/omni-kit/types'
import { uniq } from 'lodash'

interface MapOmniToProductHubAutomationsParams {
  networkId: OmniSupportedNetworkIds
  omniAutomations: OmniProtocolSettings['availableAutomations']
}

const omniToProductHubMap: { [key in AutomationFeatures]: AutomationFeature } = {
  [AutomationFeatures.AUTO_BUY]: AutomationFeature.autoBuy,
  [AutomationFeatures.AUTO_SELL]: AutomationFeature.autoSell,
  [AutomationFeatures.AUTO_TAKE_PROFIT]: AutomationFeature.takeProfit,
  [AutomationFeatures.CONSTANT_MULTIPLE]: AutomationFeature.constantMultiple,
  [AutomationFeatures.PARTIAL_TAKE_PROFIT]: AutomationFeature.takeProfit,
  [AutomationFeatures.STOP_LOSS]: AutomationFeature.stopLoss,
  [AutomationFeatures.TRAILING_STOP_LOSS]: AutomationFeature.stopLoss,
}

export function mapOmniToProductHubAutomations({
  networkId,
  omniAutomations,
}: MapOmniToProductHubAutomationsParams) {
  return omniAutomations[networkId]
    ? uniq(omniAutomations[networkId]?.map((feature) => omniToProductHubMap[feature]))
    : []
}
