import BigNumber from 'bignumber.js'
import {
  AjnaUnifiedHistoryEvent,
  ajnaUnifiedHistoryItem,
} from 'features/ajna/common/ajnaUnifiedHistoryEvent'
import { mapAjnaAuctionResponse } from 'features/positionHistory/mapAjnaAuctionResponse'
import { mapPositionHistoryResponseEvent } from 'features/positionHistory/mapPositionHistoryResponseEvent'
import { PositionHistoryEvent, PositionHistoryResponse } from 'features/positionHistory/types'
import { loadSubgraph } from 'features/subgraphLoader/useSubgraphLoader'

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

type GetAjnaHistory = (dpmProxyAddress: string) => Promise<AjnaUnifiedHistoryEvent[]>

export const getAjnaHistory: GetAjnaHistory = async (dpmProxyAddress: string) => {
  const { response } = await loadSubgraph('Ajna', 'getHistory', {
    dpmProxyAddress: dpmProxyAddress.toLowerCase(),
  })

  if (response && 'oasisEvents' in response && 'borrowerEvents' in response) {
    return [
      ...response.oasisEvents.map((event) => ({
        ...ajnaUnifiedHistoryItem,
        originationFee: new BigNumber(event.originationFee),
        originationFeeInQuoteToken: new BigNumber(event.originationFeeInQuoteToken),
        ...mapPositionHistoryResponseEvent(event),
      })),
      ...response.borrowerEvents
        .filter((item) => item.auction && (item.kind === 'AuctionSettle' || item.kind === 'Kick'))
        .map((item) => ({ ...ajnaUnifiedHistoryItem, ...mapAjnaAuctionResponse(item) })),
    ].sort((a, b) => b.timestamp - a.timestamp)
  }

  throw new Error('No history data found')
}

// TODO to be removed when implementing aave history, dummy aave history interface
export interface AaveHistoryEvent extends PositionHistoryEvent {
  aaveStuff: BigNumber
}
