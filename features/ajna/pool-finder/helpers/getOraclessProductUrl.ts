import type { NetworkIds } from 'blockchain/networks'
import { isPoolOracless } from 'features/omni-kit/protocols/ajna/helpers'
import type { OmniProductType } from 'features/omni-kit/types'

interface GetOraclessUrlParams {
  collateralAddress: string
  collateralToken: string
  networkId: NetworkIds
  productType: OmniProductType
  quoteAddress: string
  quoteToken: string
}

export function getOraclessProductUrl({
  collateralAddress,
  collateralToken,
  networkId,
  productType,
  quoteAddress,
  quoteToken,
}: GetOraclessUrlParams) {
  return !isPoolOracless({ networkId, collateralToken, quoteToken })
    ? `/ethereum/ajna/${productType}/${collateralToken}-${quoteToken}`
    : `/ethereum/ajna/${productType}/${collateralAddress}-${quoteAddress}`
}
