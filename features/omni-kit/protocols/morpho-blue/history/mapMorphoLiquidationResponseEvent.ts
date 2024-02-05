import BigNumber from 'bignumber.js'
import { NEGATIVE_WAD_PRECISION } from 'components/constants'
import type { MorphoBorrowerEventsResponse } from 'features/omni-kit/protocols/morpho-blue/history/types'

export const mapMorphoLiquidationResponseEvent = (event: MorphoBorrowerEventsResponse) => ({
  id: event.id,
  repaidAssets: new BigNumber(event.repaidAssets).shiftedBy(NEGATIVE_WAD_PRECISION),
  quoteRepaid: new BigNumber(event.quoteRepaid).shiftedBy(NEGATIVE_WAD_PRECISION),
  kind: event.kind,
  timestamp: Number(event.timestamp) * 1000,
  txHash: event.txHash,
})
