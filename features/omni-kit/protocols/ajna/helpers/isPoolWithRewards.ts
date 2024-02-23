import { NetworkIds } from 'blockchain/networks'
import type { NetworkIdsWithValues, OmniSupportedNetworkIds } from 'features/omni-kit/types'

interface IsPoolWithRewardsParams {
  collateralToken: string
  networkId: OmniSupportedNetworkIds
  quoteToken: string
}

const poolsWithRewardsEthereum = [
  'AJNA-DAI',
  'CBETH-ETH',
  'ETH-USDC',
  'RETH-DAI',
  'RETH-ETH',
  'SDAI-USDC',
  'STYETH-DAI',
  'USDC-ETH',
  'USDC-WBTC',
  'WBTC-DAI',
  'WBTC-USDC',
  'WSTETH-DAI',
  'WSTETH-ETH',
  'WSTETH-USDC',
  'YFI-DAI',
  'MKR-DAI',
  'SUSDE-DAI',
]
const poolsWithRewardsBase = ['CBETH-ETH', 'ETH-USDC', 'WSTETH-ETH']

const poolsWithRewards: NetworkIdsWithValues<string[]> = {
  [NetworkIds.MAINNET]: poolsWithRewardsEthereum,
  [NetworkIds.GOERLI]: poolsWithRewardsEthereum,
  [NetworkIds.BASEMAINNET]: poolsWithRewardsBase,
}

export function isPoolWithRewards({
  collateralToken,
  networkId,
  quoteToken,
}: IsPoolWithRewardsParams): boolean {
  return !!poolsWithRewards[networkId]?.includes(`${collateralToken}-${quoteToken}`)
}
