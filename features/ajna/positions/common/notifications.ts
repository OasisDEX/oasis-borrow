import { AjnaEarnPosition } from '@oasisdex/oasis-actions-poc'
import { DetailsSectionNotificationItem } from 'components/DetailsSectionNotification'
import { AjnaGenericPosition, AjnaProduct, AjnaUpdateState } from 'features/ajna/common/types'
import {
  AjnaBorrowFormAction,
  AjnaBorrowFormState,
} from 'features/ajna/positions/borrow/state/ajnaBorrowFormReducto'
import {
  AjnaEarnFormAction,
  AjnaEarnFormState,
} from 'features/ajna/positions/earn/state/ajnaEarnFormReducto'
import {
  AjnaMultiplyFormAction,
  AjnaMultiplyFormState,
} from 'features/ajna/positions/multiply/state/ajnaMultiplyFormReducto'
import { zero } from 'helpers/zero'
import { Dispatch } from 'react'

type DepositIsNotWithdrawableParams = {
  message: { collateralToken: string; quoteToken: string }
  action: () => void
}

type EarningNoApyParams = {
  action: () => void
}

type EmptyPositionParams = {
  quoteToken: string
}

type TimeToLiquidationParams = {
  time: string
}

type NotificationCallbackWithParams<P> = (
  params: P,
  action?: () => void,
) => DetailsSectionNotificationItem

const ajnaNotifications: {
  depositIsNotWithdrawable: NotificationCallbackWithParams<DepositIsNotWithdrawableParams>
  earningNoApy: NotificationCallbackWithParams<EarningNoApyParams>
  emptyPosition: NotificationCallbackWithParams<EmptyPositionParams>
  timeToLiquidation: NotificationCallbackWithParams<TimeToLiquidationParams>
  beingLiquidated: NotificationCallbackWithParams<null>
  gotLiquidated: NotificationCallbackWithParams<null>
  gotPartiallyLiquidated: NotificationCallbackWithParams<null>
  lendingPriceFrozen: NotificationCallbackWithParams<null>
  bucketLiquidated: NotificationCallbackWithParams<null>
} = {
  depositIsNotWithdrawable: ({ action, message }) => ({
    title: {
      translationKey:
        'ajna.position-page.earn.manage.notifications.deposit-is-not-withdrawable.title',
    },
    message: {
      translationKey:
        'ajna.position-page.earn.manage.notifications.deposit-is-not-withdrawable.message',
      params: message,
    },
    icon: 'coins_cross',
    type: 'error',
    closable: true,
    link: {
      translationKey:
        'ajna.position-page.earn.manage.notifications.deposit-is-not-withdrawable.label',
      action,
    },
  }),
  earningNoApy: ({ action }) => ({
    title: {
      translationKey: 'ajna.position-page.earn.manage.notifications.earning-no-apy.title',
    },
    message: {
      translationKey: 'ajna.position-page.earn.manage.notifications.earning-no-apy.message',
    },
    icon: 'coins_cross',
    type: 'warning',
    closable: true,
    link: {
      translationKey: 'ajna.position-page.earn.manage.notifications.earning-no-apy.label',
      action,
    },
  }),
  emptyPosition: ({ quoteToken }) => ({
    title: {
      translationKey: 'ajna.position-page.earn.manage.notifications.empty-position.title',
    },
    message: {
      translationKey: 'ajna.position-page.earn.manage.notifications.empty-position.message',
      params: { quoteToken },
    },
    icon: 'coins_cross',
    type: 'warning',
    closable: true,
  }),
  timeToLiquidation: ({ time }) => ({
    title: {
      translationKey: 'ajna.position-page.common.notifications.time-to-liquidation.title',
      params: { time },
    },
    message: {
      translationKey: 'ajna.position-page.common.notifications.time-to-liquidation.message',
    },
    icon: 'coins_cross',
    type: 'warning',
    closable: true,
  }),
  beingLiquidated: () => ({
    title: {
      translationKey: 'ajna.position-page.common.notifications.being-liquidated.title',
    },
    message: {
      translationKey: 'ajna.position-page.common.notifications.being-liquidated.message',
    },
    icon: 'coins_cross',
    type: 'error',
    closable: true,
  }),
  gotLiquidated: () => ({
    title: {
      translationKey: 'ajna.position-page.common.notifications.got-liquidated.title',
    },
    message: {
      translationKey: 'ajna.position-page.common.notifications.got-liquidated.message',
    },
    icon: 'coins_cross',
    type: 'error',
    closable: true,
  }),
  gotPartiallyLiquidated: () => ({
    title: {
      translationKey: 'ajna.position-page.common.notifications.got-partially-liquidated.title',
    },
    message: {
      translationKey: 'ajna.position-page.common.notifications.got-partially-liquidated.message',
    },
    icon: 'coins_cross',
    type: 'error',
    closable: true,
  }),
  lendingPriceFrozen: () => ({
    title: {
      translationKey: 'ajna.position-page.common.notifications.got-partially-liquidated.title',
    },
    message: {
      translationKey: 'ajna.position-page.common.notifications.got-partially-liquidated.message',
    },
    icon: 'coins_cross',
    type: 'error',
    closable: true,
  }),
  bucketLiquidated: () => ({
    title: {
      translationKey: 'ajna.position-page.earn.manage.notifications.bucket-liquidated.title',
    },
    message: {
      translationKey: 'ajna.position-page.earn.manage.notifications.bucket-liquidated.message',
    },
    icon: 'coins_cross',
    type: 'error',
    closable: true,
  }),
}

