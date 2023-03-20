import BigNumber from 'bignumber.js'
import {
  ChangeVariantType,
  ContentCardProps,
  DetailsSectionContentCard,
} from 'components/DetailsSectionContentCard'
import { formatPercent } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'

interface ContentCardMaxLendingLTVProps {
  isLoading?: boolean
  maxLendingPercentage: BigNumber
  afterMaxLendingPercentage?: BigNumber
  changeVariant?: ChangeVariantType
}

export function ContentCardMaxLendingLTV({
  isLoading,
  maxLendingPercentage,
  afterMaxLendingPercentage,
  changeVariant = 'positive',
}: ContentCardMaxLendingLTVProps) {
  const { t } = useTranslation()

  const formatted = {
    maxLendingPercentage: formatPercent(maxLendingPercentage, { precision: 2 }),
    afterMaxLendingPercentage:
      afterMaxLendingPercentage && formatPercent(afterMaxLendingPercentage, { precision: 2 }),
  }

  const contentCardSettings: ContentCardProps = {
    title: t('ajna.position-page.earn.manage.overview.max-lending-ltv'),
    value: formatted.maxLendingPercentage,
    change: {
      isLoading,
      value:
        afterMaxLendingPercentage &&
        `${formatted.afterMaxLendingPercentage} ${t('system.cards.common.after')}`,
      variant: changeVariant,
    },
  }

  return <DetailsSectionContentCard {...contentCardSettings} />
}
