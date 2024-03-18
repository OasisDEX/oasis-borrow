import { getNetworkContracts } from 'blockchain/contracts'
import { NetworkIds } from 'blockchain/networks'
import { getToken } from 'blockchain/tokensMetadata'
import { omniSidebarManageBorrowishSteps, omniSidebarSetupSteps } from 'features/omni-kit/constants'
import type { Erc4626Config } from 'features/omni-kit/protocols/erc-4626/types'
import type { OmniProtocolSettings } from 'features/omni-kit/types'
import { OmniProductType } from 'features/omni-kit/types'
import { LendingProtocol } from 'lendingProtocols'
import { keyBy } from 'lodash'

export const settings: OmniProtocolSettings = {
  rawName: {
    [NetworkIds.MAINNET]: 'erc4626',
  },
  supportedNetworkIds: [NetworkIds.MAINNET],
  supportedMainnetNetworkIds: [NetworkIds.MAINNET],
  supportedProducts: [OmniProductType.Earn],
  supportedMultiplyTokens: {
    [NetworkIds.MAINNET]: [],
  },
  steps: {
    borrow: {
      setup: [],
      manage: [],
    },
    earn: {
      setup: omniSidebarSetupSteps,
      manage: omniSidebarManageBorrowishSteps,
    },
    multiply: {
      setup: [],
      manage: [],
    },
  },
}

export const erc4626Vaults: Erc4626Config[] = [
  {
    address: '0xBEEF01735c132Ada46AA9aA4c54623cAA92A64CB',
    curator: {
      label: 'Steakhouse',
      url: 'https://www.steakhouse.financial/',
    },
    id: 'steakhouse-USDC',
    name: 'Steakhouse USDC',
    networkId: NetworkIds.MAINNET,
    pricePicker: {
      marketCap: 1000000000,
      prices: [0.5, 0.75, 1, 2],
      token: 'MORPHO',
    },
    protocol: LendingProtocol.MorphoBlue,
    rewards: [
      {
        token: 'MORPHO',
        label: 'Morpho token rewards',
      },
      {
        token: 'WSTETH',
        label: 'Lido rewards in WSTETH',
      },
    ],
    strategy: 'MetaMorpho Lending',
    token: {
      address: getNetworkContracts(NetworkIds.MAINNET).tokens.USDC.address,
      precision: getToken('USDC').precision,
      symbol: 'USDC',
    },
  },
]

export const erc4626VaultsById = keyBy(erc4626Vaults, 'id')
export const erc4626VaultsByName = keyBy(erc4626Vaults, 'name')
