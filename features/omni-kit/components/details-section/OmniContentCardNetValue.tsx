import type BigNumber from 'bignumber.js'
import type { ChangeVariantType, ContentCardProps } from 'components/DetailsSectionContentCard'
import { DetailsSectionContentCard } from 'components/DetailsSectionContentCard'
import { formatFiatBalance } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'

interface ContentCardNetValueProps {
  isLoading?: boolean
  netValue: BigNumber
  afterNetValue?: BigNumber
  pnl: BigNumber
  pnlNotAvailable?: boolean
  showPnl: boolean
  changeVariant?: ChangeVariantType
}

export function OmniContentCardNetValue({
  isLoading,
  netValue,
  afterNetValue,
  pnl,
  pnlNotAvailable = false,
  showPnl,
  changeVariant = 'positive',
}: ContentCardNetValueProps) {
  const { t } = useTranslation()

  const formatted = {
    netValue: formatFiatBalance(netValue),
    afterNetValue: afterNetValue && `${formatFiatBalance(afterNetValue)} USD`,
    pnl: `${t('ajna.position-page.multiply.common.overview.pnl')}: ${
      pnlNotAvailable ? 'n/a' : `$${formatFiatBalance(pnl)}`
    }`,
  }

  // TODO remove ajna translation dependency
  const contentCardSettings: ContentCardProps = {
    title: t('ajna.position-page.multiply.common.overview.net-value'),
    value: formatted.netValue,
    unit: 'USD',
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
