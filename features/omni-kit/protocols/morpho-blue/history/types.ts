import type BigNumber from 'bignumber.js'
import type { PositionHistoryEvent, Trigger } from 'features/positionHistory/types'

export interface MorphoBorrowerEventsResponse {
  id: string
  kind: string
  timestamp: string
  txHash: string
  repaidAssets: string
  quoteRepaid: string
}

type MorphoLiquidationEventExtension = {
  repaidAssets: BigNumber
  quoteRepaid: BigNumber
}

type MorphoTriggerEventExension = {
  trigger?: Trigger
}

export type MorphoHistoryEvent = PositionHistoryEvent &
  MorphoLiquidationEventExtension &
  MorphoTriggerEventExension
