import type BigNumber from 'bignumber.js'
import type { PositionHistoryEvent, Trigger } from 'features/positionHistory/types'

export interface MakerBorrowerEventsResponse {
  id: string
  kind: string
  timestamp: string
  txHash: string
  collateralDelta: string
  debtDelta: string
}

type MakerLiquidationEventExtension = {
  collateralDelta: BigNumber
  debtDelta: BigNumber
}

type MakerTriggerEventExtension = {
  trigger?: Trigger
}

export type MakerHistoryEvent = PositionHistoryEvent &
  MakerLiquidationEventExtension &
  MakerTriggerEventExtension
