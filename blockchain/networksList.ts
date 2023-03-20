import arbitrumMainnetIcon from 'public/static/img/network_icons/arbitrum_mainnet.svg'
import avalancheMainnetIcon from 'public/static/img/network_icons/avalanche_mainnet.svg'
import ethereumMainnetIcon from 'public/static/img/network_icons/ethereum_mainnet.svg'
import optimismMainnetIcon from 'public/static/img/network_icons/optimism_mainnet.svg'
import polygonMainnetIcon from 'public/static/img/network_icons/polygon_mainnet.svg'

export type NetworkNameType = keyof typeof networksList

// This is used as a list (filtered by isTestnet) for the network switcher
export const networksList = {
  ethereumMainnet: {
    displayName: 'Ethereum',
    icon: ethereumMainnetIcon as string,
    isTestnet: false,
    enabled: true,
  },
  ethereumHardhat: {
    displayName: 'Ethereum Hardhat',
    icon: ethereumMainnetIcon as string,
    isTestnet: true,
    enabled: true,
  },
  ethereumGoerli: {
    displayName: 'Ethereum Goerli',
    icon: ethereumMainnetIcon as string,
    isTestnet: true,
    enabled: true,
  },
  arbitrumMainnet: {
    displayName: 'Arbitrum',
    icon: arbitrumMainnetIcon as string,
    isTestnet: false,
    enabled: true,
  },
  arbitrumGoerli: {
    displayName: 'Arbitrum Goerli',
    icon: arbitrumMainnetIcon as string,
    isTestnet: true,
    enabled: true,
  },
  avalancheMainnet: {
    displayName: 'Avalanche',
    icon: avalancheMainnetIcon as string,
    isTestnet: false,
    enabled: true,
  },
  optimismMainnet: {
    displayName: 'Optimism',
    icon: optimismMainnetIcon as string,
    isTestnet: false,
    enabled: true,
  },
  polygonMainnet: {
    displayName: 'Polygon',
    icon: polygonMainnetIcon as string,
    isTestnet: false,
    enabled: true,
  },
}
