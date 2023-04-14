import BigNumber from 'bignumber.js'
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
  htp: string
}

interface AjnaPoolsTableData {
  collateralAddress: string
  quoteTokenAddress: string
  debt: BigNumber
  depositSize: BigNumber
  interestRate: BigNumber
  dailyPercentageRate30dAverage: BigNumber
  poolMinDebtAmount: BigNumber
  lowestUtilizedPrice: BigNumber
  highestThresholdPrice: BigNumber
}

export const getAjnaPoolsTableData = async (): Promise<AjnaPoolsTableData[]> => {
  const { response } = await loadSubgraph('Ajna', 'getPoolsTableData')

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
        htp,
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
        highestThresholdPrice: new BigNumber(htp).shiftedBy(negativeWadPrecision),
      }),
    )
  }

  throw new Error('No pool data found')
}
