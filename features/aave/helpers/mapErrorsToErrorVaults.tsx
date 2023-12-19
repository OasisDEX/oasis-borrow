import type { VaultErrorMessage } from 'features/form/errorMessagesHandler'
import type { TriggersApiError } from 'helpers/triggers/setup-triggers'
import { TriggersApiErrorCode } from 'helpers/triggers/setup-triggers'

export function mapErrorsToErrorVaults(errors: TriggersApiError[]): VaultErrorMessage[] {
  return errors.map((error) => {
    switch (error.code) {
      case TriggersApiErrorCode.MaxBuyPriceIsNotSet:
        return 'autoBuyMaxBuyPriceNotSpecified'
      case TriggersApiErrorCode.MinSellPriceIsNotSet:
        return 'minSellPriceWillPreventSellTrigger'
      case TriggersApiErrorCode.ExecutionPriceBiggerThanMaxBuyPrice:
        return 'maxBuyPriceWillPreventBuyTrigger'
      case TriggersApiErrorCode.ExecutionPriceSmallerThanMinSellPrice:
        return 'minSellPriceWillPreventSellTrigger'
      default:
        return 'generateAmountLessThanDebtFloor'
    }
  })
}
