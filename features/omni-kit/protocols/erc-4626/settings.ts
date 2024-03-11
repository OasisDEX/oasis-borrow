import { NetworkIds } from 'blockchain/networks'
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
    curator: {
      label: 'Steakhouse',
      url: 'https://www.steakhouse.financial/',
    },
    id: 'steakhouse-USDC',
    name: 'Steakhouse USDC',
    protocol: LendingProtocol.MorphoBlue,
    token: 'USDC',
  },
]

export const erc4626VaultsById = keyBy(erc4626Vaults, 'id')
export const erc4626VaultsByName = keyBy(erc4626Vaults, 'name')
