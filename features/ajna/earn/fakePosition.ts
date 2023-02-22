import BigNumber from 'bignumber.js'

import { AjnaPosition } from '@oasisdex/oasis-actions/lib/packages/oasis-actions/src/helpers/ajna'

export interface AjnaEarnPosition extends Omit<AjnaPosition, 'debtAmount'> {
  price: BigNumber
}

export function ajnaPositionToAjnaEarnPosition(position: AjnaPosition): AjnaEarnPosition {
  const earnPosition = {
    ...position,
    price: new BigNumber(20000),
  }

  // @ts-ignore
  return earnPosition as AjnaEarnPosition
}
