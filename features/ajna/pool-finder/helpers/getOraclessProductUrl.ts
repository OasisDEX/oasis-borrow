import type { NetworkIds, NetworkNames } from 'blockchain/networks'
import { isPoolOracless } from 'features/omni-kit/protocols/ajna/helpers'
import type { OmniProductType } from 'features/omni-kit/types'

interface GetOraclessUrlParams {
  collateralAddress: string
  collateralToken: string
  networkId: NetworkIds
  networkName: NetworkNames
  productType: OmniProductType
  quoteAddress: string
  quoteToken: string
}

export function getOraclessProductUrl({
  collateralAddress,
  collateralToken,
  networkId,
  networkName,
  productType,
  quoteAddress,
  quoteToken,
}: GetOraclessUrlParams) {
  return !isPoolOracless({ networkId, collateralToken, quoteToken })
    ? `/${networkName}/ajna/${productType}/${collateralToken}-${quoteToken}`
    : `/${networkName}/ajna/${productType}/${collateralAddress}-${quoteAddress}`
}
