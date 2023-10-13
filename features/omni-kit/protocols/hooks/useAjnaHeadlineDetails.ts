import type { HeadlineDetailsProp } from 'components/vault/VaultHeadlineDetails'
import type { AjnaGenericPosition } from 'features/ajna/common/types'
import { useOmniKitContext } from 'features/omni-kit/contexts/OmniKitContext'
import { OmniKitProductType } from 'features/omni-kit/types'
import { formatCryptoBalance, formatDecimalAsPercent } from 'helpers/formatters/format'
import { useTranslation } from 'react-i18next'

interface AjnaHeadlineDetailsProps {
  position: AjnaGenericPosition
}

export function useAjnaHeadlineDetails({
  position,
}: AjnaHeadlineDetailsProps): HeadlineDetailsProp[] {
  const { t } = useTranslation()

  const {
    environment: {
      collateralPrice,
      collateralToken,
      isOracless,
      isShort,
      productType,
      priceFormat,
      quotePrice,
    },
  } = useOmniKitContext()

  return [
    ...(productType === OmniKitProductType.Earn
      ? [
          {
            label: t('ajna.position-page.earn.common.headline.current-yield'),
            value: position.pool.lendApr ? formatDecimalAsPercent(position.pool.lendApr) : '-',
          },
        ]
      : []),
    ...(productType === OmniKitProductType.Earn && 'poolApy' in position
      ? [
          {
            label: t('ajna.position-page.earn.common.headline.30-day-avg'),
            value: position.poolApy.per30d ? formatDecimalAsPercent(position.pool.lendApr) : '-',
          },
        ]
      : []),
    ...(!isOracless
      ? [
          {
            label: t('ajna.position-page.common.headline.current-market-price', {
              collateralToken,
            }),
            value: `${formatCryptoBalance(
              isShort ? quotePrice.div(collateralPrice) : collateralPrice.div(quotePrice),
            )} ${priceFormat}`,
          },
        ]
      : []),
  ]
}
