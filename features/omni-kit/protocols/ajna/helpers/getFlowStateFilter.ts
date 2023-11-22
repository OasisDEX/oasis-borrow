import { extractLendingProtocolFromPositionCreatedEvent } from 'features/aave/services'
import { omniBorrowishProducts } from 'features/omni-kit/constants'
import type { OmniProductType } from 'features/omni-kit/types'
import { LendingProtocol } from 'lendingProtocols'
import type { CreatePositionEvent } from 'types/ethers-contracts/AjnaProxyActions'

interface AjnaFlowStateFilterParams {
  collateralAddress: string
  event: CreatePositionEvent
  productType: OmniProductType
  quoteAddress: string
}
interface GetAjnaFlowStateFilterParams extends Omit<AjnaFlowStateFilterParams, 'event'> {
  events: CreatePositionEvent[]
}

export function ajnaFlowStateFilter({
  collateralAddress,
  event,
  productType,
  quoteAddress,
}: AjnaFlowStateFilterParams): boolean {
  return (
    extractLendingProtocolFromPositionCreatedEvent(event) === LendingProtocol.Ajna &&
    collateralAddress.toLowerCase() === event.args.collateralToken.toLowerCase() &&
    quoteAddress.toLocaleLowerCase() === event.args.debtToken.toLowerCase() &&
    (productType.toLowerCase() === event.args.positionType.toLowerCase() ||
      (omniBorrowishProducts.includes(productType) &&
        omniBorrowishProducts.includes(event.args.positionType.toLowerCase() as OmniProductType)))
  )
}

export function getAjnaFlowStateFilter({ events, ...rest }: GetAjnaFlowStateFilterParams): boolean {
  return events.every((event) => !ajnaFlowStateFilter({ event, ...rest }))
}
