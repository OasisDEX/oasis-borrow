import { LendingPositionType } from '@summer_fi/summerfi-sdk-common'
import { OmniProductType } from 'features/omni-kit/types'

export const omniProductTypeToSDKType = (type: OmniProductType): LendingPositionType => {
  switch (type) {
    case OmniProductType.Borrow:
      return LendingPositionType.Borrow
    case OmniProductType.Multiply:
      return LendingPositionType.Multiply
    case OmniProductType.Earn:
      return LendingPositionType.Earn
    default:
      throw new Error(`Unknown vault type: ${type}`)
  }
}
