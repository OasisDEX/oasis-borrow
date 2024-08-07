import { LendingPositionType } from '@summer_fi/summerfi-sdk-common'
import { OmniProductType } from 'features/omni-kit/types'

export const positionTypeToOmniProductType = (vaultType: LendingPositionType): OmniProductType => {
  switch (vaultType) {
    case LendingPositionType.Borrow:
      return OmniProductType.Borrow
    case LendingPositionType.Multiply:
      return OmniProductType.Multiply
    default:
      throw new Error(`Unknown vault type: ${vaultType}`)
  }
}
