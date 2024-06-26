import { EarnStrategies } from '@prisma/client'
import { OmniProductType } from 'features/omni-kit/types'
import {
  PROTOCOLS_ISOLATED_PAIRS,
  PROTOCOLS_LONGEVITY,
  PROTOCOLS_TVL_GT_1B,
  TOKENS_BLUECHIP,
  TOKENS_MEME,
  TOKENS_STABLE_GROUPS,
} from 'features/productHub/filterGroups'
import type { ProductHubItem } from 'features/productHub/types'
import { ProductHubTag } from 'features/productHub/types'

interface FilterByTagsTags {
  tags: ProductHubTag[]
  primaryToken: string
  primaryTokenGroup: string
  row: ProductHubItem
  secondaryToken: string
  secondaryTokenGroup: string
}

export function filterByTags({
  tags = [],
  primaryToken,
  primaryTokenGroup,
  row,
  secondaryToken,
  secondaryTokenGroup,
}: FilterByTagsTags) {
  return tags.every((tag) => {
    switch (tag) {
      case ProductHubTag.BluechipAssets:
        return TOKENS_BLUECHIP.includes(primaryToken) && TOKENS_BLUECHIP.includes(secondaryToken)
      case ProductHubTag.EasiestToManage:
        return row.managementType === 'passive'
      case ProductHubTag.EthDerivativeYieldLoops:
        return (
          primaryTokenGroup === 'ETH' &&
          secondaryToken === 'ETH' &&
          (row.product.includes(OmniProductType.Earn)
            ? row.earnStrategy === EarnStrategies.yield_loop
            : true)
        )
      case ProductHubTag.Gt1BTvl:
        return PROTOCOLS_TVL_GT_1B.includes(row.protocol)
      case ProductHubTag.IsolatedPairs:
        return PROTOCOLS_ISOLATED_PAIRS.includes(row.protocol)
      case ProductHubTag.Long:
        return row.multiplyStrategyType === 'long'
      case ProductHubTag.Longevity:
        return PROTOCOLS_LONGEVITY.includes(row.protocol)
      case ProductHubTag.LpOnly:
        return (
          row.earnStrategy === EarnStrategies.liquidity_provision ||
          row.earnStrategy === EarnStrategies.erc_4626
        )
      case ProductHubTag.Memecoins:
        return TOKENS_MEME.includes(primaryToken) || TOKENS_MEME.includes(secondaryToken)
      case ProductHubTag.NonStablecoinCollateral:
        return !TOKENS_STABLE_GROUPS.includes(primaryTokenGroup)
      case ProductHubTag.Short:
        return row.multiplyStrategyType === 'short'
      case ProductHubTag.StablecoinStrategies:
        return (
          TOKENS_STABLE_GROUPS.includes(primaryTokenGroup) &&
          TOKENS_STABLE_GROUPS.includes(secondaryTokenGroup)
        )
      default:
        return true
    }
  })
}
