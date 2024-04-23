import type { Bucket, GetPoolData } from '@oasisdex/dma-library'
import BigNumber from 'bignumber.js'
import { getNetworkContracts } from 'blockchain/contracts'
import { getRpcProvider, NetworkIds } from 'blockchain/networks'
import { NEGATIVE_WAD_PRECISION } from 'components/constants'
import { ethers } from 'ethers'
import { ajnaLastIndexBucketPrice } from 'features/omni-kit/protocols/ajna/constants'
import type { OmniSupportedNetworkIds } from 'features/omni-kit/types'
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
  debt: string
  depositSize: string
  interestRate: string
  apr30dAverage: string
  apr7dAverage: string
  lendApr30dAverage: string
  lendApr7dAverage: string
  dailyPercentageRate30dAverage: string
  monthlyPercentageRate30dAverage: string
  poolMinDebtAmount: string
  poolCollateralization: string
  poolActualUtilization: string
  poolTargetUtilization: string
  currentBurnEpoch: string
  lendApr: string
  borrowApr: string
  buckets: Bucket[]
  loansCount: string
  totalAuctionsInPool: string
  t0debt: string
}

export const getAjnaPoolData: (networkId: OmniSupportedNetworkIds) => GetPoolData =
  (networkId) => async (poolAddress: string) => {
    switch (networkId) {
      case NetworkIds.MAINNET:
      case NetworkIds.BASEMAINNET:
      case NetworkIds.OPTIMISMMAINNET:
      case NetworkIds.ARBITRUMMAINNET:
      case NetworkIds.GOERLI: {
        const { response } = await loadSubgraph({
          subgraph: 'Ajna',
          method: 'getAjnaPoolData',
          networkId,
          params: {
            poolAddress: poolAddress.toLowerCase(),
          },
        })
        const provider = getRpcProvider(networkId)
        const { ajnaPoolInfo } = getNetworkContracts(networkId)
        const poolInfo = new ethers.Contract(
          ajnaPoolInfo.address,
          ajnaPoolInfo.abi.default,
          provider,
        )

        // We are fetching pending inflator from poolLoansInfo contract because trying to cache it on subgraph level
        // leads to issues with enormous amount of data that needs to be stored
        const poolLoansInfo = await poolInfo.poolLoansInfo(poolAddress)
        const pendingInflator = poolLoansInfo.pendingInflator_.toString()

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
            interestRate,
            debt,
            depositSize,
            apr30dAverage,
            apr7dAverage,
            lendApr30dAverage,
            lendApr7dAverage,
            dailyPercentageRate30dAverage,
            monthlyPercentageRate30dAverage,
            poolMinDebtAmount,
            poolCollateralization,
            poolActualUtilization,
            poolTargetUtilization,
            currentBurnEpoch,
            buckets,
            lendApr,
            borrowApr,
            loansCount,
            totalAuctionsInPool,
            t0debt,
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

            poolMinDebtAmount: new BigNumber(poolMinDebtAmount).shiftedBy(NEGATIVE_WAD_PRECISION),
            poolCollateralization: new BigNumber(poolCollateralization).shiftedBy(
              NEGATIVE_WAD_PRECISION,
            ),
            poolActualUtilization: new BigNumber(poolActualUtilization).shiftedBy(
              NEGATIVE_WAD_PRECISION,
            ),
            poolTargetUtilization: new BigNumber(poolTargetUtilization).shiftedBy(
              NEGATIVE_WAD_PRECISION,
            ),
            interestRate: new BigNumber(interestRate).shiftedBy(NEGATIVE_WAD_PRECISION),

            debt: new BigNumber(debt).shiftedBy(NEGATIVE_WAD_PRECISION),
            depositSize: new BigNumber(depositSize).shiftedBy(NEGATIVE_WAD_PRECISION),
            apr30dAverage: new BigNumber(apr30dAverage).shiftedBy(NEGATIVE_WAD_PRECISION),
            apr7dAverage: new BigNumber(apr7dAverage).shiftedBy(NEGATIVE_WAD_PRECISION),
            lendApr30dAverage: new BigNumber(lendApr30dAverage).shiftedBy(NEGATIVE_WAD_PRECISION),
            lendApr7dAverage: new BigNumber(lendApr7dAverage).shiftedBy(NEGATIVE_WAD_PRECISION),
            dailyPercentageRate30dAverage: new BigNumber(dailyPercentageRate30dAverage).shiftedBy(
              NEGATIVE_WAD_PRECISION,
            ),
            monthlyPercentageRate30dAverage: new BigNumber(
              monthlyPercentageRate30dAverage,
            ).shiftedBy(NEGATIVE_WAD_PRECISION),
            currentBurnEpoch: new BigNumber(currentBurnEpoch),
            pendingInflator: new BigNumber(pendingInflator).shiftedBy(NEGATIVE_WAD_PRECISION),
            lendApr: new BigNumber(lendApr).shiftedBy(NEGATIVE_WAD_PRECISION),
            borrowApr: new BigNumber(borrowApr).shiftedBy(NEGATIVE_WAD_PRECISION),
            buckets: buckets.map((bucket) => ({
              index: new BigNumber(bucket.index),
              price: new BigNumber(bucket.price).shiftedBy(NEGATIVE_WAD_PRECISION),
              quoteTokens: new BigNumber(bucket.quoteTokens).shiftedBy(NEGATIVE_WAD_PRECISION),
              collateral: new BigNumber(bucket.collateral).shiftedBy(NEGATIVE_WAD_PRECISION),
              bucketLPs: new BigNumber(bucket.bucketLPs),
            })),
            loansCount: new BigNumber(loansCount),
            totalAuctionsInPool: new BigNumber(totalAuctionsInPool),
            t0debt: new BigNumber(t0debt).shiftedBy(NEGATIVE_WAD_PRECISION),
          }
        }

        throw new Error(
          `No pool data found for poolAddress: ${poolAddress}, Response: ${JSON.stringify(
            response,
          )}`,
        )
      }
      default:
        throw Error(`Unsupported networkId: ${networkId}`)
    }
  }
