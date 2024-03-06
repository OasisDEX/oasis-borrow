import { extractLendingProtocolFromPositionCreatedEvent } from 'features/aave/services'
import type { OmniFlowStateFilterParams } from 'features/omni-kit/types'

export function aaveLikeFlowStateFilter({
  event,
  collateralAddress,
  quoteAddress,
  protocol,
}: OmniFlowStateFilterParams): boolean {
  return (
    extractLendingProtocolFromPositionCreatedEvent(event) === protocol &&
    collateralAddress.toLowerCase() === event.args.collateralToken.toLowerCase() &&
    quoteAddress.toLocaleLowerCase() === event.args.debtToken.toLowerCase()
  )
}
