import type { BigNumber } from 'bignumber.js'

interface DepositChange {
  kind: 'deposit'
  depositAmount?: BigNumber
}
interface DepositUSDChange {
  kind: 'depositUSD'
  depositAmountUSD?: BigNumber
}
interface DepositMaxChange {
  kind: 'depositMax'
}
interface GenerateChange {
  kind: 'generate'
  generateAmount?: BigNumber
}
interface GenerateMaxChange {
  kind: 'generateMax'
}
interface WithdrawChange {
  kind: 'withdraw'
  withdrawAmount?: BigNumber
}
interface WithdrawUSDChange {
  kind: 'withdrawUSD'
  withdrawAmountUSD?: BigNumber
}
interface WithdrawMaxChange {
  kind: 'withdrawMax'
}
interface PaybackChange {
  kind: 'payback'
  paybackAmount?: BigNumber
}
interface PaybackMaxChange {
  kind: 'paybackMax'
}

export type ManageVaultInputChange =
  | DepositChange
  | DepositUSDChange
  | DepositMaxChange
  | GenerateChange
  | GenerateMaxChange
  | WithdrawChange
  | WithdrawUSDChange
  | WithdrawMaxChange
  | PaybackChange
  | PaybackMaxChange
