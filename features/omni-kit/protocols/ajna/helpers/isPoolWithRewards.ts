import { NetworkIds } from 'blockchain/networks'
import type { NetworkIdsWithArray } from 'features/omni-kit/types'

interface IsPoolWithRewardsParams {
  collateralToken: string
  networkId: NetworkIds
  quoteToken: string
}

const poolsWithRewardsEthereum = [
  'CBETH-ETH',
  'ETH-USDC',
  'RETH-DAI',
  'RETH-ETH',
  'SDAI-USDC',
  'USDC-ETH',
  'USDC-WBTC',
  'WBTC-DAI',
  'WBTC-USDC',
  'WSTETH-DAI',
  'WSTETH-ETH',
  'WSTETH-USDC',
]
const poolsWithRewardsBase = ['CBETH-ETH', 'ETH-USDC', 'WSTETH-ETH']

const poolsWithRewards: NetworkIdsWithArray<string> = {
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
