import type BigNumber from 'bignumber.js'
import type { ContentCardProps } from 'components/DetailsSectionContentCard'
import { DetailsSectionContentCard } from 'components/DetailsSectionContentCard'
import type { OmniContentCardCommonProps } from 'features/omni-kit/components/details-section/types'
import { formatFiatBalance } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'

interface ContentCardNetValueProps extends OmniContentCardCommonProps {
  afterNetValue?: BigNumber
  netValue: BigNumber
  pnl: BigNumber
  pnlNotAvailable?: boolean
  showPnl: boolean
}

export function OmniContentCardNetValue({
  afterNetValue,
  changeVariant,
  isLoading,
  netValue,
  pnl,
  pnlNotAvailable = false,
  showPnl,
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
