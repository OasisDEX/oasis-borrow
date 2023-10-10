import type { Bucket } from '@oasisdex/dma-library'
import type BigNumber from 'bignumber.js'

export interface AjnaPoolsDataResponse {
  address: string
  collateralAddress: string
  quoteTokenAddress: string
  debt: string
  depositSize: string
  interestRate: string
  dailyPercentageRate30dAverage: string
  poolMinDebtAmount: string
  lup: string
  lupIndex: string
  htp: string
  htpIndex: string
  lendApr: string
  borrowApr: string
  buckets: Bucket[]
}

export interface AjnaPoolsTableData {
  address: string
  collateralAddress: string
  quoteTokenAddress: string
  debt: BigNumber
  depositSize: BigNumber
  interestRate: BigNumber
  dailyPercentageRate30dAverage: BigNumber
  poolMinDebtAmount: BigNumber
  lowestUtilizedPrice: BigNumber
  lowestUtilizedPriceIndex: number
  highestThresholdPrice: BigNumber
  highestThresholdPriceIndex: number
  lendApr: BigNumber
  borrowApr: BigNumber
  buckets: Bucket[]
}
