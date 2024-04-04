import { omniBorrowishProducts } from 'features/omni-kit/constants'
import type { OmniFlowStateFilterParams, OmniProductType } from 'features/omni-kit/types'

export function ajnaFlowStateFilter({
  collateralAddress,
  event,
  filterConsumed,
  productType,
  protocol,
  protocolRaw,
  quoteAddress,
}: OmniFlowStateFilterParams): Promise<boolean> {
  const ajnaFilterValue =
    event.protocol === protocol &&
    event.protocolRaw === protocolRaw &&
    collateralAddress.toLowerCase() === event.collateralTokenAddress.toLowerCase() &&
    quoteAddress.toLocaleLowerCase() === event.debtTokenAddress.toLowerCase() &&
    ((productType.toLowerCase() === 'earn' &&
      productType.toLowerCase() === event.positionType.toLowerCase()) ||
      (omniBorrowishProducts.includes(productType.toLocaleLowerCase() as OmniProductType) &&
        omniBorrowishProducts.includes(event.positionType.toLocaleLowerCase() as OmniProductType)))

  return Promise.resolve(filterConsumed ? !ajnaFilterValue : ajnaFilterValue)
}
