import { extractLendingProtocolFromPositionCreatedEvent } from 'features/aave/services'
import { AJNA_BORROWISH_PRODUCTS } from 'features/ajna/common/consts'
import { AjnaProduct } from 'features/ajna/common/types'
import { LendingProtocol } from 'lendingProtocols'
import { CreatePositionEvent } from 'types/ethers-contracts/AjnaProxyActions'

interface GetFlowStateFilterParams {
  collateralAddress: string
  events: CreatePositionEvent[]
  product: AjnaProduct
  quoteAddress: string
}

export function getFlowStateFilter({
  collateralAddress,
  events,
  product,
  quoteAddress,
}: GetFlowStateFilterParams): boolean {
  return events.every(
    (event) =>
      !(
        extractLendingProtocolFromPositionCreatedEvent(event) === LendingProtocol.Ajna &&
        collateralAddress.toLowerCase() === event.args.collateralToken.toLowerCase() &&
        quoteAddress.toLocaleLowerCase() === event.args.debtToken.toLowerCase() &&
        (product.toLowerCase() === event.args.positionType.toLowerCase() ||
          (AJNA_BORROWISH_PRODUCTS.includes(product) &&
            AJNA_BORROWISH_PRODUCTS.includes(event.args.positionType.toLowerCase() as AjnaProduct)))
      ),
  )
}
