import type BigNumber from 'bignumber.js'
import type { PositionHistoryEvent, Trigger } from 'features/positionHistory/types'

export interface MorphoBorrowerEventsResponse {
  id: string
  kind: string
  timestamp: string
  txHash: string
  collateralDelta: string
  debtDelta: string
}

type MorphoLiquidationEventExtension = {
  collateralDelta: BigNumber
  debtDelta: BigNumber
}

type MorphoTriggerEventExension = {
  trigger?: Trigger
}

export type MorphoHistoryEvent = PositionHistoryEvent &
  MorphoLiquidationEventExtension &
  MorphoTriggerEventExension
