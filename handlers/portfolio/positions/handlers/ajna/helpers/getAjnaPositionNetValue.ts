import type { AjnaEarnPosition, AjnaPosition } from '@oasisdex/dma-library'
import type BigNumber from 'bignumber.js'
import type { AjnaGenericPosition } from 'features/omni-kit/protocols/ajna/types'
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
  if (isOracless) return 0

  switch (type) {
    case OmniProductType.Borrow:
    case OmniProductType.Multiply:
      const { collateralAmount, debtAmount } = position as AjnaPosition

      return collateralAmount.times(collateralPrice).minus(debtAmount.times(quotePrice)).toNumber()
    case OmniProductType.Earn:
      const { quoteTokenAmount } = position as AjnaEarnPosition

      return quoteTokenAmount.times(quotePrice).toNumber()
  }
}
