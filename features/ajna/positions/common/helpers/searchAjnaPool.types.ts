import type BigNumber from 'bignumber.js'

import type { AjnaPoolDataResponse } from './getAjnaPoolData.types'

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
