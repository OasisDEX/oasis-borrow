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

interface ContentCardLUPProps {
  isLoading?: boolean
  priceFormat: string
  lup?: BigNumber
  afterLup?: BigNumber
  changeVariant?: ChangeVariantType
}

export function ContentCardLUP({
  isLoading,
  priceFormat,
  lup,
  afterLup,
  changeVariant = 'positive',
}: ContentCardLUPProps) {
  const { t } = useTranslation()

  const formatted = {
    lup: lup ? formatCryptoBalance(lup) : 'n/a',
    afterLup: lup && afterLup && formatCryptoBalance(afterLup),
  }

  const contentCardSettings: ContentCardProps = {
    title: t('ajna.position-page.borrow.common.overview.lowest-utilization-price'),
    value: `${formatted.lup}`,
    ...(lup && {
      unit: priceFormat,
    }),
    change: {
      isLoading,
      value: afterLup && `${formatted.afterLup} ${priceFormat}`,
      variant: changeVariant,
    },
    modal: (
      <AjnaDetailsSectionContentSimpleModal
        title={t('ajna.position-page.borrow.common.overview.lowest-utilization-price')}
        description={t(
          'ajna.position-page.borrow.common.overview.lowest-utilization-price-modal-desc',
        )}
        value={`${formatted.lup} ${lup ? priceFormat : ''}`}
      />
    ),
  }

  return <DetailsSectionContentCard {...contentCardSettings} />
}
