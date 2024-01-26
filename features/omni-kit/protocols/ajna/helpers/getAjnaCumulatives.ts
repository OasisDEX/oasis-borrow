import type { AjnaCumulativesData, GetCumulativesData } from '@oasisdex/dma-library'
import {
  defaultEarnCumulatives,
  defaultLendingCumulatives,
} from 'features/omni-kit/cumulativesDefaults'
import { mapOmniEarnCumulatives, mapOmniLendingCumulatives } from 'features/omni-kit/helpers'
import type { OmniSupportedNetworkIds } from 'features/omni-kit/types'
import type { SubgraphsResponses } from 'features/subgraphLoader/types'
import { loadSubgraph } from 'features/subgraphLoader/useSubgraphLoader'

export const getAjnaCumulatives: (
  networkId: OmniSupportedNetworkIds,
) => GetCumulativesData<AjnaCumulativesData> =
  (networkId) => async (proxy: string, poolAddress: string) => {
    const { response } = (await loadSubgraph('Ajna', 'getAjnaCumulatives', networkId, {
      dpmProxyAddress: proxy.toLowerCase(),
      poolAddress: poolAddress.toLowerCase(),
    })) as SubgraphsResponses['Ajna']['getAjnaCumulatives']

    const lendingCumulatives = response.account?.borrowPositions[0]
    const earningCumulatives = response.account?.earnPositions[0]

    if (!lendingCumulatives || !earningCumulatives) {
      return { ...defaultLendingCumulatives, ...defaultEarnCumulatives }
    }

    return {
      ...mapOmniLendingCumulatives(lendingCumulatives),
      ...mapOmniEarnCumulatives(earningCumulatives),
    }
  }
