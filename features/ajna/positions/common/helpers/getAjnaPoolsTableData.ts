import BigNumber from 'bignumber.js'
import { NetworkNames } from 'blockchain/networks'
import { WAD_PRECISION } from 'components/constants'
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
}

export const getAjnaPoolsTableData = async (
  networkName: NetworkNames,
): Promise<AjnaPoolsTableData[]> => {
  const { response } = await loadSubgraph('Ajna', 'getPoolsTableData', {}, networkName)

  const negativeWadPrecision = WAD_PRECISION * -1

  if (response && 'pools' in response) {
    return response.pools.map(
      ({
        collateralAddress,
        quoteTokenAddress,
        interestRate,
        debt,
        depositSize,
        dailyPercentageRate30dAverage,
        poolMinDebtAmount,
        lup,
        lupIndex,
        htp,
        htpIndex,
      }) => ({
        collateralAddress,
        quoteTokenAddress,
        interestRate: new BigNumber(interestRate).shiftedBy(negativeWadPrecision),
        debt: new BigNumber(debt).shiftedBy(negativeWadPrecision),
        depositSize: new BigNumber(depositSize).shiftedBy(negativeWadPrecision),
        dailyPercentageRate30dAverage: new BigNumber(dailyPercentageRate30dAverage)
          .shiftedBy(negativeWadPrecision)
          .shiftedBy(2),
        poolMinDebtAmount: new BigNumber(poolMinDebtAmount).shiftedBy(negativeWadPrecision),
        lowestUtilizedPrice: new BigNumber(lup).shiftedBy(negativeWadPrecision),
        lowestUtilizedPriceIndex: parseInt(lupIndex, 10),
        highestThresholdPrice: new BigNumber(htp).shiftedBy(negativeWadPrecision),
        highestThresholdPriceIndex: parseInt(htpIndex, 10),
      }),
    )
  }

  throw new Error('No pool data found')
}
