import type { Bucket } from '@oasisdex/dma-library'
import BigNumber from 'bignumber.js'
import { NEGATIVE_WAD_PRECISION, WAD_PRECISION } from 'components/constants'
import type { OmniSupportedNetworkIds } from 'features/omni-kit/types'
import type { SubgraphsResponses } from 'features/subgraphLoader/types'
import { loadSubgraph } from 'features/subgraphLoader/useSubgraphLoader'

export interface AjnaPoolsDataResponse {
  address: string
  borrowApr: string
  buckets: Bucket[]
  collateralAddress: string
  dailyPercentageRate30dAverage: string
  quoteToken: {
    symbol: string
  }
  collateralToken: {
    symbol: string
  }
  debt: string
  depositSize: string
  htp: string
  htpIndex: string
  interestRate: string
  lendApr: string
  lup: string
  lupIndex: string
  poolMinDebtAmount: string
  quoteTokenAddress: string
  summerDepositAmountEarningInterest: string
}

export interface AjnaPoolsTableData {
  address: string
  borrowApr: BigNumber
  buckets: Bucket[]
  collateralTokenAddress: string
  collateralToken: string
  quoteToken: string
  dailyPercentageRate30dAverage: BigNumber
  debt: BigNumber
  depositSize: BigNumber
  highestThresholdPrice: BigNumber
  highestThresholdPriceIndex: number
  interestRate: BigNumber
  lendApr: BigNumber
  lowestUtilizedPrice: BigNumber
  lowestUtilizedPriceIndex: number
  poolMinDebtAmount: BigNumber
  quoteTokenAddress: string
  summerDepositAmountEarningInterest: BigNumber
}

export const getAjnaPoolsData = async (
  networkId: OmniSupportedNetworkIds,
): Promise<AjnaPoolsTableData[]> => {
  const { response } = (await loadSubgraph({
    subgraph: 'Ajna',
    method: 'getAjnaPoolsData',
    networkId,
  })) as SubgraphsResponses['Ajna']['getAjnaPoolsData']

  const negativeWadPrecision = WAD_PRECISION * -1

  if (response && 'pools' in response) {
    return response.pools.map(
      ({
        address,
        borrowApr,
        buckets,
        collateralAddress,
        dailyPercentageRate30dAverage,
        debt,
        depositSize,
        htp,
        htpIndex,
        interestRate,
        lendApr,
        lup,
        lupIndex,
        poolMinDebtAmount,
        quoteTokenAddress,
        summerDepositAmountEarningInterest,
        quoteToken,
        collateralToken,
      }) => ({
        address,
        borrowApr: new BigNumber(borrowApr).shiftedBy(NEGATIVE_WAD_PRECISION),
        buckets,
        dailyPercentageRate30dAverage: new BigNumber(dailyPercentageRate30dAverage).shiftedBy(
          negativeWadPrecision,
        ),
        collateralTokenAddress: collateralAddress,
        quoteToken: quoteToken.symbol,
        collateralToken: collateralToken.symbol,
        debt: new BigNumber(debt).shiftedBy(negativeWadPrecision),
        depositSize: new BigNumber(depositSize).shiftedBy(negativeWadPrecision),
        highestThresholdPrice: new BigNumber(htp).shiftedBy(negativeWadPrecision),
        highestThresholdPriceIndex: parseInt(htpIndex, 10),
        interestRate: new BigNumber(interestRate).shiftedBy(negativeWadPrecision),
        lendApr: new BigNumber(lendApr).shiftedBy(NEGATIVE_WAD_PRECISION),
        lowestUtilizedPrice: new BigNumber(lup).shiftedBy(negativeWadPrecision),
        lowestUtilizedPriceIndex: parseInt(lupIndex, 10),
        poolMinDebtAmount: new BigNumber(poolMinDebtAmount).shiftedBy(negativeWadPrecision),
        quoteTokenAddress,
        summerDepositAmountEarningInterest: new BigNumber(
          summerDepositAmountEarningInterest,
        ).shiftedBy(negativeWadPrecision),
      }),
    )
  }

  throw new Error(
    `No pool data found for networkId: ${networkId}, Response: ${JSON.stringify(response)}`,
  )
}
