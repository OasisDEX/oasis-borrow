import { NetworkIds } from 'blockchain/networks'
import request, { gql } from 'graphql-request'

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
    positionType: string
    collateralToken: string
    debtToken: string
    protocol: string
  }[]
}

export type DpmList = {
  id: string
  user: string
  vaultId: string
  positionType: string
  collateralToken: string
  debtToken: string
  protocol: string
}[]

const dpmListSupportedNetworks = [
  NetworkIds.MAINNET,
  NetworkIds.ARBITRUMMAINNET,
  NetworkIds.OPTIMISMMAINNET,
  NetworkIds.BASEMAINNET,
]
const subgraphListDict = {
  [NetworkIds.MAINNET]: 'dpm-arbitrum',
  [NetworkIds.ARBITRUMMAINNET]: 'dpm-base',
  [NetworkIds.OPTIMISMMAINNET]: 'dpm-optimism',
  [NetworkIds.BASEMAINNET]: 'dpm',
} as Record<(typeof dpmListSupportedNetworks)[number], string>

export const getAllDpmsForWallet = async ({ address }: { address: string }) => {
  const dpmCallList = dpmListSupportedNetworks.map((networkId) => {
    const subgraphUrl = `${process.env.DPM_SUBGRAPHS_BASE_URL}/${subgraphListDict[networkId]}`
    const subgraphMethod = dpmListQuery
    const params = { walletAddress: address.toLowerCase() }
    return request<DpmListQueryResponse>(subgraphUrl, subgraphMethod, params)
  })
  const dpmList = await Promise.all(dpmCallList).then((dpmNetworkList) => {
    return dpmNetworkList
      .map((dpm) => {
        return dpm.accounts.map((account) => {
          return {
            id: account.id,
            user: account.user.id,
            vaultId: account.vaultId,
            positionType: account.positionType,
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
