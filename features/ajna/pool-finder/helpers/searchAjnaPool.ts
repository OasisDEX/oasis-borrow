import BigNumber from 'bignumber.js'
import type { NetworkIds } from 'blockchain/networks'
import { NEGATIVE_WAD_PRECISION } from 'components/constants'
import type { AjnaPoolDataResponse } from 'features/omni-kit/protocols/ajna/helpers'
import type { SubgraphsResponses } from 'features/subgraphLoader/types'
import { loadSubgraph } from 'features/subgraphLoader/useSubgraphLoader'

export type SearchAjnaPoolResponse = Pick<
  AjnaPoolDataResponse,
  | 'address'
  | 'buckets'
  | 'collateralAddress'
  | 'debt'
  | 'interestRate'
  | 'lendApr'
  | 'lup'
  | 'lupIndex'
  | 'quoteTokenAddress'
>

export interface SearchAjnaPoolData
  extends Omit<SearchAjnaPoolResponse, 'debt' | 'interestRate' | 'lendApr' | 'lup' | 'lupIndex'> {
  debt: BigNumber
  interestRate: BigNumber
  lendApr: BigNumber
  lowestUtilizedPrice: BigNumber
  lowestUtilizedPriceIndex: number
}
export interface SearchAjnaPoolParams {
  collateralAddress?: string[]
  poolAddress?: string[]
  quoteAddress?: string[]
}

export const searchAjnaPool = async (
  networkId: NetworkIds,
  { collateralAddress = [], poolAddress = [], quoteAddress = [] }: SearchAjnaPoolParams,
): Promise<SearchAjnaPoolData[]> => {
  const caseSensitiveCollateralAddress = collateralAddress.map((address) => address.toLowerCase())
  const caseSensitivePoolAddress = poolAddress.map((address) => address.toLowerCase())
  const caseSensitiveQuoteAddress = quoteAddress.map((address) => address.toLowerCase())
  const { response } = (await loadSubgraph('Ajna', 'searchAjnaPool', networkId, {
    collateralAddress: caseSensitiveCollateralAddress,
    poolAddress: caseSensitivePoolAddress,
    quoteAddress: caseSensitiveQuoteAddress,
  })) as SubgraphsResponses['Ajna']['searchAjnaPool']

  let pools = response?.pools || []

  if (poolAddress.length)
    pools = pools.filter((pool) => caseSensitivePoolAddress.includes(pool.address.toLowerCase()))
  if (collateralAddress.length)
    pools = pools.filter((pool) =>
      caseSensitiveCollateralAddress.includes(pool.collateralAddress.toLowerCase()),
    )
  if (quoteAddress.length)
    pools = pools.filter((pool) =>
      caseSensitiveQuoteAddress.includes(pool.quoteTokenAddress.toLowerCase()),
    )

  return pools.map(({ debt, interestRate, lendApr, lup, lupIndex, ...pool }) => ({
    ...pool,
    debt: new BigNumber(debt).shiftedBy(NEGATIVE_WAD_PRECISION),
    interestRate: new BigNumber(interestRate).shiftedBy(NEGATIVE_WAD_PRECISION),
    lendApr: new BigNumber(lendApr).shiftedBy(NEGATIVE_WAD_PRECISION),
    lowestUtilizedPrice: new BigNumber(lup).shiftedBy(NEGATIVE_WAD_PRECISION),
    lowestUtilizedPriceIndex: parseInt(lupIndex, 10),
  }))
}
