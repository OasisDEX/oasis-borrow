import {
  TOKENS_WITH_RESTAKING,
  TOKENS_WITH_STAKING_REWARDS,
} from 'features/productHub/filterGroups'
import type { ProductHubItem } from 'features/productHub/types'
import { ProductHubCategory } from 'features/productHub/types'

interface FilterByCategoryParams {
  category: ProductHubCategory
  primaryToken: string
  primaryTokenGroup: string
  row: ProductHubItem
  secondaryToken: string
  secondaryTokenGroup: string
}

export function filterByCategory({ category, primaryToken, row }: FilterByCategoryParams) {
  switch (category) {
    case ProductHubCategory.All:
      return true
    case ProductHubCategory.TokenFarming:
      return row.hasRewards
    case ProductHubCategory.StakingRewards:
      return TOKENS_WITH_STAKING_REWARDS.includes(primaryToken)
    case ProductHubCategory.Restaking:
      return TOKENS_WITH_RESTAKING.includes(primaryToken)
    case ProductHubCategory.YieldLoops:
      // TODO: use method that Marcin provides
      return false
  }
}
