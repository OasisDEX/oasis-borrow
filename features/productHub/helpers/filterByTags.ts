import { EarnStrategies } from '@prisma/client'
import { OmniProductType } from 'features/omni-kit/types'
import {
  PAIR_BLUECHIP,
  PROTOCOLS_ISOLATED_PAIRS,
  PROTOCOLS_LONGEVITY,
  PROTOCOLS_TVL_GT_1B,
  TOKENS_MEME,
  TOKENS_STABLE_GROUPS,
} from 'features/productHub/filterGroups'
import type { ProductHubItem } from 'features/productHub/types'
import { ProductHubTag, ProductHubManagementType } from 'features/productHub/types'

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
        return PAIR_BLUECHIP.includes(`${primaryToken}-${secondaryToken}`)
      case ProductHubTag.EasiestToManage:
        return row.managementType === 'passive'
      case ProductHubTag.EthDerivativeYieldLoops:
        return (
          primaryTokenGroup === 'ETH' &&
          !TOKENS_STABLE_GROUPS.includes(secondaryTokenGroup) &&
          (row.product.includes(OmniProductType.Earn)
            ? row.earnStrategy === EarnStrategies.yield_loop
            : true)
        )
      case ProductHubTag.Gt1BTvl:
        return PROTOCOLS_TVL_GT_1B.includes(row.protocol)
      case ProductHubTag.IsolatedPairs:
        return PROTOCOLS_ISOLATED_PAIRS.includes(row.protocol)
      case ProductHubTag.Longevity:
        return PROTOCOLS_LONGEVITY.includes(row.protocol)
      case ProductHubTag.Memecoins:
        return TOKENS_MEME.includes(primaryToken) || TOKENS_MEME.includes(secondaryToken)
      case ProductHubTag.NonStablecoinCollateral:
        return !TOKENS_STABLE_GROUPS.includes(primaryTokenGroup)
      case ProductHubTag.Stablecoins:
        return (
          TOKENS_STABLE_GROUPS.includes(primaryTokenGroup) ||
          TOKENS_STABLE_GROUPS.includes(secondaryTokenGroup)
        )
      default:
        return true
    }
  })
}
