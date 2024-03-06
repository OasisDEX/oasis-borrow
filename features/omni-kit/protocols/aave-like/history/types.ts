import type BigNumber from 'bignumber.js'
import type { PositionHistoryEvent, Trigger } from 'features/positionHistory/types'

export interface AaveLikeHistoryEvent extends PositionHistoryEvent {
  trigger?: Trigger
}

export type AaveLikeCumulativeData = {
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
