import type BigNumber from 'bignumber.js'
import type { PositionHistoryEvent, Trigger } from 'features/positionHistory/types'

export interface AaveHistoryEvent extends PositionHistoryEvent {
  trigger?: Trigger
}

export type AaveCumulativeData = {
  cumulativeDepositUSD: BigNumber
  cumulativeDepositInQuoteToken: BigNumber
  cumulativeDepositInCollateralToken: BigNumber
  cumulativeWithdrawUSD: BigNumber
  cumulativeWithdrawInQuoteToken: BigNumber
  cumulativeWithdrawInCollateralToken: BigNumber
  cumulativeFeesUSD: BigNumber
  cumulativeFeesInQuoteToken: BigNumber
  cumulativeFeesInCollateralToken: BigNumber
}
