import BigNumber from 'bignumber.js'
import { PositionHistoryEvent, PositionHistoryResponse } from 'features/positionHistory/types'

export interface AjnaHistoryResponse extends PositionHistoryResponse {
  originationFee: string
  originationFeeInQuoteToken: string
}

export interface AjnaBorrowerEventsResponse {
  id: string
  kind: string
  timestamp: string
  txHash: string
  settledDebt: string
  debtToCover: string
  collateralForLiquidation: string
  remainingCollateral: string
  auction: {
    id: string
  } | null
}

export interface AjnaHistoryEvent extends PositionHistoryEvent {
  originationFee: BigNumber
  originationFeeInQuoteToken: BigNumber
}

export type AjnaBorrowerEvent = {
  id: string
  kind: string
  timestamp: number
  txHash: string
  settledDebt: BigNumber
  debtToCover: BigNumber
  collateralForLiquidation: BigNumber
  remainingCollateral: BigNumber
  auction?: {
    id: string
  }
}

// TODO to be removed when implementing aave history, dummy aave history interface
export interface AaveHistoryEvent extends PositionHistoryEvent {
  aaveStuff: BigNumber
}
