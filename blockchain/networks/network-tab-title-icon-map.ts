import { NetworkNames } from 'blockchain/networks/network-names'

// these are used for the tab title
export const networkTabTitleIconMap: { [key: NetworkNames | 'fork']: string } = {
  [NetworkNames.ethereumMainnet]: '',
  [NetworkNames.ethereumGoerli]: '🌲 ',
  [NetworkNames.arbitrumMainnet]: '',
  [NetworkNames.arbitrumGoerli]: '🌲 ',
  [NetworkNames.optimismMainnet]: '',
  [NetworkNames.optimismGoerli]: '🌲',
  [NetworkNames.polygonMainnet]: '',
  [NetworkNames.polygonMumbai]: '🌲',
  fork: '👷‍♂️ ',
}
