// all the network names we use in the app
import { NetworkIds } from 'blockchain/networks/network-ids'

export enum NetworkNames {
  ethereumMainnet = 'ethereum',
  ethereumGoerli = 'ethereum_goerli',

  arbitrumMainnet = 'arbitrum',
  arbitrumGoerli = 'arbitrum_goerli',

  polygonMainnet = 'polygon',
  polygonMumbai = 'polygon_mumbai',

  optimismMainnet = 'optimism',
  optimismGoerli = 'optimism_goerli',

  baseMainnet = 'base',
  baseGoerli = 'base_goerli',
}

export type NetworkLabelType =
  | 'Ethereum'
  | 'Ethereum Goerli'
  | 'Arbitrum'
  | 'Arbitrum Goerli'
  | 'Polygon'
  | 'Polygon Mumbai'
  | 'Optimism'
  | 'Optimism Goerli'
  | 'Base'
  | 'Base Goerli'

export function isSupportedNetwork(value: string): value is NetworkNames {
  return Object.values<string>(NetworkNames).includes(value)
}

export const networkNameToIdMap = {
  [NetworkNames.ethereumMainnet]: NetworkIds.MAINNET,
  [NetworkNames.ethereumGoerli]: NetworkIds.GOERLI,
  [NetworkNames.optimismGoerli]: NetworkIds.OPTIMISMGOERLI,
  [NetworkNames.baseGoerli]: NetworkIds.BASEGOERLI,
  [NetworkNames.arbitrumMainnet]: NetworkIds.ARBITRUMMAINNET,
  [NetworkNames.arbitrumGoerli]: NetworkIds.ARBITRUMGOERLI,
  [NetworkNames.optimismMainnet]: NetworkIds.OPTIMISMMAINNET,
  [NetworkNames.baseMainnet]: NetworkIds.BASEMAINNET,
  [NetworkNames.polygonMainnet]: NetworkIds.POLYGONMAINNET,
  [NetworkNames.polygonMumbai]: NetworkIds.POLYGONMUMBAI,
}
