import BigNumber from 'bignumber.js'
import type { SecondaryVariantType } from 'components/infoSection/Item'
import { InfoSectionWithGradient } from 'components/InfoSectionWithGradient'
import { useRefinanceContext } from 'features/refinance/contexts'
import { RefinanceOptions } from 'features/refinance/types'
import { formatDecimalAsPercent } from 'helpers/formatters/format'
import { zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import React from 'react'

export const RefinanceHighlightedChangeSection = () => {
  const { t } = useTranslation()

  const {
    poolData: { maxLtv },
    position: { isShort, borrowRate },
    form: {
      state: { strategy, refinanceOption },
    },
  } = useRefinanceContext()

  if (!refinanceOption) {
    throw new Error('Refinance option not defined')
  }

  const borrowCost = new BigNumber(borrowRate)

  const afterBorrowCost = new BigNumber(strategy?.fee || zero)
  const afterMaxLtv = new BigNumber(strategy?.maxLtv || zero)
  const afterMaxMultiple = new BigNumber(strategy?.maxMultiply || zero)

  const formatted = {
    borrowCost: formatDecimalAsPercent(borrowCost),
    afterBorrowCost: formatDecimalAsPercent(afterBorrowCost),
    borrowCostChange: formatDecimalAsPercent(afterBorrowCost.minus(borrowCost)),

    maxLtv: formatDecimalAsPercent(maxLtv.loanToValue),
    afterMaxLtv: formatDecimalAsPercent(afterMaxLtv),
    maxMultiple: `${maxLtv.multiple.toFixed(2)}x`,
    afterMaxMultiple: `${afterMaxMultiple.toFixed(2)}x`,
  }

  const title = {
    [RefinanceOptions.LOWER_COST]: 'lowering-borrowing-cost',
    [RefinanceOptions.HIGHER_LTV]: 'increase-to-higher-ltv',
    [RefinanceOptions.CHANGE_DIRECTION]: 'change-direction',
    [RefinanceOptions.SWITCH_TO_EARN]: 'switch-to-earn',
  }[refinanceOption]

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
        label: t('strategy'),
        value: !isShort ? t('long') : t('short'),
        change: isShort ? t('long') : t('short'),
      },
    ],
    [RefinanceOptions.SWITCH_TO_EARN]: [
      // For now just use lending info since apys are not available yet
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
  }[refinanceOption]

  return (
    <InfoSectionWithGradient
      title={t(`refinance.sidebar.whats-changing.highlighted.${title}`, {
        value: isShort ? t('long') : t('short'),
      })}
      items={items}
    />
  )
}
