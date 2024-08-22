import type { DetailsSectionNotificationItem } from 'components/DetailsSectionNotification'
import type { MorphoHistoryEvent } from 'features/omni-kit/protocols/morpho-blue/history/types'
import type { OmniNotificationCallbackWithParams } from 'features/omni-kit/types'
import { OmniProductType } from 'features/omni-kit/types'
import { coins_cross } from 'theme/icons'

const makerNotifications: {
  gotLiquidated: OmniNotificationCallbackWithParams<null>
} = {
  gotLiquidated: () => ({
    title: {
      translationKey: 'morpho.position-page.common.notifications.got-liquidated.title',
    },
    message: {
      translationKey: 'morpho.position-page.common.notifications.got-liquidated.message',
    },
    icon: coins_cross,
    type: 'error',
    closable: true,
  }),
}

export function getMakerNotifications({
  auction,
  productType,
}: {
  auction?: MorphoHistoryEvent
  productType: OmniProductType
}) {
  const notifications: DetailsSectionNotificationItem[] = []

  switch (productType) {
    case OmniProductType.Borrow:
    case OmniProductType.Multiply:
      if (auction) {
        notifications.push(makerNotifications.gotLiquidated(null))
      }
      break
    case OmniProductType.Earn: {
      break
    }
    default:
      break
  }

  return notifications
}
