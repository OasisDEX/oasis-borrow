import { Rewards } from 'features/ajna/common/components/AjnaRewardCard'
import { zero } from 'helpers/zero'

interface AjnaRewardsParamsState {
  rewards: Rewards
  isError: boolean
  isLoading: boolean
  refetch(): void
}

const defaultRewards = {
  tokens: zero,
  usd: zero,
}

export const useAjnaRewards = (_?: string): AjnaRewardsParamsState => {
  // Returning static object with zero rewards since we won't support rewards claiming on old-ajna
  // and user are redirected to main domain if they want to claim rewards
  return {
    rewards: defaultRewards,
    isError: false,
    isLoading: false,
    refetch: () => null,
  }
}
