import { getNetworkContracts } from 'blockchain/contracts'
import { NetworkIds } from 'blockchain/networks'
import { getToken } from 'blockchain/tokensMetadata'
import { omniSidebarManageBorrowishSteps, omniSidebarSetupSteps } from 'features/omni-kit/constants'
import { type Erc4626Config, Erc4626RewardsType } from 'features/omni-kit/protocols/erc-4626/types'
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
      'ETH',
      'DAI',
      'USDT',
      'USDC',
      'PYUSD',
      'FRAX',
      'LUSD',
      'GUSD',
      'CRVUSD',
      'SDAI',
      'SUSDE',
      'USDE',
      'AETHSDAI',
      'AETHUSDC',
      'AETHUSDT',
      'AETHDAI',
      'AETHPYUSD',
      'AETHLUSD',
      'AUSDC',
      'ADAI',
      'AUSDT',
      'CUSDCV3',
      'CDAI',
      'CUSDC',
      'WSTETH',
      'RETH',
      'CBETH',
      'STETH',
      'AETHWSTETH',
      'AETHWETH',
      'AETHRETH',
      'AETHCBETH',
      'AWETH',
      'CETH',
      'CWETHV3',
    ],
  },
  availableAutomations: {
    [NetworkIds.MAINNET]: [],
  },
}

const steakhouseCurator = {
  label: 'Steakhouse',
  url: 'https://www.steakhouse.financial/',
  icon: '/static/img/protocol_icons/steakhouse_logo.svg',
}

const blockAnaliticaBProtocolCurator = {
  label: 'Block Analitica / B.Protocol',
  url: 'https://morpho.blockanalitica.com/',
  icon: '/static/img/block-analitica-b-protocol.svg',
}

export const morphoRewards = {
  token: 'MORPHO',
  label: 'Morpho token rewards',
}
export const legacyMorphoRewards = {
  token: 'MORPHO_LEGACY',
  label: 'Legacy Morpho token rewards',
}
export const wstethRewards = {
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
    rewards: [morphoRewards, wstethRewards, legacyMorphoRewards],
    rewardsType: Erc4626RewardsType.MetaMorpho,
    strategy: 'Steakhouse MetaMorpho Vault',
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
    rewards: [morphoRewards, legacyMorphoRewards],
    rewardsType: Erc4626RewardsType.MetaMorpho,
    strategy: 'Steakhouse MetaMorpho Vault',
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
    rewards: [morphoRewards, legacyMorphoRewards],
    rewardsType: Erc4626RewardsType.MetaMorpho,
    strategy: 'Steakhouse MetaMorpho Vault',
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
    rewards: [morphoRewards, legacyMorphoRewards],
    rewardsType: Erc4626RewardsType.MetaMorpho,
    strategy: 'Steakhouse MetaMorpho Vault',
    token: {
      address: getNetworkContracts(NetworkIds.MAINNET).tokens.ETH.address,
      precision: getToken('ETH').precision,
      symbol: 'ETH',
    },
  },
  {
    address: '0x38989bba00bdf8181f4082995b3deae96163ac5d',
    curator: blockAnaliticaBProtocolCurator,
    id: 'flagship-ETH',
    name: 'Flagship ETH',
    protocol: LendingProtocol.MorphoBlue,
    networkId: NetworkIds.MAINNET,
    pricePicker: morphoPricePicker,
    rewards: [morphoRewards, legacyMorphoRewards],
    rewardsType: Erc4626RewardsType.MetaMorpho,
    strategy: 'Flagship MetaMorpho Vault',
    token: {
      address: getNetworkContracts(NetworkIds.MAINNET).tokens.ETH.address,
      precision: getToken('ETH').precision,
      symbol: 'ETH',
    },
  },
  {
    address: '0x2c25f6c25770ffec5959d34b94bf898865e5d6b1',
    curator: blockAnaliticaBProtocolCurator,
    id: 'flagship-USDT',
    name: 'Flagship USDT',
    protocol: LendingProtocol.MorphoBlue,
    networkId: NetworkIds.MAINNET,
    pricePicker: morphoPricePicker,
    rewards: [morphoRewards, legacyMorphoRewards],
    rewardsType: Erc4626RewardsType.MetaMorpho,
    strategy: 'Flagship MetaMorpho Vault',
    token: {
      address: getNetworkContracts(NetworkIds.MAINNET).tokens.USDT.address,
      precision: getToken('USDT').precision,
      symbol: 'USDT',
    },
  },
  {
    address: '0x186514400e52270cef3d80e1c6f8d10a75d47344',
    curator: blockAnaliticaBProtocolCurator,
    id: 'flagship-USDC',
    name: 'Flagship USDC',
    protocol: LendingProtocol.MorphoBlue,
    networkId: NetworkIds.MAINNET,
    pricePicker: morphoPricePicker,
    rewards: [morphoRewards, legacyMorphoRewards],
    rewardsType: Erc4626RewardsType.MetaMorpho,
    strategy: 'Flagship MetaMorpho Vault',
    token: {
      address: getNetworkContracts(NetworkIds.MAINNET).tokens.USDC.address,
      precision: getToken('USDC').precision,
      symbol: 'USDC',
    },
  },
]

export const erc4626VaultsById = keyBy(erc4626Vaults, 'id')
export const erc4626VaultsByName = keyBy(erc4626Vaults, 'name')
