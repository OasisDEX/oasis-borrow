// all the network names we use in the app
export enum NetworkNames {
  ethereumMainnet = 'ethereum',
  ethereumGoerli = 'ethereum-goerli',

  arbitrumMainnet = 'arbitrum',
  arbitrumGoerli = 'arbitrum-goerli',

  polygonMainnet = 'polygon',
  polygonMumbai = 'polygon-mumbai',

  optimismMainnet = 'optimism',
  optimismGoerli = 'optimism-goerli',
}

// main network names without deviations
export enum BaseNetworkNames {
  Ethereum = NetworkNames.ethereumMainnet,
  Arbitrum = NetworkNames.arbitrumMainnet,
  Polygon = NetworkNames.polygonMainnet,
  Optimism = NetworkNames.optimismMainnet,
}

// main network names skipping the testnets mapping
export enum MainNetworkNames {
  ethereumMainnet = NetworkNames.ethereumMainnet,
  ethereumGoerli = NetworkNames.ethereumMainnet,

  arbitrumMainnet = NetworkNames.arbitrumMainnet,
  arbitrumGoerli = NetworkNames.arbitrumMainnet,

  polygonMainnet = NetworkNames.polygonMainnet,
  polygonMumbai = NetworkNames.polygonMainnet,

  optimismMainnet = NetworkNames.optimismMainnet,
  optimismGoerli = NetworkNames.optimismMainnet,
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

export function isSupportedNetwork(value: string): value is NetworkNames {
  return Object.values<string>(NetworkNames).includes(value)
}
