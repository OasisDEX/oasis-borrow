import BigNumber from 'bignumber.js'
import { DetailsSectionContentCard } from 'components/DetailsSectionContentCard'
import { formatDecimalAsPercent } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'

const getLTVRatioColor = (ratio: BigNumber) => {
  const critical = new BigNumber(5)
  const warning = new BigNumber(20)

  switch (true) {
    case ratio.isLessThanOrEqualTo(critical):
      return 'critical10'
    case ratio.isLessThanOrEqualTo(warning):
      return 'warning10'
    default:
      return 'success10'
  }
}

interface ContentCardLtvProps {
  loanToValue: BigNumber
  liquidationThreshold: BigNumber
  afterLoanToValue?: BigNumber
}

export function ContentCardLtv({
  loanToValue,
  liquidationThreshold,
  afterLoanToValue,
}: ContentCardLtvProps) {
  const { t } = useTranslation()

  return (
    <DetailsSectionContentCard
      title={t('system.loan-to-value')}
      value={formatDecimalAsPercent(loanToValue)}
      change={
        afterLoanToValue && {
          variant: afterLoanToValue.lt(loanToValue) ? 'negative' : 'positive',
          value: `${formatDecimalAsPercent(afterLoanToValue)} ${t('after')}`,
        }
      }
      footnote={`${t('manage-earn-vault.liquidation-threshold', {
        percentage: formatDecimalAsPercent(liquidationThreshold),
      })}`}
      customBackground={
        !afterLoanToValue
          ? getLTVRatioColor(liquidationThreshold.minus(loanToValue).times(100))
          : 'transparent'
      }
    />
  )
}
