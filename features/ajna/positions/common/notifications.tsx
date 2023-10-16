import type { AjnaEarnPosition, AjnaPosition } from '@oasisdex/dma-library'
import type { DetailsSectionNotificationItem } from 'components/DetailsSectionNotification'
import { AppLink } from 'components/Links'
import { LUPPercentageOffset } from 'features/ajna/common/consts'
import type { AjnaGenericPosition, AjnaUpdateState } from 'features/ajna/common/types'
import type {
  BorrowFormAction,
  BorrowFormState,
} from 'features/ajna/positions/borrow/state/borrowFormReducto.types'
import type {
  AjnaBorrowishPositionAuction,
  AjnaEarnPositionAuction,
  AjnaPositionAuction,
} from 'features/ajna/positions/common/observables/getAjnaPositionAggregatedData'
import type {
  EarnFormAction,
  EarnFormState,
} from 'features/ajna/positions/earn/state/earnFormReducto.types'
import type {
  MultiplyFormAction,
  MultiplyFormState,
} from 'features/ajna/positions/multiply/state/multiplyFormReducto.types'
import type { ProtocolFlow, ProtocolProduct } from 'features/unifiedProtocol/types'
import { EXTERNAL_LINKS } from 'helpers/applicationLinks'
import { one, zero } from 'helpers/zero'
import { Trans } from 'next-i18next'
import type { Dispatch, FC } from 'react'
import React from 'react'
import { coins_cross, liquidation } from 'theme/icons'

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
  beingLiquidated: NotificationCallbackWithParams<null>
  collateralToWithdraw: NotificationCallbackWithParams<null>
  earningNoApy: NotificationCallbackWithParams<EarningNoApyParams>
  emptyPosition: NotificationCallbackWithParams<EmptyPositionParams>
  gotLiquidated: NotificationCallbackWithParams<null>
  gotPartiallyLiquidated: NotificationCallbackWithParams<null>
  lendingPriceFrozen: NotificationCallbackWithParams<LendingPriceFrozenParams>
  priceAboveMomp: NotificationCallbackWithParams<PriceAboveMompParams>
  safetySwichOpen: NotificationCallbackWithParams<null>
  safetySwichManage: NotificationCallbackWithParams<null>
  timeToLiquidation: NotificationCallbackWithParams<TimeToLiquidationParams>
  nearLup: NotificationCallbackWithParams<null>
  aboveLup: NotificationCallbackWithParams<null>
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
    icon: coins_cross,
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
    icon: coins_cross,
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
    icon: coins_cross,
    type: 'warning',
    closable: true,
  }),
  timeToLiquidation: ({ time }) => ({
    title: {
      translationKey: 'ajna.position-page.common.notifications.time-to-liquidation.title',
      params: { time },
    },
    message: {
      component: (
        <Trans
          i18nKey="ajna.position-page.common.notifications.time-to-liquidation.message"
          components={{
            1: <strong />,
          }}
        />
      ),
    },
    icon: coins_cross,
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
    icon: coins_cross,
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
    icon: coins_cross,
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
    icon: coins_cross,
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
    icon: coins_cross,
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
    icon: coins_cross,
    type: 'error',
    closable: true,
  }),
  safetySwichOpen: () => ({
    title: {
      translationKey: 'ajna.position-page.common.notifications.safety-switch-open.title',
    },
    message: {
      component: (
        <Trans
          i18nKey={'ajna.position-page.common.notifications.safety-switch-open.message'}
          components={[
            <AppLink
              sx={{ fontSize: 'inherit', color: 'inherit' }}
              href={EXTERNAL_LINKS.DISCORD}
            />,
          ]}
        />
      ),
    },
    icon: liquidation,
    type: 'error',
  }),
  safetySwichManage: () => ({
    title: {
      translationKey: 'ajna.position-page.common.notifications.safety-switch-manage.title',
    },
    message: {
      component: (
        <Trans
          i18nKey={'ajna.position-page.common.notifications.safety-switch-manage.message'}
          components={[
            <AppLink
              sx={{ fontSize: 'inherit', color: 'inherit' }}
              href={EXTERNAL_LINKS.DISCORD}
            />,
          ]}
        />
      ),
    },
    icon: liquidation,
    type: 'error',
  }),
  nearLup: () => ({
    title: {
      translationKey: 'ajna.position-page.common.notifications.near-lup.title',
    },
    message: {
      translationKey: 'ajna.position-page.common.notifications.near-lup.message',
    },
    icon: coins_cross,
    type: 'warning',
    closable: true,
  }),
  aboveLup: () => ({
    title: {
      translationKey: 'ajna.position-page.common.notifications.above-lup.title',
    },
    message: {
      translationKey: 'ajna.position-page.common.notifications.above-lup.message',
    },
    icon: coins_cross,
    type: 'error',
    closable: true,
  }),
}

export function getAjnaNotifications({
  ajnaSafetySwitchOn,
  flow,
  position,
  positionAuction,
  collateralToken,
  quoteToken,
  dispatch,
  updateState,
  product,
  isOracless,
}: {
  ajnaSafetySwitchOn: boolean
  flow: ProtocolFlow
  position: AjnaGenericPosition
  positionAuction: AjnaPositionAuction
  collateralToken: string
  quoteToken: string
  dispatch:
    | Dispatch<BorrowFormAction>
    | Dispatch<EarnFormAction>
    | Dispatch<MultiplyFormAction>
  updateState:
    | AjnaUpdateState<BorrowFormState>
    | AjnaUpdateState<EarnFormState>
    | AjnaUpdateState<MultiplyFormState>
  product: ProtocolProduct
  isOracless: boolean
}) {
  const notifications: DetailsSectionNotificationItem[] = []

  if (ajnaSafetySwitchOn) {
    notifications.push(
      flow === 'open'
        ? ajnaNotifications.safetySwichOpen(null)
        : ajnaNotifications.safetySwichManage(null),
    )
  }

  switch (product) {
    case 'multiply':
    case 'borrow':
      const borrowishPositionAuction = positionAuction as AjnaBorrowishPositionAuction
      const borrowishPosition = position as AjnaPosition

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

      if (
        borrowishPosition.thresholdPrice.gt(
          borrowishPosition.pool.lowestUtilizedPrice.times(one.minus(LUPPercentageOffset)),
        ) &&
        isOracless
      ) {
        notifications.push(ajnaNotifications.nearLup(null))
      }

      if (
        borrowishPosition.thresholdPrice.gt(borrowishPosition.pool.lowestUtilizedPrice) &&
        isOracless
      ) {
        notifications.push(ajnaNotifications.aboveLup(null))
      }

      break
    case 'earn': {
      if (flow === 'manage') {
        const {
          price,
          pool: { highestThresholdPrice, mostOptimisticMatchingPrice },
          quoteTokenAmount,
        } = position as AjnaEarnPosition
        const earningNoApy = price.lt(highestThresholdPrice) && price.gt(zero)
        const priceAboveMomp = price.gt(mostOptimisticMatchingPrice)
        const earnPositionAuction = positionAuction as AjnaEarnPositionAuction
        const emptyPosition =
          quoteTokenAmount.isZero() && !earnPositionAuction.isCollateralToWithdraw

        const moveToAdjust = () => {
          dispatch({ type: 'reset' })
          updateState('uiDropdown', 'adjust')
          updateState('uiPill', 'deposit-earn')
        }

        if (priceAboveMomp && !isOracless) {
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
      }

      break
    }
    default:
      break
  }

  return notifications
}
