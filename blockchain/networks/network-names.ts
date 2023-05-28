// all the network names we use in the app
export enum NetworkNames {
  ethereumMainnet = 'ethereum',
  ethereumFork = 'ethereum-fork',
  ethereumGoerli = 'ethereum-goerli',

  arbitrumMainnet = 'arbitrum',
  arbitrumGoerli = 'arbitrum-goerli',

  polygonMainnet = 'polygon',
  polygonMumbai = 'polygon-mumbai',

  optimismMainnet = 'optimism',
  optimismGoerli = 'optimism-goerli',
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
