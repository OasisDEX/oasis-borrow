import { trackingEvents } from 'analytics/trackingEvents'
import { MixpanelAutomationEventIds, MixpanelCommonAnalyticsSections } from 'analytics/types'
import type BigNumber from 'bignumber.js'
import { analyticsPageMap } from 'features/automation/common/analyticsPageMap'
import { AutomationFeatures } from 'features/automation/common/types'
import { useDebouncedCallback } from 'helpers/useDebouncedCallback'

export function automationMultipleRangeSliderAnalytics({
  leftValue,
  rightValue,
  vaultId,
  positionRatio,
  ilk,
  type,
  targetMultiple,
}: {
  leftValue: BigNumber
  rightValue: BigNumber
  vaultId: BigNumber
  positionRatio: BigNumber
  ilk: string
  type: AutomationFeatures.AUTO_SELL | AutomationFeatures.AUTO_BUY
  targetMultiple?: BigNumber
}) {
  const analyticsAdditionalParams = {
    vaultId: vaultId.toString(),
    ilk: ilk,
    collateralRatio: positionRatio.times(100).decimalPlaces(2).toString(),
    ...(targetMultiple && { targetMultiple: targetMultiple.toString() }),
  }

  const leftValueKeyMap = {
    [AutomationFeatures.AUTO_SELL]: 'triggerSellValue',
    [AutomationFeatures.AUTO_BUY]: 'targetValue',
  }

  const rightValueKeyMap = {
    [AutomationFeatures.AUTO_SELL]: 'targetValue',
    [AutomationFeatures.AUTO_BUY]: 'triggerBuyValue',
  }

  useDebouncedCallback(
    (value) => {
      const parsedValues = JSON.parse(value)
      trackingEvents.automation.inputChange(
        MixpanelAutomationEventIds.MoveSlider,
        analyticsPageMap[type],
        MixpanelCommonAnalyticsSections.Form,
        {
          ...analyticsAdditionalParams,
          [leftValueKeyMap[type]]: parsedValues.leftValue,
          [rightValueKeyMap[type]]: parsedValues.rightValue,
        },
      )
    },
    JSON.stringify({ leftValue: leftValue.toString(), rightValue: rightValue.toString() }),
  )
}
