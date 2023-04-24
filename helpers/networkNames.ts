// all the network names we use in the app
export enum NetworkNames {
  ethereumMainnet = 'mainnet',
  ethereumGoerli = 'goerli',
  ethereumHardhat = 'hardhat',

  arbitrumMainnet = 'arbitrum-mainnet',
  arbitrumGoerli = 'arbitrum-goerli',

  polygonMainnet = 'polygon-mainnet',
  polygonMumbai = 'polygon-mumbai',

  optimismMainnet = 'optimism-mainnet',
  optimismGoerli = 'optimism-goerli',

  // avalancheMainnet = 'avalanche-mainnet',
}

// main network names skipping the testnets mapping
export enum MainNetworkNames {
  ethereumMainnet = 'mainnet',
  ethereumGoerli = 'mainnet',
  ethereumHardhat = 'mainnet',

  arbitrumMainnet = 'arbitrum-mainnet',
  arbitrumGoerli = 'arbitrum-mainnet',

  polygonMainnet = 'polygon-mainnet',
  polygonMumbai = 'polygon-mainnet',

  optimismMainnet = 'optimism-mainnet',
  optimismGoerli = 'optimism-mainnet',

  // avalancheMainnet = 'avalanche-mainnet',
}

export type NetworkLabelType =
  | 'Ethereum'
  | 'Ethereum Goerli'
  | 'Ethereum Hardhat'
  | 'Arbitrum'
  | 'Arbitrum Goerli'
  | 'Polygon'
  | 'Polygon Mumbai'
  | 'Optimism'
  | 'Optimism Goerli'
// | 'Avalanche'
