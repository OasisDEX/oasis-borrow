import type { LendingPosition, SupplyPosition } from '@oasisdex/dma-library'
import { getOmniFormDefaultParams } from 'features/omni-kit/helpers'
import { useOmniBorrowFormReducto } from 'features/omni-kit/state/borrow'
import { useOmniEarnFormReducto } from 'features/omni-kit/state/earn'
import { useOmniMultiplyFormReducto } from 'features/omni-kit/state/multiply'
import type { OmniFormDefaults } from 'features/omni-kit/types'
import { OmniProductType } from 'features/omni-kit/types'

interface getOmniProductContextProviderDataParams {
  formDefaults: OmniFormDefaults
  isOpening: boolean
  positionData: unknown
  productType: OmniProductType
}

export function getOmniProductContextProviderData({
  formDefaults,
  isOpening,
  positionData,
  productType,
}: getOmniProductContextProviderDataParams) {
  const omniFormDefaultParams = getOmniFormDefaultParams({ isOpening })

  switch (productType) {
    case OmniProductType.Borrow:
      return {
        formDefaults: { ...omniFormDefaultParams.borrow, ...formDefaults.borrow },
        formReducto: useOmniBorrowFormReducto,
        position: positionData as LendingPosition,
        productType,
      }
    case OmniProductType.Earn:
      return {
        formDefaults: { ...omniFormDefaultParams.earn, ...formDefaults.earn },
        formReducto: useOmniEarnFormReducto,
        position: positionData as SupplyPosition,
        productType,
      }
    case OmniProductType.Multiply:
      return {
        formDefaults: { ...omniFormDefaultParams.multiply, ...formDefaults.multiply },
        formReducto: useOmniMultiplyFormReducto,
        position: positionData as LendingPosition,
        productType,
      }
  }
}
