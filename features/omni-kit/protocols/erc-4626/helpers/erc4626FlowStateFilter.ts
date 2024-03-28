import type { OmniFlowStateFilterParams } from 'features/omni-kit/types'

export function erc4626FlowStateFilter({
  collateralAddress,
  event,
  productType,
  quoteAddress,
  protocolRaw,
}: OmniFlowStateFilterParams): Promise<boolean> {
  return Promise.resolve(
    protocolRaw !== undefined &&
      protocolRaw.toLowerCase() === event.args.protocol.toLowerCase() &&
      collateralAddress.toLowerCase() === event.args.collateralToken.toLowerCase() &&
      quoteAddress.toLowerCase() === event.args.debtToken.toLowerCase() &&
      event.args.positionType.toLowerCase() === productType.toLowerCase(),
  )
}
