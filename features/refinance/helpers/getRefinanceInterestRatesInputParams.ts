import { getNetworkByName } from 'blockchain/networks'
import { aaveLikeProtocols } from 'features/aave/constants'
import type { ProductHubItem } from 'features/productHub/types'
import type { GetAaveLikeInterestRateInput } from 'features/refinance/graph/getRefinanceAaveLikeInterestRates'
import { uniq } from 'lodash'

export const getRefinanceInterestRatesInputParams = (
  table: ProductHubItem[],
): GetAaveLikeInterestRateInput =>
  table
    .filter((item) => aaveLikeProtocols.includes(item.protocol))
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
