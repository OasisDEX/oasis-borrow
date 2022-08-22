import { BigNumber } from 'bignumber.js'
import { BorrowPositionVM, MultiplyPositionVM } from 'components/dumb/PositionList'
import { TFunction } from 'next-i18next'

export function isNullish(amount: BigNumber | undefined | null): boolean {
  return !amount || amount.isZero()
}

/**
 * Utility to check if vault has been liquidated on the front end.
 * @param position
 * @returns boolean
 */
export function checkIfVaultEmptyAndProtectionActive(
  position: BorrowPositionVM | MultiplyPositionVM,
) {
  return (
    position.collateralLocked &&
    Number(position.collateralLocked.replace(/[^0-9]+/g, '')) === 0.0 &&
    position.protectionAmount &&
    Number(position.protectionAmount.replace(/[^0-9]+/g, '')) > 0
  )
}

export function selectSideBarTextBtnLabel(
  isConfirmation: boolean,
  isAddForm: boolean,
  t: TFunction,
) {
  if (isAddForm) return t('system.remove-trigger')
  if (isConfirmation) return t('auto-buy.edit-order-btn')
  return t('system.add-trigger')
}
