// all the network names we use in the app
export enum NetworkNames {
  ethereumMainnet = 'ethereumMainnet',
  ethereumGoerli = 'ethereumGoerli',
  ethereumHardhat = 'ethereumHardhat',

  arbitrumMainnet = 'arbitrumMainnet',
  arbitrumGoerli = 'arbitrumGoerli',

  optimismMainnet = 'optimismMainnet',
  optimismGoerli = 'optimismGoerli',

  avalancheMainnet = 'avalancheMainnet',
  polygonMainnet = 'polygonMainnet',
}

// main network names skipping the testnets mapping
export enum MainNetworkNames {
  ethereumMainnet = 'ethereumMainnet',
  ethereumGoerli = 'ethereumMainnet',
  ethereumHardhat = 'ethereumMainnet',

  arbitrumMainnet = 'arbitrumMainnet',
  arbitrumGoerli = 'arbitrumMainnet',

  optimismMainnet = 'optimismMainnet',
  optimismGoerli = 'optimismMainnet',

  avalancheMainnet = 'avalancheMainnet',

  polygonMainnet = 'polygonMainnet',
}

export type NetworkLabelType =
  | 'Polygon'
  | 'Ethereum'
  | 'Ethereum Goerli'
  | 'Ethereum Hardhat'
  | 'Arbitrum'
  | 'Avalanche'
  | 'Optimism'
  | 'Polygon'
