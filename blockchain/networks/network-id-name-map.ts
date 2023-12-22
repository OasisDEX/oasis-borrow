import { Network } from '@oasisdex/dma-library'
import { NetworkIds } from 'blockchain/networks/network-ids'

export const networkIdNameMap = {
  [NetworkIds.MAINNET]: Network.MAINNET,
  [NetworkIds.GOERLI]: Network.GOERLI,
  [NetworkIds.BASEMAINNET]: Network.BASE,
  [NetworkIds.OPTIMISMMAINNET]: Network.OPTIMISM,
  [NetworkIds.ARBITRUMMAINNET]: Network.ARBITRUM,
}
