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
import { Dispatch } from 'react'

type DepositIsNotWithdrawableParams = {
  message: { collateralToken: string; quoteToken: string }
  action: () => void
}

type EarningNoApyParams = {
  action: () => void
}

type NotificationCallbackWithParams<P> = (
  params: P,
  action?: () => void,
) => DetailsSectionNotificationItem

const ajnaNotifications: {
  depositIsNotWithdrawable: NotificationCallbackWithParams<DepositIsNotWithdrawableParams>
  earningNoApy: NotificationCallbackWithParams<EarningNoApyParams>
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
      break
    case 'earn': {
      const {
        price,
        pool: { highestThresholdPrice, mostOptimisticMatchingPrice },
      } = position as AjnaEarnPosition
      const earningNoApy = price.lt(highestThresholdPrice)
      const depositIsNotWithdrawable = price.gt(mostOptimisticMatchingPrice)

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

      break
    }
    default:
      break
  }

  return notifications
}
