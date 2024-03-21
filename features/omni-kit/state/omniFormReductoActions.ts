import type BigNumber from 'bignumber.js'
import type { OmniSwapToken } from 'features/omni-kit/types'

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
export interface FormActionsUpdateGenerateMax {
  type: 'update-generate-max'
  generateAmountMax: boolean
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
export interface FormActionsUpdateWithdrawMax {
  type: 'update-withdraw-max'
  withdrawAmountMax: boolean
}
export interface FormActionsUpdateLoanToValue {
  type: 'update-loan-to-value'
  loanToValue: BigNumber
}
export interface FormActionsUpdateSwapToken {
  type: 'update-swap-token'
  pullToken?: OmniSwapToken
  returnToken?: OmniSwapToken
}
export interface FormActionsUpdateDpm {
  type: 'update-dpm'
  dpmAddress: string
}
export interface FormActionsReset {
  type: 'reset'
}
