import BigNumber from 'bignumber.js'
import {
  ChangeVariantType,
  ContentCardProps,
  DetailsSectionContentCard,
} from 'components/DetailsSectionContentCard'
import { formatDecimalAsPercent } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'

interface ContentCardLoanToValueProps {
  isLoading?: boolean
  loanToValue: BigNumber
  afterLoanToValue?: BigNumber
  liquidationThreshold: BigNumber
  changeVariant?: ChangeVariantType
}

export function ContentCardLoanToValue({
  isLoading,
  loanToValue,
  afterLoanToValue,
  liquidationThreshold,
  changeVariant = 'positive',
}: ContentCardLoanToValueProps) {
  const { t } = useTranslation()

  const formatted = {
    loanToValue: formatDecimalAsPercent(loanToValue),
    afterLoanToValue: afterLoanToValue && formatDecimalAsPercent(afterLoanToValue),
    liquidationThreshold: liquidationThreshold && formatDecimalAsPercent(liquidationThreshold),
  }

  const contentCardSettings: ContentCardProps = {
    title: t('ajna.position-page.borrow.common.overview.loan-to-value'),
    value: `${formatted.loanToValue}`,
    change: {
      isLoading,
      value: afterLoanToValue && `${formatted.afterLoanToValue} ${t('system.cards.common.after')}`,
      variant: changeVariant,
    },
    footnote: t('ajna.position-page.borrow.common.overview.liquidation-threshold', {
      liquidationThreshold: formatted.liquidationThreshold,
    }),
  }

  return <DetailsSectionContentCard {...contentCardSettings} />
}
