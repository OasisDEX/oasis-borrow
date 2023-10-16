import type BigNumber from 'bignumber.js'

export interface FormActionsUpdateDeposit {
  type: 'update-deposit'
  depositAmount?: BigNumber
  depositAmountUSD?: BigNumber
}
export interface FormActionsUpdateGenerate {
  type: 'update-generate'
  generateAmount?: BigNumber
  generateAmountUSD?: BigNumber
}
export interface FormActionsUpdatePayback {
  type: 'update-payback'
  paybackAmount?: BigNumber
  paybackAmountUSD?: BigNumber
}
export interface FormActionsUpdatePaybackMax {
  type: 'update-payback-max'
  paybackAmountMax: boolean
}
export interface FormActionsUpdateWithdraw {
  type: 'update-withdraw'
  withdrawAmount?: BigNumber
  withdrawAmountUSD?: BigNumber
}
export interface FormActionsUpdateDpm {
  type: 'update-dpm'
  dpmAddress: string
}
export interface FormActionsReset {
  type: 'reset'
}
export interface UpdateLoanToValue {
  type: 'update-loan-to-value'
  loanToValue: BigNumber
}
