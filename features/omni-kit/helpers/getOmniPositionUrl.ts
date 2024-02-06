import type { NetworkNames } from 'blockchain/networks'
import type { OmniProductType } from 'features/omni-kit/types'
import type { LendingProtocol } from 'lendingProtocols'

interface GetOmniPositionUrlParams {
  collateralAddress?: string
  collateralToken: string
  isPoolOracless?: boolean
  networkName: NetworkNames
  positionId?: string
  productType: OmniProductType
  protocol: LendingProtocol
  quoteAddress?: string
  quoteToken: string
}

export function getOmniPositionUrl({
  collateralAddress,
  collateralToken,
  isPoolOracless,
  networkName,
  positionId,
  productType,
  protocol,
  quoteAddress,
  quoteToken,
}: GetOmniPositionUrlParams) {
  const productUrl = isPoolOracless
    ? `/${networkName}/${protocol}/${productType}/${collateralAddress}-${quoteAddress}`
    : `/${networkName}/${protocol}/${productType}/${collateralToken}-${quoteToken}`

  return `${productUrl}${positionId ? `/${positionId}` : ''}`
}
