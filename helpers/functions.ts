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
  console.log('hello from selectSideBarTextBtnLabel')
  console.log(isConfirmation, 'isConfirmation')
  if (isAddForm && !isConfirmation) return t('system.remove-trigger')
  if (isConfirmation) return t('auto-buy.edit-order-btn')
  return t('system.add-trigger')
}

export function calculateStepNumber(
  isConfirmation: boolean,
  stage: string,
  isProgressStage: boolean,
) {
  if (isConfirmation && !isProgressStage && stage !== 'txSuccess') return '(2/3)'
  if (isProgressStage || stage === 'txSuccess') return '(3/3)'
  return '(1/3)'
}
