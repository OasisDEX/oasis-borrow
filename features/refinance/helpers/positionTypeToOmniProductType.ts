import { PositionType } from '@summer_fi/summerfi-sdk-common'
import { OmniProductType } from 'features/omni-kit/types'

export const positionTypeToOmniProductType = (vaultType: PositionType): OmniProductType => {
  switch (vaultType) {
    case PositionType.Borrow:
      return OmniProductType.Borrow
    case PositionType.Multiply:
      return OmniProductType.Multiply
    default:
      throw new Error(`Unknown vault type: ${vaultType}`)
  }
}
