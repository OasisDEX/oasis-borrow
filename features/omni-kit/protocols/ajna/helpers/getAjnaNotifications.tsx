import type { AjnaEarnPosition, AjnaPosition } from '@oasisdex/dma-library'
import type { DetailsSectionNotificationItem } from 'components/DetailsSectionNotification'
import { AppLink } from 'components/Links'
import { LUPPercentageOffset } from 'features/omni-kit/protocols/ajna/constants'
import type {
  AjnaBorrowishPositionAuction,
  AjnaEarnPositionAuction,
  AjnaPositionAuction,
} from 'features/omni-kit/protocols/ajna/observables'
import type { AjnaGenericPosition, AjnaUpdateState } from 'features/omni-kit/protocols/ajna/types'
import type { OmniBorrowFormActions, OmniBorrowFormState } from 'features/omni-kit/state/borrow'
import type { OmniEarnFormActions, OmniEarnFormState } from 'features/omni-kit/state/earn'
import type {
  OmniMultiplyFormActions,
  OmniMultiplyFormState,
} from 'features/omni-kit/state/multiply'
import type { OmniNotificationCallbackWithParams } from 'features/omni-kit/types'
import { OmniEarnFormAction, OmniProductType, OmniSidebarEarnPanel } from 'features/omni-kit/types'
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

type EarningNoApyParams = {
  action?: () => void
}

type EmptyPositionParams = {
  quoteToken: string
}

type LendingPriceFrozenParams = {
  quoteToken: string
}

const ajnaNotifications: {
  beingLiquidated: OmniNotificationCallbackWithParams<null>
  collateralToWithdraw: OmniNotificationCallbackWithParams<null>
  earningNoApy: OmniNotificationCallbackWithParams<EarningNoApyParams>
  emptyPosition: OmniNotificationCallbackWithParams<EmptyPositionParams>
  gotLiquidated: OmniNotificationCallbackWithParams<null>
  lendingPriceFrozen: OmniNotificationCallbackWithParams<LendingPriceFrozenParams>
  safetySwichOpen: OmniNotificationCallbackWithParams<null>
  safetySwichManage: OmniNotificationCallbackWithParams<null>
  nearLup: OmniNotificationCallbackWithParams<null>
  aboveLup: OmniNotificationCallbackWithParams<null>
} = {
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
  dispatch,
  isOpening,
  isOracless,
  position,
  positionAuction,
  productType,
  quoteToken,
  updateState,
}: {
  ajnaSafetySwitchOn: boolean
  isOpening: boolean
  position: AjnaGenericPosition
  positionAuction: AjnaPositionAuction
  quoteToken: string
  dispatch:
    | Dispatch<OmniBorrowFormActions>
    | Dispatch<OmniEarnFormActions>
    | Dispatch<OmniMultiplyFormActions>
  updateState:
    | AjnaUpdateState<OmniBorrowFormState>
    | AjnaUpdateState<OmniEarnFormState>
    | AjnaUpdateState<OmniMultiplyFormState>
  productType: OmniProductType
  isOracless: boolean
}) {
  const notifications: DetailsSectionNotificationItem[] = []

  if (ajnaSafetySwitchOn) {
    notifications.push(
      isOpening
        ? ajnaNotifications.safetySwichOpen(null)
        : ajnaNotifications.safetySwichManage(null),
    )
  }

  switch (productType) {
    case OmniProductType.Borrow:
    case OmniProductType.Multiply:
      const borrowishPositionAuction = positionAuction as AjnaBorrowishPositionAuction
      const borrowishPosition = position as AjnaPosition

      if (borrowishPositionAuction.isBeingLiquidated) {
        notifications.push(ajnaNotifications.beingLiquidated(null))
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
    case OmniProductType.Earn: {
      if (!isOpening) {
        const {
          price,
          pool: { lowestUtilizedPrice, highestThresholdPrice },
          quoteTokenAmount,
        } = position as AjnaEarnPosition
        const earningNoApy =
          price.lt(highestThresholdPrice) && price.lt(lowestUtilizedPrice) && price.gt(zero)

        const earnPositionAuction = positionAuction as AjnaEarnPositionAuction
        const emptyPosition =
          quoteTokenAmount.isZero() && !earnPositionAuction.isCollateralToWithdraw

        const moveToAdjust = () => {
          dispatch({ type: 'reset' })
          updateState('uiDropdown', OmniSidebarEarnPanel.Adjust)
          updateState('uiPill', OmniEarnFormAction.DepositEarn)
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
