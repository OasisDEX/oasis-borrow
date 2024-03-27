import BigNumber from 'bignumber.js'
import type { SecondaryVariantType } from 'components/infoSection/Item'
import { InfoSectionWithGradient } from 'components/InfoSectionWithGradient'
import { RefinanceOptions } from 'features/refinance/types'
import { formatDecimalAsPercent } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'

export const RefinanceHighlightedChangeSection = () => {
  const { t } = useTranslation()

  const borrowCost = new BigNumber(0.0145)
  const afterBorrowCost = new BigNumber(0.0125)

  const maxLtv = new BigNumber(0.7)
  const afterMaxLtv = new BigNumber(0.8)
  const maxMultiple = new BigNumber(1.2)
  const afterMaxMultiple = new BigNumber(3.2)

  const option = RefinanceOptions.LOWER_COST

  const formatted = {
    borrowCost: formatDecimalAsPercent(borrowCost),
    afterBorrowCost: formatDecimalAsPercent(afterBorrowCost),
    borrowCostChange: formatDecimalAsPercent(borrowCost.minus(afterBorrowCost)),

    maxLtv: formatDecimalAsPercent(maxLtv),
    afterMaxLtv: formatDecimalAsPercent(afterMaxLtv),
    maxMultiple: `${maxMultiple.toFixed(2)}x`,
    afterMaxMultiple: `${afterMaxMultiple.toFixed(2)}x`,
  }

  const title = {
    [RefinanceOptions.LOWER_COST]: 'lowering-borrowing-cost',
    [RefinanceOptions.HIGHER_LTV]: 'increase-to-higher-ltv',
    [RefinanceOptions.CHANGE_DIRECTION]: 'change-direction',
    [RefinanceOptions.SWITCH_TO_EARN]: 'switch-to-earn',
  }[option]

  const items = {
    [RefinanceOptions.LOWER_COST]: [
      {
        label: t('system.borrow-cost'),
        value: formatted.borrowCost,
        change: formatted.afterBorrowCost,
        secondary: {
          value: formatted.borrowCostChange,
          variant: 'positive' as SecondaryVariantType,
        },
      },
    ],
    [RefinanceOptions.HIGHER_LTV]: [
      {
        label: t('max-ltv'),
        value: formatted.maxLtv,
        change: formatted.afterMaxLtv,
      },
      {
        label: t('system.max-multiple'),
        value: formatted.maxMultiple,
        change: formatted.afterMaxMultiple,
      },
    ],
    // designs not ready
    [RefinanceOptions.CHANGE_DIRECTION]: [
      {
        label: 'TBD',
        value: 'TBD',
      },
    ],
    [RefinanceOptions.SWITCH_TO_EARN]: [
      {
        label: 'TBD',
        value: 'TBD',
      },
    ],
  }[option]

  return (
    <InfoSectionWithGradient
      title={t(`refinance.sidebar.whats-changing.highlighted.${title}`)}
      items={items}
    />
  )
}
