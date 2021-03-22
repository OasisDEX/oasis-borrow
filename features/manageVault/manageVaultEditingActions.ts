import { BigNumber } from 'bignumber.js'
import { zero } from 'helpers/zero'

import { ManageVaultChange, ManageVaultState } from './manageVault'

export function clearDepositAndGenerate(change: (ch: ManageVaultChange) => void) {
  change({ kind: 'depositAmount', depositAmount: undefined })
  change({ kind: 'depositAmountUSD', depositAmountUSD: undefined })
  change({ kind: 'generateAmount', generateAmount: undefined })
}

export function clearPaybackAndWithdraw(change: (ch: ManageVaultChange) => void) {
  change({ kind: 'withdrawAmount', withdrawAmount: undefined })
  change({ kind: 'withdrawAmountUSD', withdrawAmountUSD: undefined })
  change({ kind: 'paybackAmount', paybackAmount: undefined })
}

export function actionDeposit(
  { stage, currentCollateralPrice }: ManageVaultState,
  change: (ch: ManageVaultChange) => void,
  depositAmount?: BigNumber,
) {
  const depositAmountUSD = depositAmount ? currentCollateralPrice.times(depositAmount) : undefined

  clearPaybackAndWithdraw(change)
  change({
    kind: 'depositAmount',
    depositAmount,
  })
  change({
    kind: 'depositAmountUSD',
    depositAmountUSD,
  })
  if (!depositAmount && stage === 'collateralEditing') {
    change({ kind: 'showDepositAndGenerateOption', showDepositAndGenerateOption: false })
    clearDepositAndGenerate(change)
  }
}

export function actionDepositUSD(
  { stage, currentCollateralPrice }: ManageVaultState,
  change: (ch: ManageVaultChange) => void,
  depositAmountUSD?: BigNumber,
) {
  const depositAmount =
    depositAmountUSD && depositAmountUSD.gt(zero)
      ? depositAmountUSD.div(currentCollateralPrice)
      : undefined

  clearPaybackAndWithdraw(change)
  change({
    kind: 'depositAmountUSD',
    depositAmountUSD,
  })
  change({
    kind: 'depositAmount',
    depositAmount,
  })
  if (!depositAmountUSD && stage === 'collateralEditing') {
    change({ kind: 'showDepositAndGenerateOption', showDepositAndGenerateOption: false })
    clearDepositAndGenerate(change)
  }
}

export function actionDepositMax(
  { maxDepositAmount, maxDepositAmountUSD }: ManageVaultState,
  change: (ch: ManageVaultChange) => void,
) {
  clearPaybackAndWithdraw(change)
  change({ kind: 'depositAmount', depositAmount: maxDepositAmount })
  change({ kind: 'depositAmountUSD', depositAmountUSD: maxDepositAmountUSD })
}

export function actionGenerate(
  { stage }: ManageVaultState,
  change: (ch: ManageVaultChange) => void,
  generateAmount?: BigNumber,
) {
  clearPaybackAndWithdraw(change)
  change({
    kind: 'generateAmount',
    generateAmount,
  })
  if (!generateAmount && stage === 'daiEditing') {
    change({ kind: 'showDepositAndGenerateOption', showDepositAndGenerateOption: false })
    clearDepositAndGenerate(change)
  }
}
export function actionGenerateMax(
  { maxGenerateAmount }: ManageVaultState,
  change: (ch: ManageVaultChange) => void,
) {
  clearPaybackAndWithdraw(change)
  change({ kind: 'generateAmount', generateAmount: maxGenerateAmount })
}

export function actionWithdraw(
  { stage, currentCollateralPrice }: ManageVaultState,
  change: (ch: ManageVaultChange) => void,
  withdrawAmount?: BigNumber,
) {
  const withdrawAmountUSD = withdrawAmount
    ? currentCollateralPrice.times(withdrawAmount)
    : undefined

  clearDepositAndGenerate(change)
  change({
    kind: 'withdrawAmount',
    withdrawAmount,
  })
  change({
    kind: 'withdrawAmountUSD',
    withdrawAmountUSD,
  })
  if (!withdrawAmount && stage === 'collateralEditing') {
    change({ kind: 'showPaybackAndWithdrawOption', showPaybackAndWithdrawOption: false })
    clearPaybackAndWithdraw!(change)
  }
}

export function actionWithdrawUSD(
  { stage, currentCollateralPrice }: ManageVaultState,
  change: (ch: ManageVaultChange) => void,
  withdrawAmountUSD?: BigNumber,
) {
  const withdrawAmount =
    withdrawAmountUSD && withdrawAmountUSD.gt(zero)
      ? withdrawAmountUSD.div(currentCollateralPrice)
      : undefined

  clearDepositAndGenerate(change)
  change({
    kind: 'withdrawAmountUSD',
    withdrawAmountUSD,
  })
  change({
    kind: 'withdrawAmount',
    withdrawAmount,
  })
  if (!withdrawAmountUSD && stage === 'collateralEditing') {
    change({ kind: 'showPaybackAndWithdrawOption', showPaybackAndWithdrawOption: false })
    clearPaybackAndWithdraw(change)
  }
}

export function actionWithdrawMax(
  { maxWithdrawAmount, maxWithdrawAmountUSD }: ManageVaultState,
  change: (ch: ManageVaultChange) => void,
) {
  clearDepositAndGenerate(change)
  change({ kind: 'withdrawAmount', withdrawAmount: maxWithdrawAmount })
  change({ kind: 'withdrawAmountUSD', withdrawAmountUSD: maxWithdrawAmountUSD })
}

export function actionPayback(
  { stage }: ManageVaultState,
  change: (ch: ManageVaultChange) => void,
  paybackAmount?: BigNumber,
) {
  clearDepositAndGenerate(change)
  change({
    kind: 'paybackAmount',
    paybackAmount,
  })
  if (!paybackAmount && stage === 'daiEditing') {
    change({ kind: 'showPaybackAndWithdrawOption', showPaybackAndWithdrawOption: false })
    clearPaybackAndWithdraw(change)
  }
}

export function actionPaybackMax(
  { maxPaybackAmount }: ManageVaultState,
  change: (ch: ManageVaultChange) => void,
) {
  clearDepositAndGenerate(change)
  change({ kind: 'paybackAmount', paybackAmount: maxPaybackAmount })
}
