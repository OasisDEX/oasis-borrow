import type { AjnaEarnPosition, AjnaPosition } from '@oasisdex/dma-library'
import type { DpmPositionData } from 'features/omni-kit/observables'
import {
  type AjnaPositionAggregatedDataAuctions,
  getAjnaPositionAggregatedData,
} from 'features/omni-kit/protocols/ajna/helpers'
import { mapAjnaEarnEvents, mapAjnaLendingEvents } from 'features/omni-kit/protocols/ajna/history'
import type { AjnaHistoryEvent } from 'features/omni-kit/protocols/ajna/history/types'
import type { AjnaGenericPosition } from 'features/omni-kit/protocols/ajna/types'
import type { OmniSupportedNetworkIds } from 'features/omni-kit/types'
import { OmniProductType } from 'features/omni-kit/types'
import { zero } from 'helpers/zero'
import type { Observable } from 'rxjs'
import { from } from 'rxjs'
import { map, shareReplay } from 'rxjs/operators'

export interface AjnaBorrowishPositionAuction {
  isBeingLiquidated: boolean
  isLiquidated: boolean
}

export interface AjnaEarnPositionAuction {
  isBucketFrozen: boolean
  isCollateralToWithdraw: boolean
}

export type AjnaPositionAuction = AjnaBorrowishPositionAuction | AjnaEarnPositionAuction

export interface AjnaPositionAggregatedDataResponse {
  auction: AjnaPositionAuction
  history: AjnaHistoryEvent[]
}

function parseAggregatedDataAuction({
  auctions,
  dpmPositionData: { product },
  history,
  position,
}: {
  auctions: AjnaPositionAggregatedDataAuctions[]
  dpmPositionData: DpmPositionData
  history: AjnaHistoryEvent[]
  position: AjnaGenericPosition
}): AjnaPositionAuction {
  switch (product as OmniProductType) {
    case OmniProductType.Borrow:
    case OmniProductType.Multiply: {
      if (!auctions.length) {
        return {
          isBeingLiquidated: false,
          isLiquidated: false,
        }
      }

      const ajnaBorrowishPosition = position as AjnaPosition

      const auction = auctions[0]
      const borrowishEvents = mapAjnaLendingEvents(history)

      const mostRecentHistoryEvent = borrowishEvents[0]
      const isEventAfterAuction = !['AuctionSettle', 'Kick'].includes(
        mostRecentHistoryEvent.kind as string,
      )

      const isBeingLiquidated = auction.inLiquidation

      const isLiquidated =
        mostRecentHistoryEvent.kind === 'AuctionSettle' &&
        ajnaBorrowishPosition.debtAmount.isZero() &&
        !isEventAfterAuction

      return {
        isBeingLiquidated,
        isLiquidated,
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
  history: AjnaHistoryEvent[]
}): AjnaHistoryEvent[] {
  return (
    product === 'earn' ? mapAjnaEarnEvents(history) : mapAjnaLendingEvents(history)
  ) as AjnaHistoryEvent[]
}

export const getAjnaPositionAggregatedData$ = ({
  dpmPositionData,
  position,
  networkId,
}: {
  dpmPositionData: DpmPositionData
  position: AjnaGenericPosition
  networkId: OmniSupportedNetworkIds
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
