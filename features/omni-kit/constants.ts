import { protocols } from '@oasisdex/dma-library'
import type BigNumber from 'bignumber.js'
import { NetworkIds } from 'blockchain/networks'
import {
  ARBITRUM_DEFAULT_LIQUIDITY_PROVIDERS,
  BASE_DEFAULT_LIQUIDITY_PROVIDERS,
  ETHEREUM_MAINNET_DEFAULT_PROTOCOLS,
  OPTIMISM_DEFAULT_PROCOTOLS,
} from 'features/exchange/exchange'
import type { OmniSupportedNetworkIds } from 'features/omni-kit/types'
import { OmniProductType, OmniSidebarStep } from 'features/omni-kit/types'
import { one } from 'helpers/zero'
import type { LendingProtocol } from 'lendingProtocols'

export const omniBorrowishProducts = [OmniProductType.Borrow, OmniProductType.Multiply]

export const omniSidebarSharedSteps = [OmniSidebarStep.Dpm, OmniSidebarStep.Transaction]

export const omniSidebarSetupSteps = [OmniSidebarStep.Setup, ...omniSidebarSharedSteps]

export const omniSidebarManageSteps = [OmniSidebarStep.Manage, ...omniSidebarSharedSteps]

export const omniSidebarManageBorrowishSteps = [
  ...omniSidebarManageSteps,
  OmniSidebarStep.Transition,
]

export const omniFormExternalSteps: OmniSidebarStep[] = [OmniSidebarStep.Dpm]
export const omniFormStepsWithTransaction: OmniSidebarStep[] = [OmniSidebarStep.Transaction]

export const omniLendingPriceColors = ['#D3D4D8', '#EABE4C', '#1ECBAE']

export const paybackAllAmountAllowanceMaxMultiplier: Record<LendingProtocol, BigNumber> = {
  aavev2: one,
  aavev3: one,
  maker: one,
  morphoblue: one,
  sparkv3: one,
  ajna: one.plus(protocols.ajna.ajnaPaybackAllWithdrawAllValueOffset),
}

export const omniSwapProtocolsMap = {
  [NetworkIds.MAINNET]: ETHEREUM_MAINNET_DEFAULT_PROTOCOLS,
  [NetworkIds.BASEMAINNET]: BASE_DEFAULT_LIQUIDITY_PROVIDERS,
  [NetworkIds.OPTIMISMMAINNET]: OPTIMISM_DEFAULT_PROCOTOLS,
  [NetworkIds.ARBITRUMMAINNET]: ARBITRUM_DEFAULT_LIQUIDITY_PROVIDERS,
  [NetworkIds.GOERLI]: [],
}

export const omniSwapVersionMap: Record<OmniSupportedNetworkIds, 'v4.0' | 'v5.0'> = {
  [NetworkIds.MAINNET]: 'v4.0',
  [NetworkIds.BASEMAINNET]: 'v5.0',
  [NetworkIds.OPTIMISMMAINNET]: 'v5.0',
  [NetworkIds.ARBITRUMMAINNET]: 'v5.0',
  [NetworkIds.GOERLI]: 'v4.0', // doesn't matter
}
