import BigNumber from 'bignumber.js'
import {
  ChangeVariantType,
  ContentCardProps,
  DetailsSectionContentCard,
} from 'components/DetailsSectionContentCard'
import { formatCryptoBalance } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'

interface ContentCardLUPProps {
  isLoading?: boolean
  lup?: BigNumber
  changeVariant?: ChangeVariantType
}

export function ContentCardLUP({ lup }: ContentCardLUPProps) {
  const { t } = useTranslation()

  const formatted = {
    lup: lup ? formatCryptoBalance(lup) : 'n/a',
  }

  const contentCardSettings: ContentCardProps = {
    title: t('ajna.position-page.borrow.common.overview.lowest-utilization-price'),
    value: `${formatted.lup}`,
  }

  return <DetailsSectionContentCard {...contentCardSettings} />
}
