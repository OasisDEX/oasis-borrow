import { IdentifiedTokens } from 'blockchain/identifyTokens'
import { SearchAjnaPoolData } from 'features/ajna/positions/common/helpers/searchAjnaPool'
import { OraclessPoolResult } from 'features/poolFinder/types'

export function matchRowsByFilters(
  pools: SearchAjnaPoolData[],
  identifiedTokens: IdentifiedTokens,
): OraclessPoolResult[] {
  return pools
    .filter(
      ({ collateralAddress, quoteTokenAddress }) =>
        Object.keys(identifiedTokens).includes(collateralAddress) &&
        Object.keys(identifiedTokens).includes(quoteTokenAddress),
    )
    .map(({ collateralAddress, lowestUtilizedPriceIndex, quoteTokenAddress }) => {
      const isPoolNotEmpty = lowestUtilizedPriceIndex > 0

      return {
        collateralAddress: collateralAddress,
        collateralToken: identifiedTokens[collateralAddress].symbol,
        quoteAddress: quoteTokenAddress,
        quoteToken: identifiedTokens[quoteTokenAddress].symbol,
      }
    })
}
