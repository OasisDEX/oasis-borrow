import type { AjnaEarnPosition, AjnaPosition } from '@oasisdex/dma-library'
import type { NetworkIds } from 'blockchain/networks'
import type { DpmPositionData } from 'features/omni-kit/observables'
import {
  type AjnaPositionAggregatedDataAuctions,
  getAjnaPositionAggregatedData,
} from 'features/omni-kit/protocols/ajna/helpers'
import {
  type AjnaUnifiedHistoryEvent,
  mapAjnaBorrowishEvents,
  mapAjnaEarnEvents,
} from 'features/omni-kit/protocols/ajna/history'
import type { AjnaGenericPosition } from 'features/omni-kit/protocols/ajna/types'
import { OmniProductType } from 'features/omni-kit/types'
import { zero } from 'helpers/zero'
import type { Observable } from 'rxjs'
import { from } from 'rxjs'
import { map, shareReplay } from 'rxjs/operators'

export interface AjnaBorrowishPositionAuction {
  isBeingLiquidated: boolean
  isLiquidated: boolean
  isPartiallyLiquidated: boolean
}

export interface AjnaEarnPositionAuction {
  isBucketFrozen: boolean
  isCollateralToWithdraw: boolean
}

export type AjnaPositionAuction = AjnaBorrowishPositionAuction | AjnaEarnPositionAuction

export interface AjnaPositionAggregatedDataResponse {
  auction: AjnaPositionAuction
  history: AjnaUnifiedHistoryEvent[]
}

function parseAggregatedDataAuction({
  auctions,
  dpmPositionData: { product },
  history,
  position,
}: {
  auctions: AjnaPositionAggregatedDataAuctions[]
  dpmPositionData: DpmPositionData
  history: AjnaUnifiedHistoryEvent[]
  position: AjnaGenericPosition
}): AjnaPositionAuction {
  switch (product as OmniProductType) {
    case OmniProductType.Borrow:
    case OmniProductType.Multiply: {
      if (!auctions.length) {
        return {
          isBeingLiquidated: false,
          isLiquidated: false,
          isPartiallyLiquidated: false,
        }
      }

      const ajnaBorrowishPosition = position as AjnaPosition

      const auction = auctions[0]
      const borrowishEvents = mapAjnaBorrowishEvents(history)

      const mostRecentHistoryEvent = borrowishEvents[0]
      const isEventAfterAuction = !['AuctionSettle', 'Kick'].includes(
        mostRecentHistoryEvent.kind as string,
      )

      const isBeingLiquidated = auction.inLiquidation
      const isPartiallyLiquidated =
        mostRecentHistoryEvent.kind === 'AuctionSettle' &&
        ajnaBorrowishPosition.debtAmount.gt(zero) &&
        !isEventAfterAuction

      const isLiquidated =
        mostRecentHistoryEvent.kind === 'AuctionSettle' &&
        ajnaBorrowishPosition.debtAmount.isZero() &&
        !isEventAfterAuction

      return {
        isBeingLiquidated,
        isLiquidated,
        isPartiallyLiquidated,
      }
    }
    case OmniProductType.Earn: {
      const ajnaEarnPosition = position as AjnaEarnPosition

      return {
        isBucketFrozen: ajnaEarnPosition.isBucketFrozen,
        isCollateralToWithdraw: ajnaEarnPosition.collateralTokenAmount.gt(zero),
      }
    }
  }
}

function parseAggregatedDataHistory({
  dpmPositionData: { product },
  history,
}: {
  dpmPositionData: DpmPositionData
  history: AjnaUnifiedHistoryEvent[]
}): AjnaUnifiedHistoryEvent[] {
  return (
    product === 'earn' ? mapAjnaEarnEvents(history) : mapAjnaBorrowishEvents(history)
  ) as AjnaUnifiedHistoryEvent[]
}

export const getAjnaPositionAggregatedData$ = ({
  dpmPositionData,
  position,
  networkId,
}: {
  dpmPositionData: DpmPositionData
  position: AjnaGenericPosition
  networkId: NetworkIds
}): Observable<AjnaPositionAggregatedDataResponse> => {
  const { proxy } = dpmPositionData

  return from(
    getAjnaPositionAggregatedData(
      proxy,
      networkId,
      dpmPositionData.collateralTokenAddress,
      dpmPositionData.quoteTokenAddress,
    ),
  ).pipe(
    map(({ auctions, history }) => ({
      auction: parseAggregatedDataAuction({ auctions, dpmPositionData, history, position }),
      history: parseAggregatedDataHistory({ dpmPositionData, history }),
    })),
    shareReplay(1),
  )
}
