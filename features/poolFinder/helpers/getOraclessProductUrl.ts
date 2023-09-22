import type { NetworkIds } from 'blockchain/networks'
import { isPoolOracless } from 'features/ajna/common/helpers/isOracless'
import type { AjnaProduct } from 'features/ajna/common/types'

interface GetOraclessUrlParams {
  chainId: NetworkIds
  collateralAddress: string
  collateralToken: string
  product: AjnaProduct
  quoteAddress: string
  quoteToken: string
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
