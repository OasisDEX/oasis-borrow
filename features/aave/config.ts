import { NetworkIds } from 'blockchain/networks'

export const aaveHistorySupport: Record<number, boolean> = {
  // Mainnets
  [NetworkIds.MAINNET]: false,
  [NetworkIds.OPTIMISMMAINNET]: false,
  [NetworkIds.ARBITRUMMAINNET]: false,
  [NetworkIds.POLYGONMAINNET]: false,

  // Testnets
  [NetworkIds.GOERLI]: false,
  [NetworkIds.ARBITRUMGOERLI]: false,
  [NetworkIds.OPTIMISMGOERLI]: false,
}
