import BigNumber from 'bignumber.js'

interface OpenMultiplyEvent {
  kind: 'OPEN_MULTIPLY_VAULT'
  deposit: BigNumber
  bought: BigNumber
  marketPrice: BigNumber
  oraclePrice: BigNumber
  gasFee: BigNumber
}

interface IncreaseMultiplyEvent {
  kind: 'INCREASE_MULTIPLY'
  deposit: BigNumber
  bought: BigNumber
  marketPrice: BigNumber
  oraclePrice: BigNumber
  gasFee: BigNumber
}

interface DecreaseMultiplyEvent {
  kind: 'DECREASE_MULTIPLY'
  withdrawn: BigNumber
  sold: BigNumber
  marketPrice: BigNumber
  oraclePrice: BigNumber
  gasFee: BigNumber
}

interface CloseVaultToDaiEvent {
  kind: 'CLOSE_VAULT_TO_DAI'
  sold: BigNumber
  marketPrice: BigNumber
  oraclePrice: BigNumber
  exitDai: BigNumber
  gasFee: BigNumber
}

interface CloseVaultToCollateralEvent {
  kind: 'CLOSE_VAULT_TO_COLLATERAL'
  sold: BigNumber
  marketPrice: BigNumber
  oraclePrice: BigNumber
  exitCollateral: BigNumber
  gasFee: BigNumber
}

// to do account deposit generate
interface GenerateDAIEvent {
  kind: 'GENERATE_DAI'
  marketPrice: BigNumber
  generated: BigNumber
  gasFee: BigNumber
}

// to do account withdrawPayback
// add more events

export type MockedEvents =
  | OpenMultiplyEvent
  | IncreaseMultiplyEvent
  | DecreaseMultiplyEvent
  | CloseVaultToDaiEvent
  | CloseVaultToCollateralEvent
  | GenerateDAIEvent
