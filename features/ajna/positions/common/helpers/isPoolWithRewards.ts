const POOLS_WITH_REWARDS = [
  'CBETH-ETH',
  'ETH-USDC',
  'RETH-DAI',
  'RETH-ETH',
  'USDC-ETH',
  'USDC-WBTC',
  'WBTC-DAI',
  'WBTC-USDC',
  'WSTETH-DAI',
  'WSTETH-ETH',
  'WSTETH-USDC',
]

interface isPoolWithRewardsParams {
  collateralToken: string
  quoteToken: string
}

export function isPoolWithRewards({
  collateralToken,
  quoteToken,
}: isPoolWithRewardsParams): boolean {
  return POOLS_WITH_REWARDS.includes(`${collateralToken}-${quoteToken}`)
}
