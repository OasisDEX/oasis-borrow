import { Bucket } from '@oasisdex/dma-library'
import BigNumber from 'bignumber.js'
import { NetworkIds } from 'blockchain/networks'
import { NEGATIVE_WAD_PRECISION, WAD_PRECISION } from 'components/constants'
import { SubgraphsResponses } from 'features/subgraphLoader/types'
import { loadSubgraph } from 'features/subgraphLoader/useSubgraphLoader'

export interface AjnaPoolsDataResponse {
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

export const getAjnaPoolsData = async (networkId: NetworkIds): Promise<AjnaPoolsTableData[]> => {
  const { response } = (await loadSubgraph(
    'Ajna',
    'getAjnaPoolsData',
    networkId,
  )) as SubgraphsResponses['Ajna']['getAjnaPoolsData']

  const negativeWadPrecision = WAD_PRECISION * -1

  if (response && 'pools' in response) {
    return response.pools.map(
      ({
        buckets,
        collateralAddress,
        dailyPercentageRate30dAverage,
        debt,
        depositSize,
        htp,
        htpIndex,
        interestRate,
        lup,
        lupIndex,
        poolMinDebtAmount,
        quoteTokenAddress,
        lendApr,
        borrowApr,
      }) => ({
        buckets,
        collateralAddress,
        quoteTokenAddress,
        interestRate: new BigNumber(interestRate).shiftedBy(negativeWadPrecision),
        debt: new BigNumber(debt).shiftedBy(negativeWadPrecision),
        depositSize: new BigNumber(depositSize).shiftedBy(negativeWadPrecision),
        dailyPercentageRate30dAverage: new BigNumber(dailyPercentageRate30dAverage).shiftedBy(
          negativeWadPrecision,
        ),
        poolMinDebtAmount: new BigNumber(poolMinDebtAmount).shiftedBy(negativeWadPrecision),
        lowestUtilizedPrice: new BigNumber(lup).shiftedBy(negativeWadPrecision),
        lowestUtilizedPriceIndex: parseInt(lupIndex, 10),
        highestThresholdPrice: new BigNumber(htp).shiftedBy(negativeWadPrecision),
        highestThresholdPriceIndex: parseInt(htpIndex, 10),
        lendApr: new BigNumber(lendApr).shiftedBy(NEGATIVE_WAD_PRECISION),
        borrowApr: new BigNumber(borrowApr).shiftedBy(NEGATIVE_WAD_PRECISION),
      }),
    )
  }

  throw new Error(
    `No pool data found for networkId: ${networkId}, Response: ${JSON.stringify(response)}`,
  )
}
