import BigNumber from 'bignumber.js'
import { NEGATIVE_WAD_PRECISION } from 'components/constants'
import { AjnaPoolDataResponse } from 'features/ajna/positions/common/helpers/getAjnaPoolData'
import { SubgraphsResponses } from 'features/subgraphLoader/types'
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

interface SearchAjnaPoolParams {
  collateralAddress?: string
  poolAddress?: string
  quoteAddress?: string
}

export const searchAjnaPool = async ({
  collateralAddress,
  poolAddress,
  quoteAddress,
}: SearchAjnaPoolParams) => {
  const { response } = (await loadSubgraph('Ajna', 'searchAjnaPool', {
    collateralAddress: collateralAddress?.toLowerCase() || '',
    poolAddress: poolAddress?.toLowerCase() || '',
    quoteAddress: quoteAddress?.toLowerCase() || '',
  })) as SubgraphsResponses['Ajna']['searchAjnaPool']

  let pools = response?.pools || []

  if (poolAddress)
    pools = pools.filter((pool) => pool.address.toLowerCase() === poolAddress.toLowerCase())
  if (collateralAddress)
    pools = pools.filter(
      (pool) => pool.collateralAddress.toLowerCase() === collateralAddress.toLowerCase(),
    )
  if (quoteAddress)
    pools = pools.filter(
      (pool) => pool.quoteTokenAddress.toLowerCase() === quoteAddress.toLowerCase(),
    )

  return {
    pools: pools.map(({ debt, interestRate, lendApr, lup, lupIndex, ...pool }) => ({
      ...pool,
      debt: new BigNumber(debt).shiftedBy(NEGATIVE_WAD_PRECISION),
      interestRate: new BigNumber(interestRate).shiftedBy(NEGATIVE_WAD_PRECISION),
      lendApr: new BigNumber(lendApr).shiftedBy(NEGATIVE_WAD_PRECISION),
      lowestUtilizedPrice: new BigNumber(lup).shiftedBy(NEGATIVE_WAD_PRECISION),
      lowestUtilizedPriceIndex: parseInt(lupIndex, 10),
    })),
    size: response?.pools?.length || 0,
  }
}
