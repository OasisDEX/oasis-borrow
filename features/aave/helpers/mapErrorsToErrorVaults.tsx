import type { VaultErrorMessage } from 'features/form/errorMessagesHandler'
import type { TriggersApiError } from 'helpers/lambda/triggers/setup-triggers'
import { TriggersApiErrorCode } from 'helpers/lambda/triggers/setup-triggers'

export function mapErrorsToErrorVaults(
  errors: TriggersApiError[] | undefined,
): VaultErrorMessage[] {
  if (!errors) return []
  return errors
    .map((error): VaultErrorMessage | undefined => {
      switch (error.code) {
        case TriggersApiErrorCode.ExecutionLTVSmallerThanTargetLTV:
          return 'executionLTVSmallerThanTargetLTV'
        case TriggersApiErrorCode.ExecutionLTVBiggerThanTargetLTV:
          return 'executionLTVBiggerThanTargetLTV'
        case TriggersApiErrorCode.ExecutionLTVBiggerThanCurrentLTV:
          return 'executionLTVBiggerThanCurrentLTV'
        case TriggersApiErrorCode.ExecutionLTVLowerThanCurrentLTV:
          return 'executionLTVSmallerThanCurrentLTV'
        case TriggersApiErrorCode.ExecutionLTVIsNearToTheAutoSellTrigger:
          return 'executionLTVNearToAutoSellTrigger'
        case TriggersApiErrorCode.AutoSellTriggerHigherThanAutoBuyTarget:
          return 'autoSellTriggerHigherThanAutoBuyTarget'
        case TriggersApiErrorCode.AutoBuyTriggerLowerThanAutoSellTarget:
          return 'autoBuyTriggerLowerThanAutoSellTarget'
        case TriggersApiErrorCode.AutoSellCannotBeDefinedWithCurrentStopLoss:
          return 'autoSellTriggerHigherThanAutoBuyTarget'
        case TriggersApiErrorCode.AutoBuyCannotBeDefinedWithCurrentStopLoss:
          return 'stopLossTriggerHigherThanAutoBuyTarget'
        case TriggersApiErrorCode.InternalError:
          return 'internalError'
        case TriggersApiErrorCode.MaxBuyPriceIsNotSet:
          return 'autoBuyMaxBuyPriceNotSpecified'
        case TriggersApiErrorCode.MinSellPriceIsNotSet:
          return 'minimumSellPriceNotProvided'
        case TriggersApiErrorCode.ExecutionPriceBiggerThanMaxBuyPrice:
          return 'maxBuyPriceWillPreventBuyTrigger'
        case TriggersApiErrorCode.ExecutionPriceSmallerThanMinSellPrice:
          return 'minSellPriceWillPreventSellTrigger'
        case TriggersApiErrorCode.TooLowLtvToSetupAutoBuy:
          return 'tooLowLtvToSetupAutoBuy'
        case TriggersApiErrorCode.TooLowLtvToSetupAutoSell:
          return 'tooLowLtvToSetupAutoSell'
        case TriggersApiErrorCode.AutoSellNotAvailableDueToTooHighStopLoss:
          return 'tooHighStopLossToSetupAutoSell'
        case TriggersApiErrorCode.StopLossTriggerLowerThanAutoBuy:
          return 'stopLossTriggerLtvLowerThanAutoBuy'
        case TriggersApiErrorCode.StopLossNeverTriggeredWithLowerAutoSellMinSellPrice:
        case TriggersApiErrorCode.StopLossNeverTriggeredWithNoAutoSellMinSellPrice:
          return 'autoSellWillBlockStopLoss'
        case TriggersApiErrorCode.StopLossTriggeredByAutoBuy:
          return 'stopLossTriggeredByAutoBuy'
        case TriggersApiErrorCode.AutoSellNeverTriggeredWithCurrentStopLoss:
          return 'autoSellNeverTriggeredWithCurrentStopLoss'
        case TriggersApiErrorCode.PartialTakeProfitTriggerHigherThanAutoSellTarget:
          return 'partialTakeProfitTriggerHigherThanAutoSellTarget'
        case TriggersApiErrorCode.PartialTakeProfitTargetHigherThanAutoSellTrigger:
          return 'partialTakeProfitTargetHigherThanAutoSellTrigger'
        case TriggersApiErrorCode.PartialTakeProfitTargetHigherThanStopLoss:
          return 'partialTakeProfitTargetHigherThanStopLoss'
        case TriggersApiErrorCode.PartialTakeProfitMinPriceLowerThanAutoBuyMaxPrice:
          return 'partialTakeProfitMinPriceLowerThanAutoBuyMaxPrice'
        default:
          return undefined
      }
    })
    .filter((error): error is VaultErrorMessage => !!error)
}
