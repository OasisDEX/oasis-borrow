import BigNumber from 'bignumber.js'
import { WAD_PRECISION } from 'components/constants'
import { loadSubgraph } from 'features/subgraphLoader/useSubgraphLoader'

import { Bucket } from '@oasisdex/oasis-actions-poc/src/types/ajna/AjnaPool'
import { GetPoolData } from '@oasisdex/oasis-actions-poc/src/views/ajna'

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
  pendingInflator: string
  buckets: Bucket[]
}

export const getAjnaPoolData: GetPoolData = async (poolAddress: string) => {
  const { response } = await loadSubgraph('Ajna', 'getPoolData', {
    poolAddress: poolAddress.toLowerCase(),
  })

  const negativeWadPrecision = WAD_PRECISION * -1

  if (response && 'pool' in response) {
    const {
      address,
      collateralAddress,
      quoteTokenAddress,
      lup,
      lupIndex,
      htp,
      htpIndex,
      hpb,
      hpbIndex,
      momp,
      interestRate,
      debt,
      depositSize,
      apr30dAverage,
      dailyPercentageRate30dAverage,
      monthlyPercentageRate30dAverage,
      poolMinDebtAmount,
      poolCollateralization,
      poolActualUtilization,
      poolTargetUtilization,
      currentBurnEpoch,
      pendingInflator,
      buckets,
    } = response.pool

    return {
      poolAddress: address,
      quoteToken: quoteTokenAddress,
      collateralToken: collateralAddress,

      lup: new BigNumber(lup).shiftedBy(negativeWadPrecision),
      lowestUtilizedPrice: new BigNumber(lup).shiftedBy(negativeWadPrecision),
      lowestUtilizedPriceIndex: new BigNumber(lupIndex),

      htp: new BigNumber(htp).shiftedBy(negativeWadPrecision),
      highestThresholdPrice: new BigNumber(htp).shiftedBy(negativeWadPrecision),
      highestThresholdPriceIndex: new BigNumber(htpIndex),

      highestPriceBucket: new BigNumber(hpb).shiftedBy(negativeWadPrecision),
      highestPriceBucketIndex: new BigNumber(hpbIndex),

      mostOptimisticMatchingPrice: new BigNumber(momp).shiftedBy(negativeWadPrecision),

      poolMinDebtAmount: new BigNumber(poolMinDebtAmount).shiftedBy(negativeWadPrecision),
      poolCollateralization: new BigNumber(poolCollateralization).shiftedBy(negativeWadPrecision),
      poolActualUtilization: new BigNumber(poolActualUtilization).shiftedBy(negativeWadPrecision),
      poolTargetUtilization: new BigNumber(poolTargetUtilization).shiftedBy(negativeWadPrecision),
      interestRate: new BigNumber(interestRate).shiftedBy(negativeWadPrecision),

      debt: new BigNumber(debt).shiftedBy(negativeWadPrecision),
      depositSize: new BigNumber(depositSize).shiftedBy(negativeWadPrecision),
      apr30dAverage: new BigNumber(apr30dAverage).shiftedBy(negativeWadPrecision),
      dailyPercentageRate30dAverage: new BigNumber(dailyPercentageRate30dAverage)
        .shiftedBy(negativeWadPrecision)
        .shiftedBy(2),
      monthlyPercentageRate30dAverage: new BigNumber(monthlyPercentageRate30dAverage)
        .shiftedBy(negativeWadPrecision)
        .shiftedBy(2),
      currentBurnEpoch: new BigNumber(currentBurnEpoch),
      pendingInflator: new BigNumber(pendingInflator).shiftedBy(negativeWadPrecision),
      buckets: buckets.map((bucket) => ({
        index: new BigNumber(bucket.index),
        price: new BigNumber(bucket.price).shiftedBy(negativeWadPrecision),
        quoteTokens: new BigNumber(bucket.quoteTokens).shiftedBy(negativeWadPrecision),
        collateral: new BigNumber(bucket.collateral).shiftedBy(negativeWadPrecision),
        bucketLPs: new BigNumber(bucket.bucketLPs),
      })),
    }
  }

  throw new Error('No pool data found')
}
