import type { Bucket } from '@oasisdex/dma-library'

export interface AjnaPoolDataResponse {
  address: string
  collateralAddress: string
  quoteTokenAddress: string
  htp: string
  hpb: string
  lup: string
  htpIndex: string
  hpbIndex: string
  lupIndex: string
  momp: string
  debt: string
  depositSize: string
  interestRate: string
  apr30dAverage: string
  dailyPercentageRate30dAverage: string
  monthlyPercentageRate30dAverage: string
  poolMinDebtAmount: string
  poolCollateralization: string
  poolActualUtilization: string
  poolTargetUtilization: string
  currentBurnEpoch: string
  pendingInflator: {
    pendingInflator: string
  }
  lendApr: string
  borrowApr: string
  buckets: Bucket[]
  loansCount: string
  totalAuctionsInPool: string
  t0debt: string
}
