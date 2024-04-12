import type { AjnaEarnPosition } from '@oasisdex/dma-library'
import { zero } from 'helpers/zero'

export const getEarnDefaultPrice = (position: AjnaEarnPosition) => {
  return position.price.gt(zero)
    ? position.price
    : !position.pool.lowestUtilizedPriceIndex.isZero()
      ? position.pool.lowestUtilizedPrice
      : undefined
}
