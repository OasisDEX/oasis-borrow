import type { AjnaEarnPosition, AjnaPosition } from '@oasisdex/dma-library'
import type { AjnaGenericPosition } from 'features/omni-kit/protocols/ajna/types'
import { OmniProductType } from 'features/omni-kit/types'
import { zero } from 'helpers/zero'

interface GetAjnaPositionNetValueParams {
  isOracless: boolean
  position: AjnaGenericPosition
  type: OmniProductType
}

export function getAjnaIsOraclessAndNotEmpty({
  isOracless,
  position,
  type,
}: GetAjnaPositionNetValueParams): boolean {
  if (!isOracless) {
    return false
  }

  switch (type) {
    case OmniProductType.Borrow:
    case OmniProductType.Multiply:
      const { collateralAmount } = position as AjnaPosition

      return collateralAmount.gt(zero)
    case OmniProductType.Earn:
      const { quoteTokenAmount } = position as AjnaEarnPosition

      return quoteTokenAmount.gt(zero)
  }
}
