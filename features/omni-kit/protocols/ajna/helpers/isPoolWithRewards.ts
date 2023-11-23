import { AJNA_POOLS_WITH_REWARDS } from 'features/omni-kit/protocols/ajna/constants'

interface IsPoolWithRewardsParams {
  collateralToken: string
  quoteToken: string
}

export function isPoolWithRewards({
  collateralToken,
  quoteToken,
}: IsPoolWithRewardsParams): boolean {
  return AJNA_POOLS_WITH_REWARDS.includes(`${collateralToken}-${quoteToken}`)
}
