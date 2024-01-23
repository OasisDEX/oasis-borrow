import { NetworkIds } from 'blockchain/networks'
import type { OmniProductType } from 'features/omni-kit/types'
import request, { gql } from 'graphql-request'
import type { ConfigResponseType } from 'helpers/config'
import { configCacheTime, getRemoteConfigWithCache } from 'helpers/config'

const dpmListQuery = gql`
  query dpmData($walletAddress: String) {
    accounts(where: { user: $walletAddress }) {
      createEvents {
        debtToken
        collateralToken
        positionType
        protocol
      }
      collateralToken
      debtToken
      id
      positionType
      protocol
      user {
        id
      }
      vaultId
    }
  }
`

interface DpmSubgraphDataCreateEvents {
  debtToken: string
  collateralToken: string
  positionType: OmniProductType
  protocol: string
}

interface DpmSubgraphDataResponse {
  accounts: {
    collateralToken: string
    createEvents: DpmSubgraphDataCreateEvents[]
    debtToken: string
    id: string
    networkId: DpmSupportedNetworks
    positionType: OmniProductType
    protocol: string
    user: {
      id: string
    }
    vaultId: string
  }[]
}

export interface DpmSubgraphData {
  collateralToken: string
  createEvents: DpmSubgraphDataCreateEvents[]
  debtToken: string
  id: string
  networkId: DpmSupportedNetworks
  positionType: OmniProductType
  protocol: string
  user: string
  vaultId: string
}

export type DpmSupportedNetworks =
  | NetworkIds.MAINNET
  | NetworkIds.ARBITRUMMAINNET
  | NetworkIds.OPTIMISMMAINNET
  | NetworkIds.BASEMAINNET

export const dpmListSupportedNetworks = [
  NetworkIds.MAINNET,
  NetworkIds.ARBITRUMMAINNET,
  NetworkIds.OPTIMISMMAINNET,
  NetworkIds.BASEMAINNET,
]
const subgraphListDict = {
  [NetworkIds.MAINNET]: 'oasis/dpm',
  [NetworkIds.ARBITRUMMAINNET]: 'oasis/dpm-arbitrum',
  [NetworkIds.OPTIMISMMAINNET]: 'oasis/dpm-optimism',
  [NetworkIds.BASEMAINNET]: 'oasis/dpm-base',
} as Record<DpmSupportedNetworks, string>

export const getAllDpmsForWallet = async ({ address }: { address: string }) => {
  const appConfig: ConfigResponseType = await getRemoteConfigWithCache(
    1000 * configCacheTime.backend,
  )
  const dpmCallList = dpmListSupportedNetworks.map((networkId) => {
    const subgraphUrl = `${appConfig.parameters.subgraphs.baseUrl}/${
      subgraphListDict[networkId as DpmSupportedNetworks]
    }`
    const params = { walletAddress: address.toLowerCase() }

    return request<DpmSubgraphDataResponse>(subgraphUrl, dpmListQuery, params).then((data) => ({
      networkId: networkId as DpmSupportedNetworks,
      accounts: data.accounts,
    }))
  })

  // We have a DPM
  // It has creat position events associated
  // Those events can be other protocols with other token pairs relative to the DPM primary properties
  return await Promise.all(dpmCallList).then((dpmNetworkList) => {
    return dpmNetworkList
      .flatMap((dpm) => {
        return dpm.accounts.map(
          ({ id, createEvents, positionType, vaultId, user: { id: user } }) => {
            // Note: Kuba fix resolved issue with createPosition events being missed https://github.com/OasisDEX/oasis-borrow/pull/3397/files
            return createEvents
              .map(({ positionType: eventPositionType, ...rest2 }) => {
                return {
                  // This ensures that each position has the correct collateral and debt token rather than the ones from the primary position
                  collateralToken: rest2.collateralToken,
                  debtToken: rest2.debtToken,
                  id,
                  networkId: dpm.networkId,
                  positionType: positionType?.toLowerCase() as OmniProductType,
                  protocol: rest2.protocol,
                  user,
                  vaultId,
                  // Filter createEvents to just return the createEvent for the position in question.
                  // Given we're extracting positions from the DPM and treating positions like DPMs (given DPMs are now reusable)
                  createEvents: createEvents
                    .map(({ positionType: eventPositionType, ...rest }) => ({
                      ...rest,
                      positionType: eventPositionType.toLowerCase() as OmniProductType,
                    }))
                    // Remove createEvents that don't match the position in question
                    .filter(
                      (event) =>
                        event.protocol === rest2.protocol &&
                        event.positionType === eventPositionType &&
                        event.collateralToken === rest2.collateralToken &&
                        event.debtToken === rest2.debtToken,
                    ),
                }
              })
              .filter(
                // Deduplicate positions based on collateralToken, debtToken, positionType, protocol
                (positionAsDpm, index, self) =>
                  self.findIndex((e) => {
                    return (
                      e.collateralToken === positionAsDpm.collateralToken &&
                      e.debtToken === positionAsDpm.debtToken &&
                      e.positionType === positionAsDpm.positionType &&
                      e.protocol === positionAsDpm.protocol
                    )
                  }) === index,
              )
          },
        )
      })
      .flat()
  })
}
