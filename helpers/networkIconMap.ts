import { NetworkNames } from './networkNames'

// these are used for the tab title
export const networkTabTitleIconMap: Record<NetworkNames | 'hardhat', string> = {
  [NetworkNames.ethereumMainnet]: '',
  [NetworkNames.ethereumGoerli]: '🌲 ',
  [NetworkNames.arbitrumMainnet]: '',
  [NetworkNames.arbitrumGoerli]: '🌲 ',
  [NetworkNames.optimismMainnet]: '',
  [NetworkNames.optimismGoerli]: '🌲',
  [NetworkNames.polygonMainnet]: '',
  [NetworkNames.polygonMumbai]: '🌲',
  [NetworkNames.ethereumTenderly]: '👷‍♂️',
  hardhat: '👷‍♂️ ',
}
