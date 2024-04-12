import { OmniProductType } from 'features/omni-kit/types'
import type { ProductHubProductType } from 'features/productHub/types'
import { PositionType } from 'summerfi-sdk-common'

export const omniProductTypeToSDKType = (
  type: OmniProductType | ProductHubProductType,
): PositionType | undefined => {
  switch (type) {
    case OmniProductType.Borrow:
      return PositionType.Borrow
    case OmniProductType.Multiply:
      return PositionType.Multiply
    default:
      return undefined
  }
}
