import { getNetworkByName } from 'blockchain/networks'
import type { ProductHubItem } from 'features/productHub/types'
import type { GetAaveLikeInterestRateInput } from 'features/refinance/graph/getRefinanceAaveLikeInterestRates'
import { LendingProtocol } from 'lendingProtocols'
import { uniq } from 'lodash'

const protocols = [LendingProtocol.AaveV3, LendingProtocol.SparkV3]

export const getRefinanceInterestRatesInputParams = (
  table: ProductHubItem[],
): GetAaveLikeInterestRateInput =>
  table
    .filter((item) => protocols.includes(item.protocol))
    .reduce((acc, curr) => {
      const networkConfig = getNetworkByName(curr.network)
      const chainID = networkConfig.id

      return {
        ...acc,
        [chainID]: {
          ...(acc[chainID] ? acc[chainID] : []),
          [curr.protocol]: uniq([
            ...(acc[chainID]?.[curr.protocol] ? acc[chainID][curr.protocol] : []),
            curr.primaryToken,
            curr.secondaryToken,
          ]),
        },
      }
    }, {} as GetAaveLikeInterestRateInput)
