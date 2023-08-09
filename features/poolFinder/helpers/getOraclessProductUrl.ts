import { NetworkIds } from 'blockchain/networks'
import { isPoolOracless } from 'features/ajna/common/helpers/isOracless'
import { AjnaProduct } from 'features/ajna/common/types'
import { OraclessPoolResult } from 'features/poolFinder/types'

interface GetOraclessUrlParams extends OraclessPoolResult {
  product: AjnaProduct
  chainId: NetworkIds
}

export function getOraclessProductUrl({
  chainId,
  collateralAddress,
  collateralToken,
  product,
  quoteAddress,
  quoteToken,
}: GetOraclessUrlParams) {
  return !isPoolOracless({ chainId, collateralToken, quoteToken })
    ? `/ethereum/ajna/${product}/${collateralToken}-${quoteToken}`
    : `/ethereum/ajna/${product}/${collateralAddress}-${quoteAddress}`
}
