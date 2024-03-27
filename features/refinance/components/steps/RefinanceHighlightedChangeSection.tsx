import BigNumber from 'bignumber.js'
import { InfoSectionWithGradient } from 'components/InfoSectionWithGradient'
import { RefinanceOptions } from 'features/refinance/types'
import { formatDecimalAsPercent } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'

export const RefinanceHighlightedChangeSection = () => {
  const { t } = useTranslation()

  const borrowCost = new BigNumber(0.0145)
  const afterBorrowCost = new BigNumber(0.0125)
  const option = RefinanceOptions.LOWER_COST

  const formatted = {
    borrowCost: formatDecimalAsPercent(borrowCost),
    afterBorrowCost: formatDecimalAsPercent(afterBorrowCost),
    borrowCostChange: formatDecimalAsPercent(borrowCost.minus(afterBorrowCost)),
  }

  const title = {
    [RefinanceOptions.LOWER_COST]: 'lowering-borrowing-cost',
    [RefinanceOptions.HIGHER_LTV]: 'increase-to-higher-ltv',
    [RefinanceOptions.CHANGE_DIRECTION]: 'change-direction',
    [RefinanceOptions.SWITCH_TO_EARN]: 'switch-to-earn',
  }[option]

  return (
    <InfoSectionWithGradient
      title={t(`refinance.sidebar.whats-changing.highlighted.${title}`)}
      items={[
        {
          label: t('system.borrow-cost'),
          value: formatted.borrowCost,
          change: formatted.afterBorrowCost,
          secondary: {
            value: formatted.borrowCostChange,
            variant: 'positive',
          },
        },
      ]}
    />
  )
}
