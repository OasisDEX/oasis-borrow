import { OmniProductType } from 'features/omni-kit/types'
import { PositionType } from '@summer_fi/summerfi-sdk-common'

export const omniProductTypeToSDKType = (type: OmniProductType): PositionType => {
  switch (type) {
    case OmniProductType.Borrow:
      return PositionType.Borrow
    case OmniProductType.Multiply:
      return PositionType.Multiply
    case OmniProductType.Earn:
      return PositionType.Earn
    default:
      throw new Error(`Unknown vault type: ${type}`)
  }
}
