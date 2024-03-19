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
  {
    address: '0xbEEF02e5E13584ab96848af90261f0C8Ee04722a',
    curator: {
      label: 'Steakhouse',
      url: 'https://www.steakhouse.financial/',
    },
    id: 'steakhouse-PYUSD',
    name: 'Steakhouse PYUSD',
    protocol: LendingProtocol.MorphoBlue,
    networkId: NetworkIds.MAINNET,
    pricePicker: {
      marketCap: 1000000000,
      prices: [0.5, 0.75, 1, 2],
      token: 'MORPHO',
    },
    rewards: [
      {
        token: 'MORPHO',
        label: 'Morpho token rewards',
      },
    ],
    strategy: 'MetaMorpho Lending',
    token: {
      address: getNetworkContracts(NetworkIds.MAINNET).tokens.PYUSD.address,
      precision: getToken('PYUSD').precision,
      symbol: 'PYUSD',
    },
  },
  {
    address: '0xbEef047a543E45807105E51A8BBEFCc5950fcfBa',
    curator: {
      label: 'Steakhouse',
      url: 'https://www.steakhouse.financial/',
    },
    id: 'steakhouse-USDT',
    name: 'Steakhouse USDT',
    protocol: LendingProtocol.MorphoBlue,
    networkId: NetworkIds.MAINNET,
    pricePicker: {
      marketCap: 1000000000,
      prices: [0.5, 0.75, 1, 2],
      token: 'MORPHO',
    },
    rewards: [
      {
        token: 'MORPHO',
        label: 'Morpho token rewards',
      },
    ],
    strategy: 'MetaMorpho Lending',
    token: {
      address: getNetworkContracts(NetworkIds.MAINNET).tokens.USDT.address,
      precision: getToken('USDT').precision,
      symbol: 'USDT',
    },
  },
  {
    address: '0xBEEf050ecd6a16c4e7bfFbB52Ebba7846C4b8cD4',
    curator: {
      label: 'Steakhouse',
      url: 'https://www.steakhouse.financial/',
    },
    id: 'steakhouse-ETH',
    name: 'Steakhouse ETH',
    protocol: LendingProtocol.MorphoBlue,
    networkId: NetworkIds.MAINNET,
    pricePicker: {
      marketCap: 1000000000,
      prices: [0.5, 0.75, 1, 2],
      token: 'MORPHO',
    },
    rewards: [
      {
        token: 'MORPHO',
        label: 'Morpho token rewards',
      },
    ],
    strategy: 'MetaMorpho Lending',
    token: {
      address: getNetworkContracts(NetworkIds.MAINNET).tokens.ETH.address,
      precision: getToken('ETH').precision,
      symbol: 'ETH',
    },
  },
  {
    address: '0xbeEf094333AEdD535c130958c204E84f681FD9FA',
    curator: {
      label: 'Steakhouse',
      url: 'https://www.steakhouse.financial/',
    },
    id: 'steakhouse-WBTC',
    name: 'Steakhouse WBTC',
    protocol: LendingProtocol.MorphoBlue,
    networkId: NetworkIds.MAINNET,
    pricePicker: {
      marketCap: 1000000000,
      prices: [0.5, 0.75, 1, 2],
      token: 'MORPHO',
    },
    rewards: [
      {
        token: 'MORPHO',
        label: 'Morpho token rewards',
      },
    ],
    strategy: 'MetaMorpho Lending',
    token: {
      address: getNetworkContracts(NetworkIds.MAINNET).tokens.WBTC.address,
      precision: getToken('WBTC').precision,
      symbol: 'WBTC',
    },
  },
]

export const erc4626VaultsById = keyBy(erc4626Vaults, 'id')
export const erc4626VaultsByName = keyBy(erc4626Vaults, 'name')
