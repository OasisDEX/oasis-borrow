import { extractLendingProtocolFromPositionCreatedEvent } from 'features/aave/services'
import type { OmniFlowStateFilterParams } from 'features/omni-kit/types'
import { LendingProtocol } from 'lendingProtocols'

export function aaveLikeFlowStateFilter({
  event,
  collateralAddress,
  quoteAddress,
}: OmniFlowStateFilterParams): boolean {
  return (
    [LendingProtocol.AaveV3, LendingProtocol.SparkV3, LendingProtocol.AaveV2].includes(
      extractLendingProtocolFromPositionCreatedEvent(event),
    ) &&
    collateralAddress.toLowerCase() === event.args.collateralToken.toLowerCase() &&
    quoteAddress.toLocaleLowerCase() === event.args.debtToken.toLowerCase()
  )
}
