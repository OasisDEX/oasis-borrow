import { NetworkIds } from 'blockchain/networks'

export const aaveHistorySupport: { [key: number]: boolean } = {
  // Mainnets
  [NetworkIds.MAINNET]: true,
  [NetworkIds.OPTIMISMMAINNET]: false,
  [NetworkIds.ARBITRUMMAINNET]: false,
  [NetworkIds.POLYGONMAINNET]: false,

  // Testnets
  [NetworkIds.GOERLI]: false,
  [NetworkIds.ARBITRUMGOERLI]: false,
  [NetworkIds.OPTIMISMGOERLI]: false,
}
