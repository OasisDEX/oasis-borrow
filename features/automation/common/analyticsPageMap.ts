import { MixpanelPages } from 'analytics/types'
import { AutomationFeatures } from 'features/automation/common/types'

export const analyticsPageMap = {
  [AutomationFeatures.AUTO_SELL]: MixpanelPages.AutoSell,
  [AutomationFeatures.AUTO_BUY]: MixpanelPages.AutoBuy,
}
