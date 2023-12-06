import type { Bucket } from '@oasisdex/dma-library'
import BigNumber from 'bignumber.js'
import type { NetworkIds } from 'blockchain/networks'
import { NEGATIVE_WAD_PRECISION } from 'components/constants'
import { isAddress } from 'ethers/lib/utils'
import type { SubgraphsResponses } from 'features/subgraphLoader/types'
import { loadSubgraph } from 'features/subgraphLoader/useSubgraphLoader'

export interface SearchAjnaPoolResponse {
  address: string
  buckets: Bucket[]
  collateralAddress: string
  collateralToken: {
    symbol: string
  }
  debt: string
  interestRate: string
  lendApr: string
  lup: string
  lupIndex: string
  quoteTokenAddress: string
  quoteToken: {
    symbol: string
  }
}

export interface SearchAjnaPoolData
  extends Omit<SearchAjnaPoolResponse, 'debt' | 'interestRate' | 'lendApr' | 'lup' | 'lupIndex'> {
  debt: BigNumber
  interestRate: BigNumber
  lendApr: BigNumber
  lowestUtilizedPrice: BigNumber
  lowestUtilizedPriceIndex: number
}
export interface SearchAjnaPoolParams {
  collateralToken?: string
  poolAddress?: string
  quoteToken?: string
}

export interface SearchAjnaPoolFilters {
  and: (
    | { address: string }
    | { collateralAddress: string }
    | { quoteTokenAddress: string }
    | { collateralToken_: { symbol_contains_nocase: string } }
    | { quoteToken_: { symbol_contains_nocase: string } }
  )[]
}

export const searchAjnaPool = async (
  networkId: NetworkIds,
  { collateralToken, poolAddress, quoteToken }: SearchAjnaPoolParams,
): Promise<SearchAjnaPoolData[]> => {
  const where: SearchAjnaPoolFilters = {
    and: [],
  }

  if (poolAddress) where.and.push({ address: poolAddress })
  if (collateralToken) {
    if (isAddress(collateralToken)) where.and.push({ collateralAddress: collateralToken })
    else where.and.push({ collateralToken_: { symbol_contains_nocase: collateralToken } })
  }
  if (quoteToken) {
    if (isAddress(quoteToken)) where.and.push({ quoteTokenAddress: quoteToken })
    else where.and.push({ quoteToken_: { symbol_contains_nocase: quoteToken } })
  }

  const { response } = (await loadSubgraph('Ajna', 'searchAjnaPool', networkId, {
    where,
  })) as SubgraphsResponses['Ajna']['searchAjnaPool']

  const pools = response?.pools || []

  return pools.map(({ debt, interestRate, lendApr, lup, lupIndex, ...pool }) => ({
    ...pool,
    debt: new BigNumber(debt).shiftedBy(NEGATIVE_WAD_PRECISION),
    interestRate: new BigNumber(interestRate).shiftedBy(NEGATIVE_WAD_PRECISION),
    lendApr: new BigNumber(lendApr).shiftedBy(NEGATIVE_WAD_PRECISION),
    lowestUtilizedPrice: new BigNumber(lup).shiftedBy(NEGATIVE_WAD_PRECISION),
    lowestUtilizedPriceIndex: parseInt(lupIndex, 10),
  }))
}
