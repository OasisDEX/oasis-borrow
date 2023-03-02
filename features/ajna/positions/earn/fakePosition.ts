import BigNumber from 'bignumber.js'

import { AjnaPosition } from '@oasis-actions-poc/lib/packages/oasis-actions/src/helpers/ajna'
import { AjnaEarn } from '@oasis-actions-poc/lib/packages/oasis-actions/src/helpers/ajna/AjnaEarn'

export function ajnaPositionToAjnaEarnPosition(position: AjnaPosition): AjnaEarn {
  const earnPosition = {
    ...position,
    price: new BigNumber(20000),
  }

  return (earnPosition as unknown) as AjnaEarn
}
