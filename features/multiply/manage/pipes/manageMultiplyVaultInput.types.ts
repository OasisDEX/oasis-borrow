import type { BigNumber } from 'bignumber.js'

interface DepositAmountChange {
  kind: 'depositAmount'
  depositAmount?: BigNumber
}
interface DepositDaiAmountChange {
  kind: 'depositDaiAmount'
  depositDaiAmount?: BigNumber
}
interface DepositAmountUSDChange {
  kind: 'depositAmountUSD'
  depositAmountUSD?: BigNumber
}
interface DepositAmountMaxChange {
  kind: 'depositAmountMax'
}
interface DepositDaiAmountMaxChange {
  kind: 'depositDaiAmountMax'
}
interface paybackAmountChange {
  kind: 'paybackAmount'
  paybackAmount?: BigNumber
}
interface PaybackAmountMaxChange {
  kind: 'paybackAmountMax'
}
interface WithdrawAmountChange {
  kind: 'withdrawAmount'
  withdrawAmount?: BigNumber
}
interface WithdrawAmountUSDChange {
  kind: 'withdrawAmountUSD'
  withdrawAmountUSD?: BigNumber
}
interface WithdrawAmountMaxChange {
  kind: 'withdrawAmountMax'
}
interface GenerateAmountChange {
  kind: 'generateAmount'
  generateAmount?: BigNumber
}
interface GenerateAmountMaxChange {
  kind: 'generateAmountMax'
}
interface RequiredCollRatioChange {
  kind: 'requiredCollRatio'
  requiredCollRatio?: BigNumber
}
interface BuyChange {
  kind: 'buyAmount'
  buyAmount?: BigNumber
}
interface BuyUSDChange {
  kind: 'buyAmountUSD'
  buyAmountUSD?: BigNumber
}
interface BuyMaxChange {
  kind: 'buyMax'
}
interface SellChange {
  kind: 'sellAmount'
  sellAmount?: BigNumber
}
interface SellUSDChange {
  kind: 'sellAmountUSD'
  sellAmountUSD?: BigNumber
}
interface SellMaxChange {
  kind: 'sellMax'
}

export type ManageVaultInputChange =
  | DepositAmountChange
  | DepositDaiAmountChange
  | DepositAmountUSDChange
  | DepositAmountMaxChange
  | DepositDaiAmountMaxChange
  | paybackAmountChange
  | PaybackAmountMaxChange
  | WithdrawAmountChange
  | WithdrawAmountUSDChange
  | WithdrawAmountMaxChange
  | GenerateAmountChange
  | GenerateAmountMaxChange
  | BuyChange
  | BuyUSDChange
  | BuyMaxChange
  | SellChange
  | SellUSDChange
  | SellMaxChange
  | RequiredCollRatioChange
