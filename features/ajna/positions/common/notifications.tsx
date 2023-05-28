import { AjnaEarnPosition } from '@oasisdex/dma-library'
import { DetailsSectionNotificationItem } from 'components/DetailsSectionNotification'
import { AppLink } from 'components/Links'
import { AjnaGenericPosition, AjnaProduct, AjnaUpdateState } from 'features/ajna/common/types'
import {
  AjnaBorrowFormAction,
  AjnaBorrowFormState,
} from 'features/ajna/positions/borrow/state/ajnaBorrowFormReducto'
import {
  AjnaBorrowishPositionAuction,
  AjnaEarnPositionAuction,
  AjnaPositionAuction,
} from 'features/ajna/positions/common/observables/getAjnaPositionAuction'
import {
  AjnaEarnFormAction,
  AjnaEarnFormState,
} from 'features/ajna/positions/earn/state/ajnaEarnFormReducto'
import {
  AjnaMultiplyFormAction,
  AjnaMultiplyFormState,
} from 'features/ajna/positions/multiply/state/ajnaMultiplyFormReducto'
import { EXTERNAL_LINKS } from 'helpers/applicationLinks'
import { zero } from 'helpers/zero'
import { Trans } from 'next-i18next'
import React, { Dispatch, FC } from 'react'

interface AjnaLiquidationNotificationWithLinkProps {
  translationKey: string
  values?: { [key: string]: string }
}

const AjnaLiquidationNotificationWithLink: FC<AjnaLiquidationNotificationWithLinkProps> = ({
  translationKey,
  values,
}) => (
  <Trans
    i18nKey={translationKey}
    values={values}
    components={[
      <AppLink
        sx={{ fontSize: 'inherit', color: 'inherit', fontWeight: 'regular' }}
        // TODO update link to ajna liquidations once available
        href={EXTERNAL_LINKS.KB.HELP}
      />,
    ]}
  />
)

type PriceAboveMompParams = {
  message: { collateralToken: string; quoteToken: string }
  action: () => void
}

type EarningNoApyParams = {
  action?: () => void
}

type EmptyPositionParams = {
  quoteToken: string
}

type TimeToLiquidationParams = {
  time: string
}

type LendingPriceFrozenParams = {
  quoteToken: string
}

type NotificationCallbackWithParams<P> = (params: P) => DetailsSectionNotificationItem

const ajnaNotifications: {
  priceAboveMomp: NotificationCallbackWithParams<PriceAboveMompParams>
  earningNoApy: NotificationCallbackWithParams<EarningNoApyParams>
  emptyPosition: NotificationCallbackWithParams<EmptyPositionParams>
  timeToLiquidation: NotificationCallbackWithParams<TimeToLiquidationParams>
  beingLiquidated: NotificationCallbackWithParams<null>
  gotLiquidated: NotificationCallbackWithParams<null>
  gotPartiallyLiquidated: NotificationCallbackWithParams<null>
  lendingPriceFrozen: NotificationCallbackWithParams<LendingPriceFrozenParams>
  collateralToWithdraw: NotificationCallbackWithParams<null>
} = {
  priceAboveMomp: ({ action, message }) => ({
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
      component: (
        <AjnaLiquidationNotificationWithLink translationKey="ajna.position-page.common.notifications.being-liquidated.message" />
      ),
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
      component: (
        <AjnaLiquidationNotificationWithLink translationKey="ajna.position-page.common.notifications.got-liquidated.message" />
      ),
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
      component: (
        <AjnaLiquidationNotificationWithLink translationKey="ajna.position-page.common.notifications.got-partially-liquidated.message" />
      ),
    },
    icon: 'coins_cross',
    type: 'error',
    closable: true,
  }),
  lendingPriceFrozen: ({ quoteToken }) => ({
    title: {
      translationKey: 'ajna.position-page.earn.manage.notifications.lending-price-frozen.title',
    },
    message: {
      component: (
        <AjnaLiquidationNotificationWithLink
          translationKey="ajna.position-page.earn.manage.notifications.lending-price-frozen.message"
          values={{ quoteToken }}
        />
      ),
    },
    icon: 'coins_cross',
    type: 'error',
    closable: true,
  }),
  collateralToWithdraw: () => ({
    title: {
      translationKey: 'ajna.position-page.earn.manage.notifications.collateral-to-withdraw.title',
    },
    message: {
      component: (
        <AjnaLiquidationNotificationWithLink translationKey="ajna.position-page.earn.manage.notifications.collateral-to-withdraw.message" />
      ),
    },
    icon: 'coins_cross',
    type: 'error',
    closable: true,
  }),
}

export function getAjnaNotifications({
  position,
  positionAuction,
  collateralToken,
  quoteToken,
  dispatch,
  updateState,
  product,
}: {
  position: AjnaGenericPosition
  positionAuction: AjnaPositionAuction
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
      const borrowishPositionAuction = positionAuction as AjnaBorrowishPositionAuction

      if (borrowishPositionAuction.isDuringGraceTime) {
        notifications.push(
          ajnaNotifications.timeToLiquidation({
            time: borrowishPositionAuction.graceTimeRemaining,
          }),
        )
      }

      if (borrowishPositionAuction.isBeingLiquidated) {
        notifications.push(ajnaNotifications.beingLiquidated(null))
      }

      if (borrowishPositionAuction.isPartiallyLiquidated) {
        notifications.push(ajnaNotifications.gotPartiallyLiquidated(null))
      }

      if (borrowishPositionAuction.isLiquidated) {
        notifications.push(ajnaNotifications.gotLiquidated(null))
      }
      break
    case 'earn': {
      const {
        price,
        pool: { highestThresholdPrice, mostOptimisticMatchingPrice },
        quoteTokenAmount,
      } = position as AjnaEarnPosition
      const earningNoApy = price.lt(highestThresholdPrice) && price.gt(zero)
      const priceAboveMomp = price.gt(mostOptimisticMatchingPrice)
      const emptyPosition = quoteTokenAmount.isZero()
      const earnPositionAuction = positionAuction as AjnaEarnPositionAuction

      const moveToAdjust = () => {
        dispatch({ type: 'reset' })
        updateState('uiDropdown', 'adjust')
        updateState('uiPill', 'deposit-earn')
      }

      if (priceAboveMomp) {
        notifications.push(
          ajnaNotifications.priceAboveMomp({
            message: { collateralToken, quoteToken },
            action: moveToAdjust,
          }),
        )
      }
      if (earningNoApy) {
        notifications.push(
          ajnaNotifications.earningNoApy({
            action: !quoteTokenAmount.isZero() ? moveToAdjust : undefined,
          }),
        )
      }

      if (emptyPosition) {
        notifications.push(ajnaNotifications.emptyPosition({ quoteToken }))
      }

      if (earnPositionAuction.isBucketFrozen) {
        notifications.push(ajnaNotifications.lendingPriceFrozen({ quoteToken }))
      }

      if (earnPositionAuction.isCollateralToWithdraw) {
        notifications.push(ajnaNotifications.collateralToWithdraw(null))
      }

      break
    }
    default:
      break
  }

  return notifications
}
