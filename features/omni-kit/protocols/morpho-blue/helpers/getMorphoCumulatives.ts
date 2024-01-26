import type { GetCumulativesData, MorphoCumulativesData } from '@oasisdex/dma-library'
import { defaultLendingCumulatives } from 'features/omni-kit/cumulativesDefaults'
import { mapOmniLendingCumulatives } from 'features/omni-kit/helpers'
import type { OmniSupportedNetworkIds } from 'features/omni-kit/types'
import type { SubgraphsResponses } from 'features/subgraphLoader/types'
import { loadSubgraph } from 'features/subgraphLoader/useSubgraphLoader'

export const getMorphoCumulatives: (
  networkId: OmniSupportedNetworkIds,
) => GetCumulativesData<MorphoCumulativesData> =
  (networkId) => async (proxy: string, marketId: string) => {
    const { response } = (await loadSubgraph('Morpho', 'getMorphoCumulatives', networkId, {
      dpmProxyAddress: proxy.toLowerCase(),
      marketId: marketId.toLowerCase(),
    })) as SubgraphsResponses['Morpho']['getMorphoCumulatives']

    const lendingCumulatives = response.account?.borrowPositions[0]

    if (!lendingCumulatives) {
      return defaultLendingCumulatives
    }

    return {
      ...mapOmniLendingCumulatives(lendingCumulatives),
    }
  }
