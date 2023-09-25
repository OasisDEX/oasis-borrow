import type { AjnaEarnPosition, AjnaPosition } from '@oasisdex/dma-library'
import type { NetworkIds } from 'blockchain/networks'
import dayjs from 'dayjs'
import type { AjnaGenericPosition, AjnaProduct } from 'features/ajna/common/types'
import type { AjnaUnifiedHistoryEvent } from 'features/ajna/history/ajnaUnifiedHistoryEvent'
import type { AjnaPositionAggregatedDataAuctions } from 'features/ajna/positions/common/helpers/getAjnaPositionAggregatedData'
import { getAjnaPositionAggregatedData } from 'features/ajna/positions/common/helpers/getAjnaPositionAggregatedData'
import { mapAjnaBorrowishEvents } from 'features/ajna/positions/common/helpers/mapBorrowishEvents'
import { mapAjnaEarnEvents } from 'features/ajna/positions/common/helpers/mapEarnEvents'
import type { DpmPositionData } from 'features/ajna/positions/common/observables/getDpmPositionData'
import { zero } from 'helpers/zero'
import type { Observable } from 'rxjs'
import { from } from 'rxjs'
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
        auction.endOfGracePeriod - dayjs().valueOf() > 0 && !isEventAfterAuction
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
