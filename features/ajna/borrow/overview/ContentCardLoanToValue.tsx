import BigNumber from 'bignumber.js'
import {
  ChangeVariantType,
  ContentCardProps,
  DetailsSectionContentCard,
} from 'components/DetailsSectionContentCard'
import { formatPercent } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'

interface ContentCardLoanToValueProps {
  loanToValue: BigNumber
  afterLoanToValue?: BigNumber
  changeVariant?: ChangeVariantType
}

export function ContentCardLoanToValue({
  loanToValue,
  afterLoanToValue,
  changeVariant = 'positive',
}: ContentCardLoanToValueProps) {
  const { t } = useTranslation()

  const formatted = {
    loanToValue: formatPercent(loanToValue, { precision: 2 }),
    afterLoanToValue: afterLoanToValue && formatPercent(afterLoanToValue, { precision: 2 }),
  }

  const contentCardSettings: ContentCardProps = {
    title: t('ajna.borrow.common.overview.loan-to-value'),
    value: `${formatted.loanToValue}`,
  }

  if (afterLoanToValue !== undefined)
    contentCardSettings.change = {
      value: `${formatted.afterLoanToValue} ${t('system.cards.common.after')}`,
      variant: changeVariant,
    }

  return <DetailsSectionContentCard {...contentCardSettings} />
}
