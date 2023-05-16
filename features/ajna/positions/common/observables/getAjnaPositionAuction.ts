import { AjnaEarnPosition } from '@oasisdex/dma-library'
import { AjnaGenericPosition } from 'features/ajna/common/types'
import { DpmPositionData } from 'features/ajna/positions/common/observables/getDpmPositionData'
import { getAjnaPositionAuction } from 'features/ajna/rewards/helpers/getAjnaPositionAuction'
import { zero } from 'helpers/zero'
import { from, Observable } from 'rxjs'
import { map, shareReplay } from 'rxjs/operators'
import { timeAgo } from 'utils'

const borrowOrMultiplyDefault = {
  isDuringGraceTime: false,
  graceTimeRemaining: '',
  isBeingLiquidated: false,
  isPartiallyLiquidated: false,
  isLiquidated: false,
}

export type AjnaBorrowishPositionAuction = {
  isDuringGraceTime: boolean
  graceTimeRemaining: string
  isBeingLiquidated: boolean
  isPartiallyLiquidated: boolean
  isLiquidated: boolean
}

export type AjnaEarnPositionAuction = {
  isBucketFrozen: boolean
  isCollateralToWithdraw: boolean
}

export type AjnaPositionAuction = AjnaBorrowishPositionAuction | AjnaEarnPositionAuction

export const getAjnaPositionAuction$ = ({
  dpmPositionData: { proxy, product },
  ajnaPositionData,
}: {
  dpmPositionData: DpmPositionData
  ajnaPositionData: AjnaGenericPosition
}): Observable<AjnaPositionAuction> => {
  return from(getAjnaPositionAuction(proxy)).pipe(
    map((auctions) => {
      switch (product) {
        case 'borrow':
        case 'multiply': {
          if (!auctions.length) {
            return borrowOrMultiplyDefault
          }

          const auction = auctions[0]

          const isDuringGraceTime = auction.endOfGracePeriod - new Date().getTime() > 0

          const isPartiallyLiquidated =
            auction.collateral.gt(zero) &&
            auction.debtToCover.gt(zero) &&
            !auction.inLiquidation &&
            !!auction.endOfGracePeriod

          const isLiquidated =
            auction.debtToCover.isZero() &&
            !auction.inLiquidation &&
            !!auction.endOfGracePeriod &&
            !isPartiallyLiquidated

          const graceTimeRemaining = timeAgo({
            to: new Date(auction.endOfGracePeriod),
          })

          const isBeingLiquidated = !isDuringGraceTime && auction.inLiquidation

          return {
            isDuringGraceTime,
            graceTimeRemaining,
            isBeingLiquidated,
            isPartiallyLiquidated,
            isLiquidated,
          }
        }
        case 'earn': {
          const ajnaEarnPosition = ajnaPositionData as AjnaEarnPosition
          const isBucketFrozen = ajnaEarnPosition.price.gt(ajnaEarnPosition.pool.highestPriceBucket)

          const isCollateralToWithdraw = ajnaEarnPosition.collateralTokenAmount.gt(zero)

          return {
            isBucketFrozen,
            isCollateralToWithdraw,
          }
        }
        default:
          throw Error('Product not specified')
      }
    }),
    shareReplay(1),
  )
}
