import BigNumber from 'bignumber.js'
import {
  ChangeVariantType,
  ContentCardProps,
  DetailsSectionContentCard,
} from 'components/DetailsSectionContentCard'
import { formatAmount, formatCryptoBalance } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'

interface ContentCardNetValueProps {
  isLoading?: boolean
  collateralToken: string
  netValue: BigNumber
  afterNetValue?: BigNumber
  pnl: BigNumber
  showPnl: boolean
  changeVariant?: ChangeVariantType
}

export function ContentCardNetValue({
  isLoading,
  collateralToken,
  netValue,
  afterNetValue,
  pnl,
  showPnl,
  changeVariant = 'positive',
}: ContentCardNetValueProps) {
  const { t } = useTranslation()

  const formatted = {
    netValue: formatCryptoBalance(netValue),
    afterNetValue: afterNetValue && `${formatCryptoBalance(afterNetValue)} ${collateralToken}`,
    pnl: `${t('ajna.position-page.multiply.common.overview.pnl')}: $${formatAmount(pnl, 'USD')}`,
  }

  const contentCardSettings: ContentCardProps = {
    title: t('ajna.position-page.multiply.common.overview.net-value'),
    value: formatted.netValue,
    unit: collateralToken,
    change: {
      isLoading,
      value: afterNetValue && `${formatted.afterNetValue} ${t('system.cards.common.after')}`,
      variant: changeVariant,
    },
  }

  if (showPnl) {
    contentCardSettings.footnote = formatted.pnl
  }

  return <DetailsSectionContentCard {...contentCardSettings} />
}
