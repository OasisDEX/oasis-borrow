import { extractLendingProtocolFromPositionCreatedEvent } from 'features/aave/services'
import { omniBorrowishProducts } from 'features/omni-kit/constants'
import type { OmniFlowStateFilterParams, OmniProductType } from 'features/omni-kit/types'

export function morphoFlowStateFilter({
  collateralAddress,
  event,
  productType,
  quoteAddress,
  protocol,
}: OmniFlowStateFilterParams): boolean {
  return (
    extractLendingProtocolFromPositionCreatedEvent(event) === protocol &&
    collateralAddress.toLowerCase() === event.args.collateralToken.toLowerCase() &&
    quoteAddress.toLocaleLowerCase() === event.args.debtToken.toLowerCase() &&
    omniBorrowishProducts.includes(productType.toLocaleLowerCase() as OmniProductType) &&
    omniBorrowishProducts.includes(event.args.positionType.toLocaleLowerCase() as OmniProductType)
  )
}
