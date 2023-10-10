import { trackingEvents } from 'analytics/trackingEvents'
import {
  MixpanelAutomationEventIds,
  MixpanelCommonAnalyticsSections,
  MixpanelPages,
} from 'analytics/types'
import type BigNumber from 'bignumber.js'
import type { CloseVaultTo } from 'features/multiply/manage/pipes/CloseVaultTo.types'

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
    MixpanelAutomationEventIds.AddStopLoss,
    MixpanelPages.OpenVault,
    MixpanelCommonAnalyticsSections.Form,
    {
      vaultId: id!.toString(),
      ilk,
      triggerValue: stopLossLevel.toString(),
      closeTo: stopLossCloseType,
      collateralRatio: afterCollateralizationRatio.times(100).decimalPlaces(2).toString(),
    },
  )
}
