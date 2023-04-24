import { AjnaEarnPosition } from '@oasisdex/oasis-actions-poc'
import { zero } from 'helpers/zero'

export const getEarnDefaultPrice = (position: AjnaEarnPosition) => {
  return position.price.gt(zero) ? position.price : position.pool.lowestUtilizedPrice
}
