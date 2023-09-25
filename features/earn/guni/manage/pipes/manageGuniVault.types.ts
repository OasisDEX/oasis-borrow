import type { BigNumber } from 'bignumber.js'
import type { MakerOracleTokenPrice } from 'features/earn/makerOracleTokenPrices'
import type { ManageMultiplyVaultState } from 'features/multiply/manage/pipes/ManageMultiplyVaultState.types'

export type GuniTxData = {
  sharedAmount0?: BigNumber
  sharedAmount1?: BigNumber
  minToTokenAmount?: BigNumber
  toTokenAmount?: BigNumber
  fromTokenAmount?: BigNumber
  requiredDebt?: BigNumber
}

export type GuniTxDataChange = { kind: 'guniTxData' }

export type ManageEarnVaultState = ManageMultiplyVaultState & {
  totalValueLocked?: BigNumber
  earningsToDate?: BigNumber
  earningsToDateAfterFees?: BigNumber
  netAPY?: BigNumber
  makerOracleTokenPrices: {
    today: MakerOracleTokenPrice
    sevenDaysAgo: MakerOracleTokenPrice
  }
}
