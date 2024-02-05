import type BigNumber from 'bignumber.js'
import type { PositionHistoryEvent } from 'features/positionHistory/types'

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

export type MorphoHistoryEvent = PositionHistoryEvent & MorphoLiquidationEventExtension
