import { omniBorrowishProducts } from 'features/omni-kit/constants'
import type { OmniFlowStateFilterParams, OmniProductType } from 'features/omni-kit/types'

export function morphoFlowStateFilter({
  collateralAddress,
  event,
  filterConsumed,
  pairId,
  productType,
  protocol,
  quoteAddress,
}: OmniFlowStateFilterParams): Promise<boolean> {
  const morphoFilterValue =
    event.protocol === protocol &&
    event.pairId === pairId &&
    collateralAddress.toLowerCase() === event.collateralTokenAddress.toLowerCase() &&
    quoteAddress.toLocaleLowerCase() === event.debtTokenAddress.toLowerCase() &&
    omniBorrowishProducts.includes(productType.toLocaleLowerCase() as OmniProductType) &&
    omniBorrowishProducts.includes(event.positionType.toLocaleLowerCase() as OmniProductType)

  return Promise.resolve(filterConsumed ? !morphoFilterValue : morphoFilterValue)
}
