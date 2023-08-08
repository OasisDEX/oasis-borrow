import BigNumber from 'bignumber.js'
import {
  ChangeVariantType,
  ContentCardProps,
  DetailsSectionContentCard,
} from 'components/DetailsSectionContentCard'
import { AjnaDetailsSectionContentSimpleModal } from 'features/ajna/common/components/AjnaDetailsSectionContentSimpleModal'
import { formatCryptoBalance } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'

interface ContentCardThresholdPriceProps {
  isLoading?: boolean
  priceFormat: string
  thresholdPrice: BigNumber
  afterThresholdPrice?: BigNumber
  lup?: BigNumber
  changeVariant?: ChangeVariantType
}

export function ContentCardThresholdPrice({
  isLoading,
  priceFormat,
  thresholdPrice,
  afterThresholdPrice,
  lup,
  changeVariant = 'positive',
}: ContentCardThresholdPriceProps) {
  const { t } = useTranslation()

  const formatted = {
    thresholdPrice: formatCryptoBalance(thresholdPrice),
    afterThresholdPrice: afterThresholdPrice && formatCryptoBalance(afterThresholdPrice),
    lup: lup && formatCryptoBalance(lup),
  }

  const contentCardSettings: ContentCardProps = {
    title: t('ajna.position-page.borrow.common.overview.threshold-price'),
    value: `${formatted.thresholdPrice}`,
    unit: priceFormat,
    change: {
      isLoading,
      value: afterThresholdPrice && `${formatted.afterThresholdPrice} ${priceFormat}`,
      variant: changeVariant,
    },
    modal: (
      <AjnaDetailsSectionContentSimpleModal
        title={t('ajna.position-page.borrow.common.overview.threshold-price')}
        description={t(
          'ajna.position-page.borrow.common.overview.threshold-price-modal-desc',
        )}
        value={`${formatted.lup} ${lup ? priceFormat : ''}`}
      />
    ),
  }

  if (lup) {
    contentCardSettings.footnote = `LUP: ${formatted.lup} ${priceFormat}`
  }

  return <DetailsSectionContentCard {...contentCardSettings} />
}
