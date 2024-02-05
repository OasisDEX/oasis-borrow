import BigNumber from 'bignumber.js'
import { NEGATIVE_WAD_PRECISION } from 'components/constants'
import type { AjnaBorrowerEventsResponse } from 'features/omni-kit/protocols/ajna/history/types'

export const mapAjnaAuctionResponse = (event: AjnaBorrowerEventsResponse) => ({
  id: event.id,
  settledDebt: new BigNumber(event.settledDebt).shiftedBy(NEGATIVE_WAD_PRECISION),
  debtToCover: new BigNumber(event.debtToCover).shiftedBy(NEGATIVE_WAD_PRECISION),
  collateralForLiquidation: new BigNumber(event.collateralForLiquidation).shiftedBy(
    NEGATIVE_WAD_PRECISION,
  ),
  remainingCollateral: new BigNumber(event.remainingCollateral).shiftedBy(NEGATIVE_WAD_PRECISION),
  kind: event.kind,
  timestamp: Number(event.timestamp) * 1000,
  txHash: event.txHash,
})
