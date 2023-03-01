import BigNumber from 'bignumber.js'
import { DetailsSectionNotificationItem } from 'components/DetailsSectionNotification'
import { AjnaBorrowFormAction } from 'features/ajna/borrow/state/ajnaBorrowFormReducto'
import { AjnaBorrowUpdateState, AjnaEarnUpdateState, AjnaProduct } from 'features/ajna/common/types'
import { AjnaEarnFormAction } from 'features/ajna/earn/state/ajnaEarnFormReducto'
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
      translationKey: 'ajna.earn.manage.notifications.deposit-is-not-withdrawable.title',
    },
    message: {
      translationKey: 'ajna.earn.manage.notifications.deposit-is-not-withdrawable.message',
      params: message,
    },
    icon: 'coins_cross',
    type: 'error',
    closable: true,
    link: {
      translationKey: 'ajna.earn.manage.notifications.deposit-is-not-withdrawable.label',
      action,
    },
  }),
  earningNoApy: ({ action }) => ({
    title: {
      translationKey: 'ajna.earn.manage.notifications.earning-no-apy.title',
    },
    message: {
      translationKey: 'ajna.earn.manage.notifications.earning-no-apy.message',
    },
    icon: 'coins_cross',
    type: 'warning',
    closable: true,
    link: {
      translationKey: 'ajna.earn.manage.notifications.earning-no-apy.label',
      action,
    },
  }),
}

type NotificationEarnParams = {
  price: BigNumber
  htp: BigNumber
  momp: BigNumber
}

// TODO added for now just to test typescript
type NotificationBorrowParams = {
  param1: BigNumber
  param2: BigNumber
  param3: BigNumber
}

type NotificationParams = NotificationBorrowParams | NotificationEarnParams

export function getAjnaNotifications({
  params,
  collateralToken,
  quoteToken,
  dispatch,
  updateState,
  product,
}: {
  params: NotificationParams
  collateralToken: string
  quoteToken: string
  dispatch: Dispatch<AjnaBorrowFormAction> | Dispatch<AjnaEarnFormAction>
  updateState: AjnaBorrowUpdateState | AjnaEarnUpdateState
  product: AjnaProduct
}) {
  const notifications: DetailsSectionNotificationItem[] = []

  switch (product) {
    case 'multiply':
    case 'borrow':
      break
    case 'earn': {
      const { price, htp, momp } = params as NotificationEarnParams
      const earningNoApy = price.lt(htp)
      const depositIsNotWithdrawable = price.gt(momp)

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
