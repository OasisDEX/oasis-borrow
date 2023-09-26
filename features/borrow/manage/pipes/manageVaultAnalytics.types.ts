import type BigNumber from 'bignumber.js'

import type { ManageStandardBorrowVaultState } from './manageVault.types'

export type GenerateAmountChange = {
  kind: 'generateAmountChange'
  value: { amount: BigNumber; setMax: boolean }
}
export type DepositAmountChange = {
  kind: 'depositAmountChange'
  value: { amount: BigNumber; setMax: boolean }
}
export type PaybackAmountChange = {
  kind: 'paybackAmountChange'
  value: { amount: BigNumber; setMax: boolean }
}
export type WithdrawAmountChange = {
  kind: 'withdrawAmountChange'
  value: { amount: BigNumber; setMax: boolean }
}
export type AllowanceChange = {
  kind: 'collateralAllowanceChange' | 'daiAllowanceChange'
  value: {
    type:
      | Pick<ManageStandardBorrowVaultState, 'selectedDaiAllowanceRadio'>
      | Pick<ManageStandardBorrowVaultState, 'selectedCollateralAllowanceRadio'>
    amount: BigNumber
  }
}
export type ManageVaultConfirm = {
  kind: 'manageVaultConfirm'
  value: {
    ilk: string
    collateralAmount: BigNumber
    daiAmount: BigNumber
  }
}
export type ManageVaultConfirmTransaction = {
  kind: 'manageVaultConfirmTransaction'
  value: {
    ilk: string
    collateralAmount: BigNumber
    daiAmount: BigNumber
    txHash: string
  }
}
