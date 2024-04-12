import type { OmniProductType } from 'features/omni-kit/types'
import type { ProductHubProductType } from 'features/productHub/types'
import { PositionType } from 'summerfi-sdk-common'

export const omniProductTypeToSDKType = (
  vaultType: OmniProductType | ProductHubProductType | undefined,
): PositionType | undefined => {
  switch (vaultType) {
    case 'borrow':
      return PositionType.Borrow
    case 'multiply':
      return PositionType.Multiply
    default:
      return undefined
  }
}
