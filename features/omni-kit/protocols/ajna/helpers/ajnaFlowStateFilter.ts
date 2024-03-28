import { extractLendingProtocolFromPositionCreatedEvent } from 'features/aave/services'
import { omniBorrowishProducts } from 'features/omni-kit/constants'
import type { OmniFlowStateFilterParams, OmniProductType } from 'features/omni-kit/types'

export function ajnaFlowStateFilter({
  collateralAddress,
  event,
  productType,
  quoteAddress,
  protocolRaw,
  protocol,
}: OmniFlowStateFilterParams): Promise<boolean> {
  return Promise.resolve(
    extractLendingProtocolFromPositionCreatedEvent(event) === protocol &&
      event.args.protocol === protocolRaw &&
      collateralAddress.toLowerCase() === event.args.collateralToken.toLowerCase() &&
      quoteAddress.toLocaleLowerCase() === event.args.debtToken.toLowerCase() &&
      ((productType.toLowerCase() === 'earn' &&
        productType.toLowerCase() === event.args.positionType.toLowerCase()) ||
        (omniBorrowishProducts.includes(productType.toLocaleLowerCase() as OmniProductType) &&
          omniBorrowishProducts.includes(
            event.args.positionType.toLocaleLowerCase() as OmniProductType,
          ))),
  )
}
