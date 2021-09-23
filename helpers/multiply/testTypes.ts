import BigNumber from 'bignumber.js'
import { zero } from 'helpers/zero'

interface OpenMultiplyEvent {
  kind: 'OPEN_MULTIPLY_VAULT'
  deposit: BigNumber
  bought: BigNumber
  marketPrice: BigNumber
  oraclePrice: BigNumber
  multiple: BigNumber
  debt: BigNumber
  collateralizationRatio: BigNumber
  netValue: BigNumber
  liquidationPrice: BigNumber
  oazoFee: BigNumber
  loanFee: BigNumber
  totalFee: BigNumber
  gasFee: BigNumber // in wei
}

interface IncreaseMultiplyEvent {
  kind: 'INCREASE_MULTIPLY'
  deposit: BigNumber
  bought: BigNumber
  marketPrice: BigNumber
  oraclePrice: BigNumber
  beforeMultiple: BigNumber
  multiple: BigNumber
  beforeDebt: BigNumber
  debt: BigNumber
  beforeCollateral: BigNumber
  collateral: BigNumber
  beforeCollateralizationRatio: BigNumber
  collateralizationRatio: BigNumber
  beforeNetValue: BigNumber
  netValue: BigNumber
  beforeLiquidationPrice: BigNumber
  liquidationPrice: BigNumber
  oazoFee: BigNumber
  loanFee: BigNumber
  totalFee: BigNumber
  gasFee: BigNumber // in wei
}

interface DecreaseMultiplyEvent {
  kind: 'DECREASE_MULTIPLY'
  withdrawn: BigNumber
  sold: BigNumber
  marketPrice: BigNumber
  oraclePrice: BigNumber
  beforeMultiple: BigNumber
  multiple: BigNumber
  beforeDebt: BigNumber
  debt: BigNumber
  beforeCollateral: BigNumber
  collateral: BigNumber
  beforeCollateralizationRatio: BigNumber
  collateralizationRatio: BigNumber
  beforeNetValue: BigNumber
  netValue: BigNumber
  beforeLiquidationPrice: BigNumber
  liquidationPrice: BigNumber
  oazoFee: BigNumber
  loanFee: BigNumber
  totalFee: BigNumber
  gasFee: BigNumber // in wei
}

interface CloseVaultToDaiEvent {
  kind: 'CLOSE_VAULT_TO_DAI'
  sold: BigNumber
  marketPrice: BigNumber
  oraclePrice: BigNumber
  exitDai: BigNumber
  debtBefore: BigNumber
  beforeCollateral: BigNumber
  beforeCollateralizationRatio: BigNumber
  oazoFee: BigNumber
  loanFee: BigNumber
  totalFee: BigNumber
  gasFee: BigNumber // in wei
}

interface CloseVaultToCollateralEvent {
  kind: 'CLOSE_VAULT_TO_COLLATERAL'
  sold: BigNumber
  marketPrice: BigNumber
  oraclePrice: BigNumber
  exitCollateral: BigNumber
  debtBefore: BigNumber
  beforeCollateral: BigNumber
  beforeCollateralizationRatio: BigNumber
  oazoFee: BigNumber
  loanFee: BigNumber
  totalFee: BigNumber
  gasFee: BigNumber // in wei
}

interface GenerateDAIEvent {
  kind: 'GENERATE_DAI'
  generated: BigNumber
}

export type TestEvents =
  | OpenMultiplyEvent
  | IncreaseMultiplyEvent
  | DecreaseMultiplyEvent
  | CloseVaultToDaiEvent
  | CloseVaultToCollateralEvent
  | GenerateDAIEvent
