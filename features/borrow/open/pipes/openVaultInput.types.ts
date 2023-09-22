import type BigNumber from 'bignumber.js'

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

export type OpenVaultInputChange =
  | DepositChange
  | DepositUSDChange
  | DepositMaxChange
  | GenerateChange
  | GenerateMaxChange
