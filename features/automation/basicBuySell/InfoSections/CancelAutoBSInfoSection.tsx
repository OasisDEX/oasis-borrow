import BigNumber from 'bignumber.js'
import { InfoSection } from 'components/infoSection/InfoSection'
import { BasicBSFormChange } from 'features/automation/protection/common/UITypes/basicBSFormChange'
import { formatAmount, formatPercent } from 'helpers/formatters/format'
import { useFeatureToggle } from 'helpers/useFeatureToggle'
import { useTranslation } from 'next-i18next'
import React, { ReactNode } from 'react'

interface CancelAutoBSInfoSectionProps {
  collateralizationRatio: BigNumber
  liquidationPrice: BigNumber
  debt: BigNumber
  estimatedTransactionCost: ReactNode
  title: string
  basicBSState: BasicBSFormChange
}

export function CancelAutoBSInfoSection({
  collateralizationRatio,
  liquidationPrice,
  debt,
  estimatedTransactionCost,
  title,
  basicBSState,
}: CancelAutoBSInfoSectionProps) {
  const { t } = useTranslation()
  const isDebtZero = debt.isZero()
  const readOnlyBasicBSEnabled = useFeatureToggle('ReadOnlyBasicBS')

  const liquidationPriceFormatted = formatAmount(liquidationPrice, 'USD')
  const collateralizationRatioFormatted = formatPercent(collateralizationRatio.times(100), {
    precision: 2,
  })
  const ratioToPerformSellFormatted = formatPercent(basicBSState.execCollRatio, { precision: 2 })
  const colRatioAfterSellFormatted = formatPercent(basicBSState.targetCollRatio, { precision: 2 })

  return (
    <InfoSection
      title={title}
      items={[
        ...(isDebtZero || readOnlyBasicBSEnabled
          ? [
              {
                label: t('auto-sell.target-col-ratio-each-sell'),
                value: colRatioAfterSellFormatted,
                secondaryValue: '0%',
              },
              {
                label: t('auto-sell.trigger-col-ratio-to-perfrom-sell'),
                value: ratioToPerformSellFormatted,
                secondaryValue: '0%',
              },
            ]
          : [
              {
                label: t('system.collateral-ratio'),
                value: collateralizationRatioFormatted,
              },
              {
                label: t('system.liquidation-price'),
                value: `$${liquidationPriceFormatted}`,
              },
            ]),
        {
          label: t('auto-sell.estimated-transaction-cost'),
          value: estimatedTransactionCost,
        },
      ]}
    />
  )
}
