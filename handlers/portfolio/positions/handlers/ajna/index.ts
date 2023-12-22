import { views } from '@oasisdex/dma-library'
import type { Vault } from '@prisma/client'
import { getRpcProvider, NetworkIds, networksById } from 'blockchain/networks'
import {
  getAjnaCumulatives,
  getAjnaEarnData,
  getAjnaPoolData,
} from 'features/omni-kit/protocols/ajna/helpers'
import type { OmniSupportedNetworkIds } from 'features/omni-kit/types'
import type { SubgraphsResponses } from 'features/subgraphLoader/types'
import { loadSubgraph } from 'features/subgraphLoader/useSubgraphLoader'
import {
  getAjnaPositionDetails,
  getAjnaPositionInfo,
  getAjnaPositionNetValue,
} from 'handlers/portfolio/positions/handlers/ajna/helpers'
import type { TokensPricesList } from 'handlers/portfolio/positions/helpers'
import type { DpmSubgraphData } from 'handlers/portfolio/positions/helpers/getAllDpmsForWallet'
import type {
  PortfolioPosition,
  PortfolioPositionsCountReply,
  PortfolioPositionsHandler,
  PortfolioPositionsReply,
} from 'handlers/portfolio/types'
import { LendingProtocol } from 'lendingProtocols'

interface GetAjnaPositionsParams {
  apiVaults?: Vault[]
  dpmList: DpmSubgraphData[]
  prices: TokensPricesList
  networkId: OmniSupportedNetworkIds
  positionsCount?: boolean
}

async function getAjnaPositions({
  apiVaults,
  dpmList,
  networkId,
  positionsCount,
  prices,
}: GetAjnaPositionsParams): Promise<PortfolioPositionsReply | PortfolioPositionsCountReply> {
  const dpmProxyAddress = dpmList.map(({ id }) => id)
  const subgraphPositions = (await loadSubgraph('Ajna', 'getAjnaDpmPositions', networkId, {
    dpmProxyAddress,
  })) as SubgraphsResponses['Ajna']['getAjnaDpmPositions']
  const positionsArray = subgraphPositions.response.accounts.flatMap(
    ({ address: proxyAddress, borrowPositions, earnPositions, vaultId: positionId }) => [
      ...borrowPositions.map((position) => ({
        ...position,
        proxyAddress,
        isEarn: false,
        positionId,
      })),
      ...earnPositions.map((position) => ({ ...position, proxyAddress, isEarn: true, positionId })),
    ],
  )

  if (positionsCount || !apiVaults) {
    return {
      positions: positionsArray.map(({ positionId }) => ({ positionId })),
    }
  } else {
    const positions = await Promise.all(
      positionsArray.map(
        async ({
          isEarn,
          pool,
          positionId,
          protocolEvents,
          proxyAddress,
        }): Promise<PortfolioPosition> => {
          const {
            ajnaPoolInfo,
            collateralPrice,
            isOracless,
            poolAddress,
            primaryToken,
            quotePrice,
            secondaryToken,
            type,
            url,
          } = await getAjnaPositionInfo({
            apiVaults,
            dpmList,
            isEarn,
            networkId,
            pool,
            positionId,
            prices,
            proxyAddress,
          })

          // proxies with more than one position doesn not support pnl calculation on subgraph so far
          const isProxyWithManyPositions =
            positionsArray.filter((item) => proxyAddress === item.proxyAddress).length > 1

          // get Ajna position from dma
          const commonPayload = { collateralPrice, quotePrice, proxyAddress, poolAddress }
          const commonDependency = {
            poolInfoAddress: ajnaPoolInfo.address,
            provider: getRpcProvider(networkId),
            getPoolData: getAjnaPoolData(networkId),
            getCumulatives: getAjnaCumulatives(networkId),
          }

          const position = isEarn
            ? await views.ajna.getEarnPosition(commonPayload, {
                ...commonDependency,
                getEarnData: getAjnaEarnData(networkId),
              })
            : await views.ajna.getPosition(commonPayload, commonDependency)

          return {
            availableToMigrate: false,
            automations: {},
            details: getAjnaPositionDetails({
              collateralPrice,
              isOracless,
              isProxyWithManyPositions,
              position,
              primaryToken,
              quotePrice,
              secondaryToken,
              type,
            }),
            ...(isEarn && { lendingType: 'active' }),
            network: networksById[networkId].name,
            netValue: getAjnaPositionNetValue({
              collateralPrice,
              isOracless,
              position,
              quotePrice,
              type,
            }),
            openDate: Number(protocolEvents[0].timestamp),
            positionId: Number(positionId),
            primaryToken,
            protocol: LendingProtocol.Ajna,
            secondaryToken,
            type,
            url,
          }
        },
      ),
    )

    return { positions }
  }
}

export const ajnaPositionsHandler: PortfolioPositionsHandler = async ({
  address,
  apiVaults,
  dpmList,
  prices,
  positionsCount,
}) => {
  return Promise.all([
    getAjnaPositions({ apiVaults, dpmList, networkId: NetworkIds.MAINNET, prices, positionsCount }),
    getAjnaPositions({
      apiVaults,
      dpmList,
      networkId: NetworkIds.BASEMAINNET,
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
