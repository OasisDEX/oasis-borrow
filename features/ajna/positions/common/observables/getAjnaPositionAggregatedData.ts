import { AjnaEarnPosition, AjnaPosition } from '@oasisdex/dma-library'
import { NetworkIds } from 'blockchain/networks'
import { AjnaGenericPosition, AjnaProduct } from 'features/ajna/common/types'
import { AjnaUnifiedHistoryEvent } from 'features/ajna/history/ajnaUnifiedHistoryEvent'
import {
  AjnaPositionAggregatedDataAuctions,
  AjnaPositionCumulatives,
  getAjnaPositionAggregatedData,
} from 'features/ajna/positions/common/helpers/getAjnaPositionAggregatedData'
import { mapAjnaBorrowishEvents } from 'features/ajna/positions/common/helpers/mapBorrowishEvents'
import { mapAjnaEarnEvents } from 'features/ajna/positions/common/helpers/mapEarnEvents'
import { DpmPositionData } from 'features/ajna/positions/common/observables/getDpmPositionData'
import { zero } from 'helpers/zero'
import { from, Observable } from 'rxjs'
import { map, shareReplay } from 'rxjs/operators'
import { timeAgo } from 'utils'

export interface AjnaBorrowishPositionAuction {
  graceTimeRemaining: string
  isBeingLiquidated: boolean
  isDuringGraceTime: boolean
  isLiquidated: boolean
  isPartiallyLiquidated: boolean
}

export interface AjnaEarnPositionAuction {
  isBucketFrozen: boolean
  isCollateralToWithdraw: boolean
}

export type AjnaPositionAuction = AjnaBorrowishPositionAuction | AjnaEarnPositionAuction

interface AjnaPositionAggregatedDataResponse {
  auction: AjnaPositionAuction
  cumulatives: AjnaPositionCumulatives
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
  switch (product as AjnaProduct) {
    case 'borrow':
    case 'multiply': {
      if (!auctions.length) {
        return {
          graceTimeRemaining: '',
          isBeingLiquidated: false,
          isDuringGraceTime: false,
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

      const graceTimeRemaining = timeAgo({
        to: new Date(auction.endOfGracePeriod),
      })

      const isDuringGraceTime =
        auction.endOfGracePeriod - new Date().getTime() > 0 && !isEventAfterAuction
      const isBeingLiquidated = !isDuringGraceTime && auction.inLiquidation
      const isPartiallyLiquidated =
        mostRecentHistoryEvent.kind === 'AuctionSettle' &&
        ajnaBorrowishPosition.debtAmount.gt(zero) &&
        !isEventAfterAuction

      const isLiquidated =
        mostRecentHistoryEvent.kind === 'AuctionSettle' &&
        ajnaBorrowishPosition.debtAmount.isZero() &&
        !isEventAfterAuction

      return {
        graceTimeRemaining,
        isBeingLiquidated,
        isDuringGraceTime,
        isLiquidated,
        isPartiallyLiquidated,
      }
    }
    case 'earn': {
      const ajnaEarnPosition = position as AjnaEarnPosition

      const isBucketFrozen = ajnaEarnPosition.price.gt(ajnaEarnPosition.pool.highestPriceBucket)
      const isCollateralToWithdraw = ajnaEarnPosition.collateralTokenAmount.gt(zero)

      return {
        isBucketFrozen,
        isCollateralToWithdraw,
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

  return from(getAjnaPositionAggregatedData(proxy, networkId)).pipe(
    map(({ auctions, cumulatives, history }) => ({
      auction: parseAggregatedDataAuction({ auctions, dpmPositionData, history, position }),
      cumulatives,
      history: parseAggregatedDataHistory({ dpmPositionData, history }),
    })),
    shareReplay(1),
  )
}
