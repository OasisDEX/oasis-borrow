import { OmniProductType } from 'features/omni-kit/types'
import type { ProductHubItem } from 'features/productHub/types'

export const getNavTokensDataPerToken = (token: string, productHubItems: ProductHubItem[]) => {
  return productHubItems
    .filter((item) => item.primaryToken === token)
    .reduce(
      (acc, curr) => {
        return {
          fee: curr.fee && acc.fee > Number(curr.fee) ? Number(curr.fee) : acc.fee,
          maxMultiple:
            acc.maxMultiple > Number(curr.maxMultiply) ? acc.maxMultiple : Number(curr.maxMultiply),
          apyPassive:
            curr.managementType === 'passive' &&
            curr.product.includes(OmniProductType.Earn) &&
            acc.apyPassive < Number(curr.weeklyNetApy)
              ? Number(curr.weeklyNetApy)
              : acc.apyPassive,
          apyActive:
            curr.managementType === 'active' &&
            curr.product.includes(OmniProductType.Earn) &&
            acc.apyActive < Number(curr.weeklyNetApy)
              ? Number(curr.weeklyNetApy)
              : acc.apyActive,
        }
      },
      { fee: 1, apyPassive: 0, apyActive: 0, maxMultiple: 0 },
    )
}
