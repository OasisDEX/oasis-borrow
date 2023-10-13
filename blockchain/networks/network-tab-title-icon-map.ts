import { NetworkNames } from './network-names'

// these are used for the tab title
export const networkTabTitleIconMap: Record<NetworkNames | 'fork', string> = {
  [NetworkNames.ethereumMainnet]: '',
  [NetworkNames.ethereumGoerli]: '🌲 ',
  [NetworkNames.arbitrumMainnet]: '',
  [NetworkNames.arbitrumGoerli]: '🌲 ',
  [NetworkNames.optimismMainnet]: '',
  [NetworkNames.optimismGoerli]: '🌲',
  [NetworkNames.polygonMainnet]: '',
  [NetworkNames.polygonMumbai]: '🌲',
  [NetworkNames.baseMainnet]: '',
  [NetworkNames.baseGoerli]: '🌲',
  fork: '👷‍♂️ ',
}
