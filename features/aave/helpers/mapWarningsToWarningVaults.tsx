import type { VaultWarningMessage } from 'features/form/warningMessagesHandler'
import type { TriggersApiWarning } from 'helpers/triggers/setup-triggers'
import { TriggersApiWarningCode } from 'helpers/triggers/setup-triggers'

export function mapWarningsToWarningVaults(
  warnings: TriggersApiWarning[] | undefined,
): VaultWarningMessage[] {
  if (!warnings) return []
  return warnings
    .map((warning): VaultWarningMessage | undefined => {
      switch (warning.code) {
        case TriggersApiWarningCode.NoMinSellPriceWhenStopLoss:
          return 'noMinSellPriceWhenStopLossEnabled'
        case TriggersApiWarningCode.AutoBuyWithNoMaxPriceThreshold:
          return 'settingAutoBuyTriggerWithNoThreshold'
        case TriggersApiWarningCode.AutoSellTriggerCloseToStopLossTrigger:
          return 'autoSellTriggerCloseToStopLossTrigger'
        case TriggersApiWarningCode.AutoSellTargetCloseToAutoBuyTrigger:
          return 'autoSellTargetCloseToAutoBuyTrigger'
        case TriggersApiWarningCode.AutoBuyTargetCloseToStopLossTrigger:
          return 'autoBuyTargetCloseToStopLossTrigger'
        case TriggersApiWarningCode.AutoBuyTriggeredImmediately:
          return 'autoBuyTriggeredImmediately'
        case TriggersApiWarningCode.AutoSellTriggeredImmediately:
          return 'autoSellTriggeredImmediately'
        case TriggersApiWarningCode.AutoBuyTargetCloseToAutoSellTrigger:
          return 'autoBuyTargetCloseToAutoSellTrigger'
        case TriggersApiWarningCode.AutoBuyTriggerCloseToStopLossTrigger:
          return 'autoBuyTargetCloseToStopLossTrigger'
        case TriggersApiWarningCode.AutoSellWithNoMinPriceThreshold:
          return 'settingAutoSellTriggerWithNoThreshold'
        case TriggersApiWarningCode.StopLossTriggeredImmediately:
          return 'stopLossTriggeredImmediately'
        default:
          return undefined
      }
    })
    .filter((warning): warning is VaultWarningMessage => !!warning)
}
