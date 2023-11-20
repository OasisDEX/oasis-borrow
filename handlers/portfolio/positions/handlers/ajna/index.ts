import { views } from '@oasisdex/dma-library'
import { getRpcProvider, NetworkIds, NetworkNames } from 'blockchain/networks'
import { getAjnaCumulatives } from 'features/ajna/positions/common/helpers/getAjnaCumulatives'
import { getAjnaPoolData } from 'features/ajna/positions/common/helpers/getAjnaPoolData'
import { getAjnaEarnData } from 'features/ajna/positions/earn/helpers/getAjnaEarnData'
import type { SubgraphsResponses } from 'features/subgraphLoader/types'
import { loadSubgraph } from 'features/subgraphLoader/useSubgraphLoader'
import {
  getAjnaPositionDetails,
  getAjnaPositionInfo,
  getAjnaPositionNetValue,
} from 'handlers/portfolio/positions/handlers/ajna/helpers'
import type { PortfolioPosition, PortfolioPositionsHandler } from 'handlers/portfolio/types'
import { LendingProtocol } from 'lendingProtocols'

export const ajnaPositionsHandler: PortfolioPositionsHandler = async ({
  address,
  apiVaults,
  dpmList,
  prices,
  positionsCount,
}) => {
  const dpmProxyAddress = dpmList.map(({ id }) => id)
  const subgraphPositions = (await loadSubgraph('Ajna', 'getAjnaDpmPositions', NetworkIds.MAINNET, {
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
  }

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
          provider: getRpcProvider(NetworkIds.MAINNET),
          getPoolData: getAjnaPoolData(NetworkIds.MAINNET),
          getCumulatives: getAjnaCumulatives(NetworkIds.MAINNET),
        }

        const position = isEarn
          ? await views.ajna.getEarnPosition(commonPayload, {
              ...commonDependency,
              getEarnData: getAjnaEarnData(NetworkIds.MAINNET),
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
          network: NetworkNames.ethereumMainnet,
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

  return {
    address,
    positions,
  }
}
