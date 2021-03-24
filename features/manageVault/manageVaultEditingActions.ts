import { BigNumber } from 'bignumber.js'
import { zero } from 'helpers/zero'

import { ManageVaultChange, ManageVaultState } from './manageVault'

export const depositAndGenerateAmountDefaults: Partial<ManageVaultState> = {
  depositAmount: undefined,
  depositAmountUSD: undefined,
  generateAmount: undefined,
}

export const paybackAndWithdrawAmountDefaults: Partial<ManageVaultState> = {
  withdrawAmount: undefined,
  withdrawAmountUSD: undefined,
  paybackAmount: undefined,
}

export function actionDeposit(
  { stage, currentCollateralPrice }: ManageVaultState,
  change: (ch: ManageVaultChange) => void,
  depositAmount?: BigNumber,
) {
  const depositAmountUSD = depositAmount ? currentCollateralPrice.times(depositAmount) : undefined

  change({
    depositAmount,
    depositAmountUSD,
    ...paybackAndWithdrawAmountDefaults,
    ...(!depositAmount &&
      stage === 'collateralEditing' && {
        showDepositAndGenerateOption: false,
        generateAmount: undefined,
      }),
  })
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

  change({
    depositAmountUSD,
    depositAmount,
    ...paybackAndWithdrawAmountDefaults,
    ...(!depositAmountUSD &&
      stage === 'collateralEditing' && {
        showDepositAndGenerateOption: false,
        generateAmount: undefined,
      }),
  })
}

export function actionDepositMax(
  { maxDepositAmount, maxDepositAmountUSD }: ManageVaultState,
  change: (ch: ManageVaultChange) => void,
) {
  change({
    depositAmount: maxDepositAmount,
    depositAmountUSD: maxDepositAmountUSD,
    ...paybackAndWithdrawAmountDefaults,
  })
}

export function actionGenerate(
  { stage }: ManageVaultState,
  change: (ch: ManageVaultChange) => void,
  generateAmount?: BigNumber,
) {
  change({
    generateAmount,
    ...paybackAndWithdrawAmountDefaults,
    ...(!generateAmount &&
      stage === 'daiEditing' && {
        showDepositAndGenerateOption: false,
        depositAmount: undefined,
        depositAmountUSD: undefined,
      }),
  })
}

export function actionGenerateMax(
  { maxGenerateAmount }: ManageVaultState,
  change: (ch: ManageVaultChange) => void,
) {
  change({ generateAmount: maxGenerateAmount, ...paybackAndWithdrawAmountDefaults })
}

export function actionWithdraw(
  { stage, currentCollateralPrice }: ManageVaultState,
  change: (ch: ManageVaultChange) => void,
  withdrawAmount?: BigNumber,
) {
  const withdrawAmountUSD = withdrawAmount
    ? currentCollateralPrice.times(withdrawAmount)
    : undefined

  change({
    withdrawAmount,
    withdrawAmountUSD,
    ...depositAndGenerateAmountDefaults,
    ...(!withdrawAmount &&
      stage === 'collateralEditing' && {
        showPaybackAndWithdrawOption: false,
        paybackAmount: undefined,
      }),
  })
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

  change({
    withdrawAmountUSD,
    withdrawAmount,
    ...depositAndGenerateAmountDefaults,
    ...(!withdrawAmount &&
      stage === 'collateralEditing' && {
        showPaybackAndWithdrawOption: false,
        paybackAmount: undefined,
      }),
  })
}

export function actionWithdrawMax(
  { maxWithdrawAmount, maxWithdrawAmountUSD }: ManageVaultState,
  change: (ch: ManageVaultChange) => void,
) {
  change({
    withdrawAmount: maxWithdrawAmount,
    withdrawAmountUSD: maxWithdrawAmountUSD,
    ...depositAndGenerateAmountDefaults,
  })
}

export function actionPayback(
  { stage }: ManageVaultState,
  change: (ch: ManageVaultChange) => void,
  paybackAmount?: BigNumber,
) {
  change({
    paybackAmount,
    ...depositAndGenerateAmountDefaults,
    ...(!paybackAmount &&
      stage === 'daiEditing' && {
        showPaybackAndWithdrawOption: false,
        withdrawAmount: undefined,
        withdrawAmountUSD: undefined,
      }),
  })
}

export function actionPaybackMax(
  { maxPaybackAmount }: ManageVaultState,
  change: (ch: ManageVaultChange) => void,
) {
  change({ paybackAmount: maxPaybackAmount, ...depositAndGenerateAmountDefaults })
}
