// all the network names we use in the app
export enum NetworkNames {
  ethereumMainnet = 'mainnet',
  ethereumGoerli = 'goerli',

  arbitrumMainnet = 'arbitrum-mainnet',
  arbitrumGoerli = 'arbitrum-goerli',

  polygonMainnet = 'polygon-mainnet',
  polygonMumbai = 'polygon-mumbai',

  optimismMainnet = 'optimism-mainnet',
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
