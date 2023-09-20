import BigNumber from 'bignumber.js'
import type { NetworkIds } from 'blockchain/networks'
import { NEGATIVE_WAD_PRECISION, WAD_PRECISION } from 'components/constants'
import type { SubgraphsResponses } from 'features/subgraphLoader/types'
import { loadSubgraph } from 'features/subgraphLoader/useSubgraphLoader'

import type { AjnaPoolsTableData } from './getAjnaPoolsData.types'

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
        address,
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
        address,
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
