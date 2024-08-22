import BigNumber from 'bignumber.js'
import type { MorphoBorrowerEventsResponse } from 'features/omni-kit/protocols/morpho-blue/history/types'

export const mapMakerLiquidationResponseEvent = (event: MorphoBorrowerEventsResponse) => ({
  id: event.id,
  collateralDelta: new BigNumber(event.collateralDelta).absoluteValue(),
  debtDelta: new BigNumber(event.debtDelta).absoluteValue(),
  kind: event.kind,
  timestamp: Number(event.timestamp) * 1000,
  txHash: event.txHash,
})
