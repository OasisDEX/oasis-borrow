import type { Vault } from '@prisma/client'
import { NetworkIds } from 'blockchain/networks'
import type { OmniSupportedNetworkIds } from 'features/omni-kit/types'
import { SubgraphsResponses } from 'features/subgraphLoader/types'
import { loadSubgraph } from 'features/subgraphLoader/useSubgraphLoader'
import type { TokensPricesList } from 'handlers/portfolio/positions/helpers'
import type { DpmSubgraphData } from 'handlers/portfolio/positions/helpers/getAllDpmsForWallet'
import type {
  PortfolioPositionsCountReply,
  PortfolioPositionsHandler,
  PortfolioPositionsReply,
} from 'handlers/portfolio/types'

interface GetMorphoPositionsParams {
  apiVaults?: Vault[]
  dpmList: DpmSubgraphData[]
  prices: TokensPricesList
  networkId: OmniSupportedNetworkIds
  positionsCount?: boolean
}

async function getMorphoPositions({
  apiVaults,
  dpmList,
  networkId,
  positionsCount,
  prices,
}: GetMorphoPositionsParams): Promise<PortfolioPositionsReply | PortfolioPositionsCountReply> {
  const dpmProxyAddress = dpmList.map(({ id }) => id)
  const subgraphPositions = (await loadSubgraph('Morpho', 'getMorphoDpmPositions', networkId, {
    dpmProxyAddress,
  })) as SubgraphsResponses['Morpho']['getMorphoDpmPositions']

  console.log(dpmProxyAddress)
  console.log(subgraphPositions)

  if (positionsCount || !apiVaults) {
    return {
      positions: [],
    }
  } else {
    return { positions: [] }
  }
}

export const morphoPositionsHandler: PortfolioPositionsHandler = async ({
  address,
  apiVaults,
  dpmList,
  prices,
  positionsCount,
}) => {
  return Promise.all([
    getMorphoPositions({
      apiVaults,
      dpmList,
      networkId: NetworkIds.MAINNET,
      prices,
      positionsCount,
    }),
  ]).then((responses) => {
    return {
      address,
      positions: responses.flatMap(({ positions }) => positions),
    }
  })
}
