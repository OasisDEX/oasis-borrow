import type { AjnaPosition } from '@oasisdex/dma-library'
import type BigNumber from 'bignumber.js'
import type { AjnaGenericPosition } from 'features/ajna/common/types'
import { OmniProductType } from 'features/omni-kit/types'

interface GetAjnaPositionNetValueParams {
  collateralPrice: BigNumber
  isOracless: boolean
  position: AjnaGenericPosition
  quotePrice: BigNumber
  type: OmniProductType
}

export function getAjnaPositionNetValue({
  collateralPrice,
  isOracless,
  position,
  quotePrice,
  type,
}: GetAjnaPositionNetValueParams): number {
  switch (type) {
    case OmniProductType.Borrow:
    case OmniProductType.Multiply:
      const { collateralAmount, debtAmount } = position as AjnaPosition

      return isOracless
        ? 0
        : collateralAmount.times(collateralPrice).minus(debtAmount.times(quotePrice)).toNumber()
    case OmniProductType.Earn:
      return 0
  }
}
