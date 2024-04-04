import type { OmniFlowStateFilterParams } from 'features/omni-kit/types'

export function erc4626FlowStateFilter({
  collateralAddress,
  event,
  filterConsumed,
  productType,
  protocolRaw,
  quoteAddress,
}: OmniFlowStateFilterParams): Promise<boolean> {
  const erc4626FilterValue =
    protocolRaw !== undefined &&
    protocolRaw.toLowerCase() === event.protocolRaw.toLowerCase() &&
    collateralAddress.toLowerCase() === event.collateralTokenAddress.toLowerCase() &&
    quoteAddress.toLowerCase() === event.debtTokenAddress.toLowerCase() &&
    event.positionType.toLowerCase() === productType.toLowerCase()

  return Promise.resolve(filterConsumed ? !erc4626FilterValue : erc4626FilterValue)
}
