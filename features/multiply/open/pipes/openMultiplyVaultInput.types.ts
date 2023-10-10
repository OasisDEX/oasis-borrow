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
interface RequiredCollRatioChange {
  kind: 'requiredCollRatio'
  requiredCollRatio?: BigNumber
}

export type OpenVaultInputChange =
  | DepositChange
  | DepositUSDChange
  | DepositMaxChange
  | RequiredCollRatioChange
