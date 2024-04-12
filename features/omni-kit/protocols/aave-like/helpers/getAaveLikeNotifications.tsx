import type { DetailsSectionNotificationItem } from 'components/DetailsSectionNotification'
import { mapTrailingStopLossFromLambda } from 'features/aave/manage/helpers/map-trailing-stop-loss-from-lambda'
import type { AaveLikeHistoryEvent } from 'features/omni-kit/protocols/aave-like/history/types'
import { OmniProductType } from 'features/omni-kit/types'
import { formatCryptoBalance } from 'helpers/formatters/format'
import type { GetTriggersResponse } from 'helpers/lambda/triggers'
import { nbsp } from 'helpers/nbsp'
import { bell } from 'theme/icons'

export function getAaveLikeNotifications({
  productType,
  triggers,
  priceFormat,
}: {
  auction?: AaveLikeHistoryEvent
  productType: OmniProductType
  triggers?: GetTriggersResponse
  priceFormat: string
}) {
  const notifications: DetailsSectionNotificationItem[] = []

  switch (productType) {
    case OmniProductType.Borrow:
    case OmniProductType.Multiply:
      const mappedLambdaData = mapTrailingStopLossFromLambda(triggers?.triggers)
      const executionPrice = mappedLambdaData?.dynamicParams?.executionPrice
      const originalExecutionPrice = mappedLambdaData?.dynamicParams?.originalExecutionPrice
      if (executionPrice && originalExecutionPrice && executionPrice.gt(originalExecutionPrice)) {
        return [
          {
            title: {
              translationKey: 'automation.trailing-stop-loss-execution-price-increased',
              params: {
                executionPriceAndToken: `${formatCryptoBalance(
                  executionPrice,
                )}${nbsp}${priceFormat}`,
                originalExecutionPriceAndToken: `${formatCryptoBalance(
                  originalExecutionPrice,
                )}${nbsp}${priceFormat}`,
                delta: `+${formatCryptoBalance(executionPrice.minus(originalExecutionPrice))}`,
                token: priceFormat,
              },
            },
            sessionStorageParam: formatCryptoBalance(executionPrice),
            closable: true,
            icon: bell,
          },
        ]
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
