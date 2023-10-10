import type BigNumber from 'bignumber.js'

export interface AjnaFormActionsUpdateDeposit {
  type: 'update-deposit'
  depositAmount?: BigNumber
  depositAmountUSD?: BigNumber
}
export interface AjnaFormActionsUpdateGenerate {
  type: 'update-generate'
  generateAmount?: BigNumber
  generateAmountUSD?: BigNumber
}
export interface AjnaFormActionsUpdatePayback {
  type: 'update-payback'
  paybackAmount?: BigNumber
  paybackAmountUSD?: BigNumber
}
export interface AjnaFormActionsUpdatePaybackMax {
  type: 'update-payback-max'
  paybackAmountMax: boolean
}
export interface AjnaFormActionsUpdateWithdraw {
  type: 'update-withdraw'
  withdrawAmount?: BigNumber
  withdrawAmountUSD?: BigNumber
}
export interface AjnaFormActionsUpdateDpm {
  type: 'update-dpm'
  dpmAddress: string
}
export interface AjnaFormActionsReset {
  type: 'reset'
}
export interface AjnaUpdateLoanToValue {
  type: 'update-loan-to-value'
  loanToValue: BigNumber
}
