import { NetworkIds } from 'blockchain/networks'
import type { OmniProductType } from 'features/omni-kit/types'
import request, { gql } from 'graphql-request'
import type { ConfigResponseType } from 'helpers/config'
import { configCacheTime, getRemoteConfigWithCache } from 'helpers/config'

const dpmListQuery = gql`
  query dpmData($walletAddress: String) {
    accounts(where: { user: $walletAddress }) {
      id
      user {
        id
      }
      vaultId
      positionType
      collateralToken
      debtToken
      protocol
    }
  }
`

type DpmListQueryResponse = {
  accounts: {
    id: string
    user: {
      id: string
    }
    vaultId: string
    positionType: OmniProductType
    collateralToken: string
    debtToken: string
    protocol: string
    networkId: DpmSupportedNetworks
  }[]
}

export type DpmList = {
  id: string
  user: string
  vaultId: string
  positionType: OmniProductType
  collateralToken: string
  debtToken: string
  protocol: string
  networkId: DpmSupportedNetworks
}[]

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
    return request<DpmListQueryResponse>(subgraphUrl, dpmListQuery, params).then((data) => ({
      networkId: networkId as DpmSupportedNetworks,
      accounts: data.accounts,
    }))
  })
  const dpmList = await Promise.all(dpmCallList).then((dpmNetworkList) => {
    return dpmNetworkList
      .map((dpm) => {
        return dpm.accounts.map((account) => {
          return {
            networkId: dpm.networkId,
            id: account.id,
            user: account.user.id,
            vaultId: account.vaultId,
            positionType: account.positionType?.toLowerCase() as OmniProductType,
            collateralToken: account.collateralToken,
            debtToken: account.debtToken,
            protocol: account.protocol,
          }
        })
      })
      .flat()
  })
  return dpmList
}
