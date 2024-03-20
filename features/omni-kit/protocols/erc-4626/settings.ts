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
  pullTokens: {
    [NetworkIds.MAINNET]: [
      'CBETH',
      'DAI',
      'ETH',
      'RETH',
      'STETH',
      'WBTC',
      'WSTETH',
    ],
  },
}

const steakhouseCurator = {
  label: 'Steakhouse',
  url: 'https://www.steakhouse.financial/',
  icon: '/static/img/protocol_icons/steakhouse_logo.svg',
}

const morphoRewards = {
  token: 'MORPHO',
  label: 'Morpho token rewards',
}
const wstethRewards = {
  token: 'WSTETH',
  label: 'Lido rewards in WSTETH',
}

const morphoPricePicker = {
  marketCap: 1000000000,
  prices: [0.5, 0.75, 1, 2],
  token: 'MORPHO',
}

export const erc4626Vaults: Erc4626Config[] = [
  {
    address: '0xBEEF01735c132Ada46AA9aA4c54623cAA92A64CB',
    curator: steakhouseCurator,
    id: 'steakhouse-USDC',
    name: 'Steakhouse USDC',
    networkId: NetworkIds.MAINNET,
    pricePicker: morphoPricePicker,
    protocol: LendingProtocol.MorphoBlue,
    rewards: [morphoRewards, wstethRewards],
    strategy: 'MetaMorpho Lending',
    token: {
      address: getNetworkContracts(NetworkIds.MAINNET).tokens.USDC.address,
      precision: getToken('USDC').precision,
      symbol: 'USDC',
    },
  },
  {
    address: '0xbEEF02e5E13584ab96848af90261f0C8Ee04722a',
    curator: steakhouseCurator,
    id: 'steakhouse-PYUSD',
    name: 'Steakhouse PYUSD',
    protocol: LendingProtocol.MorphoBlue,
    networkId: NetworkIds.MAINNET,
    pricePicker: morphoPricePicker,
    rewards: [morphoRewards],
    strategy: 'MetaMorpho Lending',
    token: {
      address: getNetworkContracts(NetworkIds.MAINNET).tokens.PYUSD.address,
      precision: getToken('PYUSD').precision,
      symbol: 'PYUSD',
    },
  },
  {
    address: '0xbEef047a543E45807105E51A8BBEFCc5950fcfBa',
    curator: steakhouseCurator,
    id: 'steakhouse-USDT',
    name: 'Steakhouse USDT',
    protocol: LendingProtocol.MorphoBlue,
    networkId: NetworkIds.MAINNET,
    pricePicker: morphoPricePicker,
    rewards: [morphoRewards],
    strategy: 'MetaMorpho Lending',
    token: {
      address: getNetworkContracts(NetworkIds.MAINNET).tokens.USDT.address,
      precision: getToken('USDT').precision,
      symbol: 'USDT',
    },
  },
  {
    address: '0xBEEf050ecd6a16c4e7bfFbB52Ebba7846C4b8cD4',
    curator: steakhouseCurator,
    id: 'steakhouse-ETH',
    name: 'Steakhouse ETH',
    protocol: LendingProtocol.MorphoBlue,
    networkId: NetworkIds.MAINNET,
    pricePicker: morphoPricePicker,
    rewards: [morphoRewards],
    strategy: 'MetaMorpho Lending',
    token: {
      address: getNetworkContracts(NetworkIds.MAINNET).tokens.ETH.address,
      precision: getToken('ETH').precision,
      symbol: 'ETH',
    },
  },
  {
    address: '0xbeEf094333AEdD535c130958c204E84f681FD9FA',
    curator: steakhouseCurator,
    id: 'steakhouse-WBTC',
    name: 'Steakhouse WBTC',
    protocol: LendingProtocol.MorphoBlue,
    networkId: NetworkIds.MAINNET,
    pricePicker: morphoPricePicker,
    rewards: [morphoRewards],
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
