import type { NetworkIds } from 'blockchain/networks'
import { isPoolOracless } from 'features/omni-kit/protocols/ajna/helpers'
import type { OmniProductType } from 'features/omni-kit/types'

interface GetOraclessUrlParams {
  chainId: NetworkIds
  collateralAddress: string
  collateralToken: string
  productType: OmniProductType
  quoteAddress: string
  quoteToken: string
}

export function getOraclessProductUrl({
  chainId,
  collateralAddress,
  collateralToken,
  productType,
  quoteAddress,
  quoteToken,
}: GetOraclessUrlParams) {
  return !isPoolOracless({ chainId, collateralToken, quoteToken })
    ? `/ethereum/ajna/${productType}/${collateralToken}-${quoteToken}`
    : `/ethereum/ajna/${productType}/${collateralAddress}-${quoteAddress}`
}
