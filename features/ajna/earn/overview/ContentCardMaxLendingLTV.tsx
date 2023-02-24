import BigNumber from 'bignumber.js'
import {
  ChangeVariantType,
  ContentCardProps,
  DetailsSectionContentCard,
} from 'components/DetailsSectionContentCard'
import { formatAmount, formatPercent } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'

interface ContentCardMaxLendingLTVProps {
  quoteToken: string
  maxLendingPercentage: BigNumber
  afterMaxLendingPercentage?: BigNumber
  maxLendingQuote: BigNumber
  changeVariant?: ChangeVariantType
}

export function ContentCardMaxLendingLTV({
  quoteToken,
  maxLendingPercentage,
  afterMaxLendingPercentage,
  maxLendingQuote,
  changeVariant = 'positive',
}: ContentCardMaxLendingLTVProps) {
  const { t } = useTranslation()

  const formatted = {
    maxLendingPercentage: formatPercent(maxLendingPercentage, { precision: 2 }),
    afterMaxLendingPercentage:
      afterMaxLendingPercentage && formatPercent(afterMaxLendingPercentage, { precision: 2 }),
    maxLendingQuote: `$${formatAmount(maxLendingQuote, quoteToken)} ${quoteToken}`,
  }

  const contentCardSettings: ContentCardProps = {
    title: t('ajna.earn.manage.overview.max-lending-ltv'),
    value: formatted.maxLendingPercentage,
  }

  if (!maxLendingQuote.isZero()) {
    contentCardSettings.footnote = formatted.maxLendingQuote
  }

  if (afterMaxLendingPercentage !== undefined)
    contentCardSettings.change = {
      value: `${formatted.afterMaxLendingPercentage} ${t('system.cards.common.after')}`,
      variant: changeVariant,
    }

  return <DetailsSectionContentCard {...contentCardSettings} />
}
