import BigNumber from 'bignumber.js'
import { loadSubgraph } from 'features/subgraphLoader/useSubgraphLoader'
import { zero } from 'helpers/zero'

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
}

export const getAjnaPoolData: GetPoolData = async (poolAddress: string) => {
  const { response } = await loadSubgraph('Ajna', 'getPoolData', {
    poolAddress: poolAddress.toLowerCase(),
  })

  if ('pool' in response && response.pool) {
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
    } = response.pool
    return {
      poolAddress: address,
      quoteToken: quoteTokenAddress,
      collateralToken: collateralAddress,

      lup: new BigNumber(lup).shiftedBy(-18),
      lowestUtilizedPrice: new BigNumber(lup).shiftedBy(-18),
      lowestUtilizedPriceIndex: new BigNumber(lupIndex),

      htp: new BigNumber(htp),
      highestThresholdPrice: new BigNumber(htp).shiftedBy(-18),
      highestThresholdPriceIndex: new BigNumber(htpIndex),

      highestPriceBucket: new BigNumber(hpb).shiftedBy(-18),
      highestPriceBucketIndex: new BigNumber(hpbIndex),

      mostOptimisticMatchingPrice: new BigNumber(momp).shiftedBy(-18),

      poolMinDebtAmount: zero,
      poolCollateralization: zero,
      poolActualUtilization: zero,
      poolTargetUtilization: zero,
      interestRate: new BigNumber(interestRate).shiftedBy(-18),

      debt: new BigNumber(debt).shiftedBy(-18),
      depositSize: new BigNumber(depositSize).shiftedBy(-18),
      apr30dAverage: new BigNumber(apr30dAverage).shiftedBy(-18),
      dailyPercentageRate30dAverage: new BigNumber(dailyPercentageRate30dAverage).shiftedBy(-16),
      monthlyPercentageRate30dAverage: new BigNumber(monthlyPercentageRate30dAverage).shiftedBy(
        -16,
      ),
    }
  }

  throw new Error('No pool data found')
}
