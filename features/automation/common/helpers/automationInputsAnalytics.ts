import { trackingEvents } from 'analytics/trackingEvents'
import { MixpanelAutomationEventIds, MixpanelCommonAnalyticsSections } from 'analytics/types'
import type BigNumber from 'bignumber.js'
import { analyticsPageMap } from 'features/automation/common/analyticsPageMap'
import { AutomationFeatures } from 'features/automation/common/types'
import { useDebouncedCallback } from 'helpers/useDebouncedCallback'

import { resolveMaxBuyPriceAnalytics } from './resolveMaxBuyPriceAnalytics'
import { resolveMinSellPriceAnalytics } from './resolveMinSellPriceAnalytics'

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
  type: AutomationFeatures.AUTO_SELL | AutomationFeatures.AUTO_BUY
  vaultId: BigNumber
  positionRatio: BigNumber
  ilk: string
}) {
  const shouldTrackMinSellInput = type === AutomationFeatures.AUTO_SELL
  const shouldTrackMaxBuyInput = type === AutomationFeatures.AUTO_BUY

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
          MixpanelAutomationEventIds.MinSellPrice,
          analyticsPageMap[type],
          MixpanelCommonAnalyticsSections.Form,
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
          MixpanelAutomationEventIds.MaxBuyPrice,
          analyticsPageMap[type],
          MixpanelCommonAnalyticsSections.Form,
          {
            ...analyticsAdditionalParams,
            maxBuyPrice: value,
          },
        ),
      resolvedMaxBuyPrice,
    )
}
