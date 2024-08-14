import { NetworkIds } from 'blockchain/networks'
import type { OmniProductType } from 'features/omni-kit/types'
import request, { gql } from 'graphql-request'
import { configCacheTime, getRemoteConfigWithCache } from 'helpers/config'
import { uniq } from 'ramda'

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
  [NetworkIds.MAINNET]: 'summer-dpm',
  [NetworkIds.ARBITRUMMAINNET]: 'summer-dpm-arbitrum',
  [NetworkIds.OPTIMISMMAINNET]: 'summer-dpm-optimism',
  [NetworkIds.BASEMAINNET]: 'summer-dpm-base',
} as Record<DpmSupportedNetworks, string>

export const getAllDpmsForWallet = async ({ address }: { address: string }) => {
  const appConfig = await getRemoteConfigWithCache(1000 * configCacheTime.backend)
  const dpmCallList = dpmListSupportedNetworks.map((networkId) => {
    const subgraphUrl = `${appConfig.parameters.subgraphs.baseShortUrl}/${
      subgraphListDict[networkId as DpmSupportedNetworks]
    }`
    const params = { walletAddress: address.toLowerCase() }

    return request<DpmSubgraphDataResponse>(subgraphUrl, dpmListQuery, params).then((data) => ({
      networkId: networkId as DpmSupportedNetworks,
      accounts: data.accounts,
    }))
  })

  // We have a DPM
  // It has created position events associated
  // Those events can be other protocols with other token pairs relative to the DPM primary properties
  // therefore we are mapping it
  const dpms = await Promise.all(dpmCallList).then((dpmNetworkList) => {
    return dpmNetworkList.flatMap((dpm) => {
      return dpm.accounts.flatMap((account) => {
        return account.createEvents.map((createEvent) => ({
          networkId: dpm.networkId,
          id: account.id,
          user: account.user.id,
          vaultId: account.vaultId,
          protocol: createEvent.protocol,
          positionType: createEvent.positionType.toLowerCase() as OmniProductType,
          collateralToken: createEvent.collateralToken,
          debtToken: createEvent.debtToken,
          createEvents: [createEvent],
        }))
      })
    })
  })

  // There may be 2x (or in theory more create events) with different position types. For example when someone will migrate position
  // a create borrow position event will be emitted, later on position may be closed and reopened as multiply (create multiply position event).
  // We should pick the latest createEvent (the last event from dpm list) as indicator of position type.
  const resolvedByCreateEvent = dpms.map(
    (dpm) =>
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      dpms.findLast(
        (item) =>
          item.networkId === dpm.networkId &&
          item.id === dpm.id &&
          item.user === dpm.user &&
          item.vaultId === dpm.vaultId &&
          item.protocol === dpm.protocol &&
          item.collateralToken === dpm.collateralToken &&
          item.debtToken === dpm.debtToken,
      )!,
  )

  // Since we are mapping nested events, there is a possibility that output array will contain duplicates
  // which should not be passed on UI
  return uniq(resolvedByCreateEvent)
}
