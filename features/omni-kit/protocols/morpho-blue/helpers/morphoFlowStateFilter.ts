import { extractLendingProtocolFromPositionCreatedEvent } from 'features/aave/services'
import { morphoProducts } from 'features/omni-kit/protocols/morpho-blue/constants'
import type { OmniFlowStateFilterParams, OmniProductType } from 'features/omni-kit/types'
import { LendingProtocol } from 'lendingProtocols'

export function morphoFlowStateFilter({
  collateralAddress,
  event,
  productType,
  quoteAddress,
}: OmniFlowStateFilterParams): boolean {
  return (
    extractLendingProtocolFromPositionCreatedEvent(event) === LendingProtocol.MorphoBlue &&
    collateralAddress.toLowerCase() === event.args.collateralToken.toLowerCase() &&
    quoteAddress.toLocaleLowerCase() === event.args.debtToken.toLowerCase() &&
    (productType.toLowerCase() === event.args.positionType.toLowerCase() ||
      (morphoProducts.includes(productType) &&
        morphoProducts.includes(event.args.positionType.toLowerCase() as OmniProductType)))
  )
}
