import { Bucket, GetPoolData } from '@oasisdex/dma-library'
import BigNumber from 'bignumber.js'
import { NEGATIVE_WAD_PRECISION } from 'components/constants'
import { ajnaLastIndexBucketPrice } from 'features/ajna/common/consts'
import { loadSubgraph } from 'features/subgraphLoader/useSubgraphLoader'
import { zero } from 'helpers/zero'

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

    const htpBigNumber = new BigNumber(htp)
    // we are mapping 7388 htp index to actual bucket price since contracts returns zero when pool does not contain any borrowers
    const resolvedHighestThresholdPrice = htpBigNumber.eq(zero)
      ? ajnaLastIndexBucketPrice
      : htpBigNumber

    return {
      poolAddress: address,
      quoteToken: quoteTokenAddress,
      collateralToken: collateralAddress,

      lup: new BigNumber(lup).shiftedBy(NEGATIVE_WAD_PRECISION),
      lowestUtilizedPrice: new BigNumber(lup).shiftedBy(NEGATIVE_WAD_PRECISION),
      lowestUtilizedPriceIndex: new BigNumber(lupIndex),

      htp: new BigNumber(resolvedHighestThresholdPrice).shiftedBy(NEGATIVE_WAD_PRECISION),
      highestThresholdPrice: resolvedHighestThresholdPrice.shiftedBy(NEGATIVE_WAD_PRECISION),
      highestThresholdPriceIndex: new BigNumber(htpIndex),

      highestPriceBucket: new BigNumber(hpb).shiftedBy(NEGATIVE_WAD_PRECISION),
      highestPriceBucketIndex: new BigNumber(hpbIndex),

      mostOptimisticMatchingPrice: new BigNumber(momp).shiftedBy(NEGATIVE_WAD_PRECISION),

      poolMinDebtAmount: new BigNumber(poolMinDebtAmount).shiftedBy(NEGATIVE_WAD_PRECISION),
      poolCollateralization: new BigNumber(poolCollateralization).shiftedBy(NEGATIVE_WAD_PRECISION),
      poolActualUtilization: new BigNumber(poolActualUtilization).shiftedBy(NEGATIVE_WAD_PRECISION),
      poolTargetUtilization: new BigNumber(poolTargetUtilization).shiftedBy(NEGATIVE_WAD_PRECISION),
      interestRate: new BigNumber(interestRate).shiftedBy(NEGATIVE_WAD_PRECISION),

      debt: new BigNumber(debt).shiftedBy(NEGATIVE_WAD_PRECISION),
      depositSize: new BigNumber(depositSize).shiftedBy(NEGATIVE_WAD_PRECISION),
      apr30dAverage: new BigNumber(apr30dAverage).shiftedBy(NEGATIVE_WAD_PRECISION),
      dailyPercentageRate30dAverage: new BigNumber(dailyPercentageRate30dAverage)
        .shiftedBy(NEGATIVE_WAD_PRECISION)
        .shiftedBy(2),
      monthlyPercentageRate30dAverage: new BigNumber(monthlyPercentageRate30dAverage)
        .shiftedBy(NEGATIVE_WAD_PRECISION)
        .shiftedBy(2),
      currentBurnEpoch: new BigNumber(currentBurnEpoch),
      pendingInflator: new BigNumber(pendingInflator).shiftedBy(NEGATIVE_WAD_PRECISION),
      buckets: buckets.map((bucket) => ({
        index: new BigNumber(bucket.index),
        price: new BigNumber(bucket.price).shiftedBy(NEGATIVE_WAD_PRECISION),
        quoteTokens: new BigNumber(bucket.quoteTokens).shiftedBy(NEGATIVE_WAD_PRECISION),
        collateral: new BigNumber(bucket.collateral).shiftedBy(NEGATIVE_WAD_PRECISION),
        bucketLPs: new BigNumber(bucket.bucketLPs),
      })),
    }
  }

  throw new Error(
    `No pool data found for poolAddress: ${poolAddress}, Response: ${JSON.stringify(response)}`,
  )
}
