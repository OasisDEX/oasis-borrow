import { BigNumber } from 'bignumber.js'
import { BorrowPositionVM, MultiplyPositionVM } from 'components/dumb/PositionList'

export function isNullish(amount: BigNumber | undefined | null): boolean {
  return !amount || amount.isZero()
}

/**
 * Utility to check if vault has been liquidated on the front end.
 * @param position
 * @returns boolean
 */
export function checkIfVaultLiquidated(position: BorrowPositionVM | MultiplyPositionVM) {
  return (
    position.type === 'borrow' &&
    Number(position.collateralLocked.replace(/[^0-9]+/g, '')) === 0.0 &&
    position.protectionAmount &&
    Number(position.protectionAmount.replace(/[^0-9]+/g, '')) > 0
  )
}
