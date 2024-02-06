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
  protocolRaw: string
}

export function ajnaFlowStateFilter({
  collateralAddress,
  event,
  productType,
  quoteAddress,
  protocolRaw,
}: AjnaFlowStateFilterParams): boolean {
  return (
    extractLendingProtocolFromPositionCreatedEvent(event) === LendingProtocol.Ajna &&
    event.args.protocol === protocolRaw &&
    collateralAddress.toLowerCase() === event.args.collateralToken.toLowerCase() &&
    quoteAddress.toLocaleLowerCase() === event.args.debtToken.toLowerCase() &&
    ((productType.toLowerCase() === 'earn' &&
      productType.toLowerCase() === event.args.positionType.toLowerCase()) ||
      (omniBorrowishProducts.includes(productType.toLocaleLowerCase() as OmniProductType) &&
        omniBorrowishProducts.includes(
          event.args.positionType.toLocaleLowerCase() as OmniProductType,
        )))
  )
}
