import type { RiskRatio } from '@oasisdex/dma-library'
import BigNumber from 'bignumber.js'
import { isShortPosition } from 'features/omni-kit/helpers'
import { OmniProductType } from 'features/omni-kit/types'
import type { ProductHubItem } from 'features/productHub/types'
import { RefinanceOptions } from 'features/refinance/types'
import { zero } from 'helpers/zero'

export const getParsedRefinanceProductTable = ({
  table,
  option,
  borrowRate,
  isShort,
  maxLtv,
}: {
  table: ProductHubItem[]
  option?: RefinanceOptions
  borrowRate: string
  isShort: boolean
  maxLtv: RiskRatio
}) => {
  switch (option) {
    case RefinanceOptions.LOWER_COST:
      return table.filter((item) => new BigNumber(item.fee || zero).lt(new BigNumber(borrowRate)))
    case RefinanceOptions.CHANGE_DIRECTION:
      return table.filter((item) =>
        isShort
          ? !isShortPosition({ collateralToken: item.primaryToken })
          : isShortPosition({ collateralToken: item.primaryToken }),
      )
    case RefinanceOptions.HIGHER_LTV:
      return table.filter((item) => new BigNumber(item.maxLtv || zero).gt(maxLtv.loanToValue))
    case RefinanceOptions.SWITCH_TO_EARN:
      // in theory not required because PH is pre-configured in this case to Earn
      return table.filter((item) => item.product.includes(OmniProductType.Earn))
    default:
      return table
  }
}
