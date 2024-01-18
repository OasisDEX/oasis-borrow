import { NetworkIds } from 'blockchain/networks'
import { omniSidebarManageBorrowishSteps, omniSidebarSetupSteps } from 'features/omni-kit/constants'
import type { NetworkIdsWithValues, OmniProtocolSettings } from 'features/omni-kit/types'
import { OmniProductType } from 'features/omni-kit/types'

export const settings: OmniProtocolSettings = {
  rawName: 'MorphoBlue',
  supportedNetworkIds: [NetworkIds.GOERLI, NetworkIds.MAINNET],
  supportedMainnetNetworkIds: [NetworkIds.MAINNET],
  supportedProducts: [OmniProductType.Borrow, OmniProductType.Multiply],
  steps: {
    borrow: {
      setup: omniSidebarSetupSteps,
      manage: omniSidebarManageBorrowishSteps,
    },
    earn: {
      setup: [],
      manage: [],
    },
    multiply: {
      setup: omniSidebarSetupSteps,
      manage: omniSidebarManageBorrowishSteps,
    },
  },
}

export const morphoMarkets: NetworkIdsWithValues<{ [key: string]: string }> = {
  [NetworkIds.MAINNET]: {
    'WSTETH-ETH': '0xc54d7acf14de29e0e5527cabd7a576506870346a78a11a6762e2cca66322ec41',
    'WSTETH-USDC': '0xb323495f7e4148be5643a4ea4a8221eef163e4bccfdedc2a6f4696baacbc86cc',
  },
  [NetworkIds.GOERLI]: {
    'DAI-ETH': '0x3098a46de09dd8d9a8c6fa1ab7b3f943b6f13e5ea72a4e475d9e48f222bfd5a0',
    'ETH-USDC': '0x98ee9f294c961a5dbb9073c0fd2c2a6a66468f911e49baa935c0eab364499dbd',
    'USDC-ETH': '0x900d90c624f9bd1e1143059c14610bde45ff7d1746c52bf6c094d3568285b661',
    'WSTETH-ETH': '0x44f9ccdefcee6c2b8dc7bce454ea3a9dfc48ed3be1ef79ce4bc9696932b56ddd',
  },
}
