import type { VaultErrorMessage } from 'features/form/errorMessagesHandler'
import type { TriggersApiError } from 'helpers/triggers/setup-triggers'
import { TriggersApiErrorCode } from 'helpers/triggers/setup-triggers'

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
        case TriggersApiErrorCode.ExecutionLTVSmallerThanCurrentLTV:
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
          return 'minSellPriceWillPreventSellTrigger'
        case TriggersApiErrorCode.ExecutionPriceBiggerThanMaxBuyPrice:
          return 'maxBuyPriceWillPreventBuyTrigger'
        case TriggersApiErrorCode.ExecutionPriceSmallerThanMinSellPrice:
          return 'minSellPriceWillPreventSellTrigger'
        default:
          return undefined
      }
    })
    .filter((error): error is VaultErrorMessage => !!error)
}
