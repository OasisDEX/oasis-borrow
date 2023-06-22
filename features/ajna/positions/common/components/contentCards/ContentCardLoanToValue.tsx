import BigNumber from 'bignumber.js'
import {
  ChangeVariantType,
  ContentCardProps,
  DetailsSectionContentCard,
} from 'components/DetailsSectionContentCard'
import { AjnaDetailsSectionContentSimpleModal } from 'features/ajna/common/components/AjnaDetailsSectionContentSimpleModal'
import { formatDecimalAsPercent } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'

interface ContentCardLoanToValueProps {
  isLoading?: boolean
  loanToValue: BigNumber
  afterLoanToValue?: BigNumber
  dynamicMaxLtv?: BigNumber
  changeVariant?: ChangeVariantType
}

export function ContentCardLoanToValue({
  isLoading,
  loanToValue,
  afterLoanToValue,
  dynamicMaxLtv,
  changeVariant = 'positive',
}: ContentCardLoanToValueProps) {
  const { t } = useTranslation()

  const formatted = {
    loanToValue: formatDecimalAsPercent(loanToValue),
    afterLoanToValue: afterLoanToValue && formatDecimalAsPercent(afterLoanToValue),
    dynamicMaxLtv: dynamicMaxLtv && formatDecimalAsPercent(dynamicMaxLtv),
  }

  const contentCardSettings: ContentCardProps = {
    title: t('ajna.position-page.borrow.common.overview.loan-to-value'),
    value: `${formatted.loanToValue}`,
    change: {
      isLoading,
      value: afterLoanToValue && `${formatted.afterLoanToValue} ${t('system.cards.common.after')}`,
      variant: changeVariant,
    },
    footnote:
      dynamicMaxLtv &&
      t('ajna.position-page.borrow.common.overview.dynamic-max-ltv', {
        dynamicMaxLtv: formatted.dynamicMaxLtv,
      }),
    modal: (
      <AjnaDetailsSectionContentSimpleModal
        title={t('ajna.position-page.borrow.common.overview.loan-to-value')}
        description={t('ajna.position-page.borrow.common.overview.loan-to-value-modal-desc')}
        value={formatted.loanToValue}
      />
    ),
  }

  return <DetailsSectionContentCard {...contentCardSettings} />
}
