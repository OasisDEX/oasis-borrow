import type { AjnaCumulativesData, GetCumulativesData } from '@oasisdex/dma-library'
import { defaultEarnCumulatives, defaultLendingCumulatives } from 'features/omni-kit/constants'
import { mapOmniEarnCumulatives, mapOmniLendingCumulatives } from 'features/omni-kit/helpers'
import type { OmniSupportedNetworkIds } from 'features/omni-kit/types'
import type { SubgraphsResponses } from 'features/subgraphLoader/types'
import { loadSubgraph } from 'features/subgraphLoader/useSubgraphLoader'

export const getAjnaCumulatives: (
  networkId: OmniSupportedNetworkIds,
) => GetCumulativesData<AjnaCumulativesData> =
  (networkId) => async (proxy: string, poolAddress: string) => {
    const { response } = (await loadSubgraph({
      subgraph: 'Ajna',
      method: 'getAjnaCumulatives',
      networkId,
      params: {
        dpmProxyAddress: proxy.toLowerCase(),
        poolAddress: poolAddress.toLowerCase(),
      },
    })) as SubgraphsResponses['Ajna']['getAjnaCumulatives']

    const mappedOmniLendingCumulatives = response.account?.borrowPositions[0]
      ? mapOmniLendingCumulatives(response.account?.borrowPositions[0])
      : defaultLendingCumulatives
    const mappedOmniEarnCumulatives = response.account?.earnPositions[0]
      ? mapOmniEarnCumulatives(response.account?.earnPositions[0])
      : defaultEarnCumulatives

    return {
      ...mappedOmniLendingCumulatives,
      ...mappedOmniEarnCumulatives,
    }
  }