export function getAjnaNotifications({
  position,
  collateralToken,
  quoteToken,
  dispatch,
  updateState,
  product,
}: {
  position: AjnaGenericPosition
  collateralToken: string
  quoteToken: string
  dispatch:
    | Dispatch<AjnaBorrowFormAction>
    | Dispatch<AjnaEarnFormAction>
    | Dispatch<AjnaMultiplyFormAction>
  updateState:
    | AjnaUpdateState<AjnaBorrowFormState>
    | AjnaUpdateState<AjnaEarnFormState>
    | AjnaUpdateState<AjnaMultiplyFormState>
  product: AjnaProduct
}) {
  const notifications: DetailsSectionNotificationItem[] = []

  switch (product) {
    case 'multiply':
    case 'borrow':
      // TODO adjust it when data source available
      // notifications.push(ajnaNotifications.timeToLiquidation({ time: '4 days' }))
      // notifications.push(ajnaNotifications.beingLiquidated(null))
      // notifications.push(ajnaNotifications.gotLiquidated(null))
      // notifications.push(ajnaNotifications.gotPartiallyLiquidated(null))
      break
    case 'earn': {
      const {
        price,
        pool: { highestThresholdPrice, mostOptimisticMatchingPrice },
        quoteTokenAmount,
      } = position as AjnaEarnPosition
      const earningNoApy = price.lt(highestThresholdPrice) && price.gt(zero)
      const depositIsNotWithdrawable = price.gt(mostOptimisticMatchingPrice)
      const emptyPosition = quoteTokenAmount.isZero()

      const moveToAdjust = () => {
        dispatch({ type: 'reset' })
        updateState('uiDropdown', 'adjust')
        updateState('uiPill', 'deposit-earn')
      }

      if (depositIsNotWithdrawable) {
        notifications.push(
          ajnaNotifications.depositIsNotWithdrawable({
            message: { collateralToken, quoteToken },
            action: moveToAdjust,
          }),
        )
      }
      if (earningNoApy) {
        notifications.push(ajnaNotifications.earningNoApy({ action: moveToAdjust }))
      }

      if (emptyPosition) {
        notifications.push(ajnaNotifications.emptyPosition({ quoteToken }))
      }

      // TODO adjust it when data source available
      // notifications.push(ajnaNotifications.lendingPriceFrozen(null))
      // notifications.push(ajnaNotifications.bucketLiquidated(null))

      break
    }
    default:
      break
  }

  return notifications
}
