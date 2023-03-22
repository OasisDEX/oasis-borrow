import { AjnaPosition } from '@oasisdex/oasis-actions-poc'
import BigNumber from 'bignumber.js'

interface getAjnaBorrowPaybackMaxParams {
  balance: BigNumber
  digits: number
  position: AjnaPosition
}

export function getAjnaBorrowPaybackMax({
  balance,
  digits,
  position: { debtAmount },
}: getAjnaBorrowPaybackMaxParams) {
  return BigNumber.min(debtAmount, balance).decimalPlaces(digits, BigNumber.ROUND_UP)
}
