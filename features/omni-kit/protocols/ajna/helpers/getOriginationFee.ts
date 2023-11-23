import type { AjnaPosition } from '@oasisdex/dma-library'
import BigNumber from 'bignumber.js'
import { zero } from 'helpers/zero'

export function getOriginationFee(position: AjnaPosition, simulation?: AjnaPosition) {
  return simulation
    ? position.originationFee(BigNumber.max(zero, simulation.debtAmount.minus(position.debtAmount)))
    : zero
}
