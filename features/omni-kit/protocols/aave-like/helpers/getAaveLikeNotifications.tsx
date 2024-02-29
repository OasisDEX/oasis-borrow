import type { DetailsSectionNotificationItem } from 'components/DetailsSectionNotification'
import type { AaveHistoryEvent } from 'features/omni-kit/protocols/aave-like/history/types'
import { OmniProductType } from 'features/omni-kit/types'

export function getAaveLikeNotifications({
  productType,
}: {
  auction?: AaveHistoryEvent
  productType: OmniProductType
}) {
  const notifications: DetailsSectionNotificationItem[] = []

  switch (productType) {
    case OmniProductType.Borrow:
    case OmniProductType.Multiply:
    case OmniProductType.Earn: {
      break
    }
    default:
      break
  }

  return notifications
}
