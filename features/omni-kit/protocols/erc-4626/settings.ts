import BigNumber from 'bignumber.js'
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
    [NetworkIds.MAINNET]: 'erc-4626',
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

const erc4626Vaults: Erc4626Config[] = [
  {
    address: '0xBEEF01735c132Ada46AA9aA4c54623cAA92A64CB',
    curator: {
      label: 'Steakhouse',
      url: 'https://www.steakhouse.financial/',
    },
    id: 'steakhouse-USDC',
    name: 'Steakhouse USDC',
    networkId: NetworkIds.MAINNET,
    protocol: LendingProtocol.MorphoBlue,
    token: {
      address: getNetworkContracts(NetworkIds.MAINNET).tokens.USDC.address,
      precision: getToken('USDC').precision,
      symbol: 'USDC',
    },
  },
]

export const erc4626VaultsById = keyBy(erc4626Vaults, 'id')
export const erc4626VaultsByName = keyBy(erc4626Vaults, 'name')

export const erc4626EstimatedMarketCaps = [
  new BigNumber(500000000),
  new BigNumber(750000000),
  new BigNumber(1000000000),
  new BigNumber(2000000000),
]
