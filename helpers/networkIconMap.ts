import { NetworkNames } from './networkNames'

export const networkIconMap: Record<string, string> = {
  [NetworkNames.ethereumMainnet]: '',
  [NetworkNames.ethereumHardhat]: '👷 ',
  [NetworkNames.ethereumGoerli]: '🌲 ',
  [NetworkNames.arbitrumMainnet]: '',
  [NetworkNames.arbitrumGoerli]: '🌲 ',
  [NetworkNames.avalancheMainnet]: '',
  [NetworkNames.optimismMainnet]: '',
  [NetworkNames.optimismGoerli]: '🌲',
  [NetworkNames.polygonMainnet]: '',
}
